var assert = require('assert');

var mapboxGeocoding = require('mapbox-geocoding');
var GraphQLClient = require('graphql-request').GraphQLClient;
var client = new GraphQLClient('https://openstates.org/graphql', {
  headers: {
    'X-API-KEY': sails.config.custom.openStatesApiKey
  }
});

mapboxGeocoding.setAccessToken(sails.config.custom.mapboxToken);

var geocode = require('util').promisify(mapboxGeocoding.geocode);

module.exports = {


  friendlyName: 'Query OpenStates',


  description: 'Query OpenStates to get a legislator\'s contact information by address',


  inputs: {
    address: {
      type: 'string',
      required: true
    }
  },


  exits: {

    success: {
      description: 'Successfully located legislator.',
    },

  },


  fn: async function (inputs) {
    sails.log.silly('Querying Mapbox.');
    var geoData = await geocode('mapbox.places', inputs.address);
    sails.log.silly('Raw Mapbox response:', geoData);
    // TODO is it right to just pick the first one?
    var coords = geoData.features[0].center;

    var variables = {
      longitude: coords[0],
      latitude: coords[1]
    };
    sails.log.silly('Picked these coordinates to pass to OpenStates:', variables);
    var query = `query ContactInfoByLocation ($latitude:Float!, $longitude:Float!) {
      people(latitude: $latitude, longitude: $longitude, first: 10) {
        edges {
          node {
            name
            contactDetails {
              type
              value
            }
            chamber: currentMemberships(classification:["upper", "lower"]) {
              post {
                label
              }
              organization {
                name
                classification
                parent {
                  name
                }
              }
            }
          }
        }
      }
    }`;
    sails.log.silly('Querying OpenStates.');
    var osRes = await client.request(query, variables);
    sails.log.silly('OpenStates raw response:', osRes);
    var data = osRes.people.edges;

    sails.log.silly('Validating response data.');
    // We're expecting only 2 legislators
    assert.equal(data.length, 2);
    var chambers = data.map(obj => obj.node.chamber);
    // Each legislator has only one chamber
    chambers.forEach(c => assert.equal(c.length, 1));
    chambers = chambers.map(arr => arr[0]);
    // Both of them should be part of the NYS legislature
    chambers.forEach(function(chamber) {
      assert.equal(chamber.organization.parent.name, 'New York Legislature');
    });
    // And we should have one upper and one lower chamber
    assert.deepEqual(chambers.map(c => c.organization.classification).sort(), ['lower', 'upper']);
    sails.log.silly('OpenStates response validation finished successfully.');

    var assembly;
    var senate;
    data.forEach(function(person) {
      person = person.node;
      var dbPerson = {
        name: person.name,
        email: person.contactDetails.filter(obj => obj.type === 'email')[0].value,
        phone: person.contactDetails.filter(obj => obj.type === 'voice')[0].value
      };

      assert(dbPerson.email);
      assert(dbPerson.phone);

      if (person.chamber[0].organization.name === 'Senate') {
        senate = dbPerson;
      } else {
        assembly = dbPerson;
      }
    });

    sails.log.silly('Creating Senator and Assemblyperson query promises.');
    // TODO: originally these `await` keywords were below, as part of the return statement. This
    //  was to parallelize the code. However, while this worked in development, it hung in staging
    //  for some unknown reason. Fix this to be actually parallel.
    var senatePromise = await Senator.findOrCreate({ name: senate.name }, senate);
    var assemblyPromise = await Assemblyperson.findOrCreate({ name: assembly.name }, assembly);

    sails.log.silly('Returning OpenStates computed data.');
    return {
      longitude: variables.longitude,
      latitude: variables.latitude,
      senator: senatePromise,
      assemblyperson: assemblyPromise
    };
  }

};
