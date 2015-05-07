
/*!
 * Module dependencies.
 */

// Note: We can require users, articles and other cotrollers because we have
// set the NODE_PATH to be ./app/controllers (package.json # scripts # start)

//var users = require('../app/users/controllers/users');
var verts = require('../controllers/verts');
var express = require('express');
var config = require('../../../config/config');

// var comments = require('../app/controllers/comments');
// var tags = require('../app/controllers/tags');
//var auth = require('../../../config/middlewares/authorization');

/**
 * Expose routes
 */

module.exports = function (app, passport, auth) {

  /**
   * Route middlewares
   */

  var articleAuth = [auth.requiresLogin, auth.article.hasAuthorization];
  var commentAuth = [auth.requiresLogin, auth.comment.hasAuthorization];

  app.get('/', verts.index);

  //app.use('/verts',express.static('./public'));


  // article routes
  // app.param('id', articles.load);
  // app.get('/vert/:id', articles.show);
  /**
   * Error handling
   */

}
