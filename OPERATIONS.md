# Operational guidelines

Some random notes on how to operate a website based on this codebase.

Note for folks deploying this on their own: this is not legal advice.

## Database provisioning

Run `sails_models__migrate=alter sails lift` with `NODE_ENV` unset in production, _once_. This will create the schema. After that, do manual migrations.

## Short code application

As soon as you go live, you should consider applying for a [Twilio short code](https://www.twilio.com/docs/glossary/what-is-a-short-code). According to Twilio sending "more than a few hundred messages a day" runs the risk of your texts being marked as spam, and the way to fix this is to move to using a short code. But short codes take 8-12 weeks to provision due to the carrier application process. You can't do it beforehand because the website has to be live before you can apply, so your consent flow can be audited.

Note: this option costs a ton of money.
