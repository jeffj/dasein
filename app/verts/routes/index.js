
/*!
 * Module dependencies.
 */

// Note: We can require users, articles and other cotrollers because we have
// set the NODE_PATH to be ./app/controllers (package.json # scripts # start)

var verts = require('../controllers/verts');
var express = require('express');
var config = require('../../../config/config');

var mongoose = require('mongoose')
var crudUtils = require('../../../lib/crudUtils');
var verts = mongoose.model('Verts');

// var comments = require('../app/controllers/comments');
// var tags = require('../app/controllers/tags');
var auth = require('../../../config/middlewares/authorization');

/**
 * Expose routes
 */

module.exports = function (app, passport, auth) {

  /**
   * Route middlewares
   */

  crudUtils.initRoutesForModel(app, verts, auth, '/verts')
  
}
