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
    var geoData = await geocode('mapbox.places', inputs.address);
    // TODO is it right to just pick the first one?
    var coords = geoData.features[0].center;

    var variables = {
      longitude: coords[0],
      latitude: coords[1]
    };
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
    var osRes = await client.request(query, variables);
    var data = osRes.people.edges;

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

    // Parallelization
    var senatePromise = Senator.findOrCreate({ name: senate.name }, senate);
    var assemblyPromise = Assemblyperson.findOrCreate({ name: assembly.name }, assembly);

    return {
      senator: await senatePromise,
      assemblyperson: await assemblyPromise
    };
  }

};
