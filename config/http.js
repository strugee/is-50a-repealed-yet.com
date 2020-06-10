/**
 * HTTP Server Settings
 * (sails.config.http)
 *
 * Configuration for the underlying HTTP server in Sails.
 * (for additional recommended settings, see `config/env/production.js`)
 *
 * For more information on configuration, check out:
 * https://sailsjs.com/config/http
 */

var hsts = require('hsts');
var Sentry = require('@sentry/node');
// TODO this is a hack because `sails` isn't defined yet
Sentry.init({ dsn: require('./env/production').custom.sentry.dsn });
// TODO same
var hstsConfig = require('./env/production').custom.hsts;

module.exports.http = {

  /****************************************************************************
  *                                                                           *
  * Sails/Express middleware to run for every HTTP request.                   *
  * (Only applies to HTTP requests -- not virtual WebSocket requests.)        *
  *                                                                           *
  * https://sailsjs.com/documentation/concepts/middleware                     *
  *                                                                           *
  ****************************************************************************/

  middleware: {

    /***************************************************************************
    *                                                                          *
    * The order in which middleware should be run for HTTP requests.           *
    * (This Sails app's routes are handled by the "router" middleware below.)  *
    *                                                                          *
    ***************************************************************************/

     order: [
       'sentryRequest',
       'secure',
       'hsts',
       'cookieParser',
       'session',
       'bodyParser',
       'compress',
       'poweredBy',
       'router',
       'www',
       'favicon',
       'sentryError'
     ],


    /***************************************************************************
    *                                                                          *
    * The body parser that will handle incoming multipart HTTP requests.       *
    *                                                                          *
    * https://sailsjs.com/config/http#?customizing-the-body-parser             *
    *                                                                          *
    ***************************************************************************/

    // bodyParser: (function _configureBodyParser(){
    //   var skipper = require('skipper');
    //   var middlewareFn = skipper({ strict: true });
    //   return middlewareFn;
    // })(),

    // Sentry error tracking
    sentryRequest: Sentry.Handlers.requestHandler(),
    sentryError: Sentry.Handlers.errorHandler(),

    // HTTPS redirection
    // I reviewed a concering number of middleware modules on npm that got this wrong - trusting `X-Forwarded-Proto` without Express `trust proxy` enabled, ignoring `X-Forwarded-Proto` even when `trust proxy` was enabled, not using permanent redirects, etc.
    // Eventually I just decided to write my own, which I know I can do correctly, rather than review npm modules. It was faster this way.
    secure: function(req, res, next) {
      if (!req.secure && sails.config.custom.forceHTTPS) {
        return res.redirect(301, 'https://' + req.hostname + req.originalUrl);
      }
      next();
    },

    // HTTP Strict Transport Security
    hsts: (function() {
      return hsts(hstsConfig);
    })()

  },

};
