var twilio = require('twilio');

var twilioConfig = sails.config.custom.twilio;
var client = twilio(twilioConfig.accountSid, twilioConfig.authToken);

var fromNumber = '+12054559874';

module.exports = {


  friendlyName: 'Send SMS',


  description: 'Send an SMS via Twilio.',


  inputs: {
    phoneNumber: {
      type: 'number',
      description: 'The phone number to send the SMS to.',
      required: true
    },
    body: {
      type: 'string',
      description: 'The body of the SMS message.',
      required: true
    }
  },


  exits: {

    success: {
      description: 'SMS successfully sent.',
    },
    error: {
      description: 'An error was encountering when submitting the SMS to Twilio.',
    }

  },


  fn: async function (inputs) {
    var msg = await client.messages.create({
      body: inputs.body,
      from: fromNumber,
      to: inputs.phoneNumber
    });

    sails.log.silly('Twilio message SID:', msg.sid);
  }
};

