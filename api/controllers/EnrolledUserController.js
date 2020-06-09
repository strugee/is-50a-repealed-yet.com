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
			return res.badRequest(new Error('Invalid phone number!'));
		}

		req.body.phoneNumber = normalizedPhone[0];

		await EnrolledUser.create(req.body);

		await sails.helpers.sendSms(req.body.phoneNumber, "Thanks! You've successfully pledged with Is 50-A Repealed Yet?.");

		res.view('pages/confirmation', {name: req.body.firstName});
	}
};
