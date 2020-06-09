/**
 * EnrolledUserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

var phone = require('phone');

module.exports = {
	create: async function (req, res) {
		var normalizedPhone = phone(req.body.phoneNumber);
		if (normalizedPhone.length === 0) {
			// Parse failure; phone is invalid
			// TODO show a nicer error to the user
			return res.badRequest(new Error('Invalid phone number!'));
		}

		var locationInfo = await sails.helpers.queryOpenstates(req.body.address);

		var computedData = {
			resolvedLatitude: locationInfo.latitude,
			resolvedLongitude: locationInfo.longitude,
			senator: locationInfo.senator.id,
			assemblyperson: locationInfo.assemblyperson.id,
			phoneNumber: normalizedPhone[0]
		};
		var submittedData = {
			firstName: req.body.firstName,
			phoneNumber: req.body.phoneNumber,
			address: req.body.address
		};
		// TODO see if we can do this much simpler thing - possible prototype poisoning attack
		//Object.assign(req.body, computedData);
		Object.assign(submittedData, computedData);

		await EnrolledUser.create(submittedData);

		await sails.helpers.sendSms(req.body.phoneNumber, "Thanks! You've successfully pledged with Is 50-A Repealed Yet?.");

		res.view('pages/confirmation', {name: req.body.firstName, phoneNumber: computedData.phoneNumber, senatorName: locationInfo.senator.name, assemblypersonName: locationInfo.assemblyperson.name });
	}
};
