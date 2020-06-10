/**
 * EnrolledUserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

var phone = require('phone');

module.exports = {
	create: async function (req, res) {
		sails.log.silly('Running enrolled user controller.');

		var normalizedPhone = phone(req.body.phoneNumber);
		sails.log.silly('Computed normalized phone number:', normalizedPhone);
		if (normalizedPhone.length === 0) {
			// Parse failure; phone is invalid
			sails.log.silly('Parse failure; phone is invalid');
			// TODO show a nicer error to the user
			return res.badRequest(new Error('Invalid phone number!'));
		}

		sails.log.silly('Querying OpenStates.');
		var locationInfo = await sails.helpers.queryOpenstates(req.body.address);

		var computedData = {
			resolvedLatitude: locationInfo.latitude,
			resolvedLongitude: locationInfo.longitude,
			senator: locationInfo.senator.id,
			assemblyperson: locationInfo.assemblyperson.id,
			phoneNumber: normalizedPhone[0]
		};
		sails.log.silly('OpenStates computed data:', locationInfo);
		var submittedData = {
			firstName: req.body.firstName,
			phoneNumber: req.body.phoneNumber,
			address: req.body.address
		};
		sails.log.silly('Submitted data:', submittedData);
		// TODO see if we can do this much simpler thing - possible prototype poisoning attack
		//Object.assign(req.body, computedData);
		Object.assign(submittedData, computedData);

		sails.log.silly('Creating user.');
		await EnrolledUser.create(submittedData);

		sails.log.silly('Sending confirmation SMS.');
		await sails.helpers.sendSms(req.body.phoneNumber, "Thanks! You've successfully pledged with Is 50-A Repealed Yet?. Msg & data rates may apply. Text STOP to unsubscribe.");

		sails.log.silly('Sending confirmation page.');
		res.view('pages/confirmation', {name: req.body.firstName, phoneNumber: computedData.phoneNumber, senatorName: locationInfo.senator.name, assemblypersonName: locationInfo.assemblyperson.name });
	}
};
