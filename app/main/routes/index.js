
/*!
 * Module dependencies.
 */

// Note: We can require users, articles and other cotrollers because we have
// set the NODE_PATH to be ./app/controllers (package.json # scripts # start)

//var users = require('../app/users/controllers/users');
 var main = require('../controllers/index');
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

  // home route
  //app.get('/', verts.index);

  // article routes
  // app.param('id', articles.load);
  // app.get('/vert/:id', articles.show);
  /**
   * Error handling
   */
  // home route
  app.get('/', main.index);

  app.use(function (err, req, res, next) {
    // treat as 404
    if (err.message
      && (~err.message.indexOf('not found')
      || (~err.message.indexOf('Cast to ObjectId failed')))) {
      return next();
    }
    console.error(err.stack);
    // error page
    
    res.status(500).render(__dirname+'/../views/500', { error: err.stack });
  });

  // assume 404 since no middleware responded
  app.use(function (req, res, next) {
    res.status(404).render(__dirname+'/../views/404', {
      url: req.originalUrl,
      error: 'Not found'
    });
  });
}
