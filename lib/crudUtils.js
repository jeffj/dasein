/**
 * Very basic CRUD route creation utility for models.
 * For validation, simply override the model's save method.
 */

(function (exports) {

  "use strict";

  function errMsg(msg) {
    return {'error': {'message': msg.toString()}};
  }

  //------------------------------
  // List
  //
  function getListController(model) {
    return function (req, res) {
      //console.log('list', req.body);
      model.find({}, function (err, result) {
        if (!err) {
          res.send(result);
        } else {
          res.send(errMsg(err));
        }
      });
    };
  }

  //------------------------------
  // Create
  //
  function getCreateController(model) {
    return function (req, res) {
      //console.log('create', req.body);
      var m = new model(req.body);
      m.user = req.user;
      m.save(function (err) {
        if (!err) {
          res.send(m);
        } else {
          res.send(errMsg(err));
        }
      });
    };
  }

  //------------------------------
  // Read
  //
  function getReadController(model) {
    return function (req, res) {
      //console.log('read', req.body);
      model.findById(req.params.id, function (err, result) {
        if (!err) {
          res.send(result);
        } else {
          res.send(errMsg(err));
        }
      });
    };
  }

  //------------------------------
  // Update
  //
  function getUpdateController(model) {
    return function (req, res) {
      //console.log('update', req.body);
      model.findById(req.params.id, function (err, result) {
        if (!result.user || result.user.id!==req.user.id){ // running user auth
            res.status(401).send({'error': {'message': 'Not Authorized'}});        
        } else {
          var key;
          for (key in req.body) {
            result[key] = req.body[key];
          }
          result.save(function (err) {
            if (!err) {
              res.send(result);
            } else {
              res.send(errMsg(err));
            }
          });      
        }//if else end
      });
    };
  }

  //------------------------------
  // Delete
  //
  function getDeleteController(model) {
    return function (req, res) {
      //console.log('delete', req.body);
      model.findById(req.params.id, function (err, result) {
        if (err) {
          res.send(errMsg(err));
        } else if (!result.user || result.user.id!==req.user.id){
          res.status(401).send({'error': {'message': 'Not Authorized'}});
        } else {
          result.remove();
          result.save(function (err) {
            if (!err) {
              res.send({});
            } else {
              res.send(errMsg(err));
            }
          });
        }
      });
    };
  }

  exports.initRoutesForModel = function (app, model, auth, path) {

    if (!app || !model) {
      console.log('No app or model not starting crud api')
      return false;
    }

    if (!path){path="/"};
    var pathWithId = path + '/:id';

    app.get(path, getListController(model));
    app.post(path, auth.requiresLogin, getCreateController(model));
    app.get(pathWithId, getReadController(model));
    app.put(pathWithId, auth.requiresLogin, getUpdateController(model));
    app.delete(pathWithId, auth.requiresLogin, getDeleteController(model));
  };

}(exports));