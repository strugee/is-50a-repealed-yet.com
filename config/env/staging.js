/**
 * Staging environment settings
 * (sails.config.*)
 *
 * This is the configuration for the Heroku staging environment. It
 * inherits from the production settings to keep staging as close to
 * production as possible.
 * 
 * When running in staging, set NODE_ENV=production to ensure that
 * Sails and its dependencies still run in production mode, and set
 * sails_environment=staging to load this file. Note that even when
 * running with sails_environment=staging, the production Grunt asset
 * pipeline will still be used (the staging Grunt registration file is
 * a symlink to the production version).
 *
 */

var prodConfig = require('./production');
var ourConfig = {
  log: {
    level: 'debug'
  }
}

module.exports = Object.assign({}, prodConfig, ourConfig);
