/**
 * Staging environment settings
 * (sails.config.*)
 *
 * This is the configuration for the Heroku staging environment. It
 * inherits from the production settings to keep staging as close to
 * production as possible.
 * 
 * When running in staging, NODE_ENV=production is set to ensure that
 * Sails and its dependencies still run in production mode, and set
 * sails_environment=staging to load this file. Note that even when
 * running with sails_environment=staging, the production Grunt asset
 * pipeline will still be used (the staging Grunt registration file is
 * an alias to the production version).
 *
 */

// This should be set in the environment anyway in the real staging, because things before this will miss it
// This is only here to make `sails lift --staging` closer to the real thing
process.env.NODE_ENV = 'production';

var prodConfig = require('./production');
var ourConfig = {
  log: {
    level: 'debug'
  }
}

module.exports = Object.assign({}, prodConfig, ourConfig);
