/**
 * `tasks/register/staging.js`
 *
 * ---------------------------------------------------------------
 *
 * This Grunt tasklist aliases the staging environment's tasklist to
 * what gets run in production.
 *
 */
module.exports = function(grunt) {
  grunt.registerTask('staging', [
    'prod'
  ]);
};

