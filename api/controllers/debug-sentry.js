module.exports = {


  friendlyName: 'Debug Sentry',


  description: 'Always throw an exception to trigger HTTP 500 and submission to Sentry',


  inputs: {

  },


  exits: {

  },


  fn: async function (inputs) {

    throw new Error('An error to debug Sentry');

  }


};
