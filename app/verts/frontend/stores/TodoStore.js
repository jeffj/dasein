/*
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * TodoStore
 */

var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var TodoConstants = require('../constants/TodoConstants');
var assign = require('object-assign');
var Immutable = require('immutable');
var $ = require('jquery');
var csrfTag = document.getElementById("csrf-token");
var csrfToken = csrfTag ? csrfTag.dataset.csrf:null;
var CHANGE_EVENT = 'change';
var _history = [];
var _todos = Immutable.OrderedMap();
var urlBase = '/verts/api/'

var TodoRecord = Immutable.Record({
  id : null,
  complete : false,
  text : 'A brand new thing to do!'
});

/**
 * Create a TODO item.
 * @param  {string} text The content of the TODO
 */
function create(text) {
  // Hand waving here -- not showing how this interacts with XHR or persistent
  // server-side storage.
  // Using the current timestamp + random number in place of a real id.
  $.ajax({
    method: "POST",
    url: urlBase,
    data: {text:text,_csrf:csrfToken}
  })
  .done(function( result ) {
    debugger
    _todos = _todos.set(result._id, new TodoRecord({id : result._id, text : result.text}));
    TodoStore.emitChange();
  });
}

function addHistoryEntry() {
  _history.push(_todos);
}

function goToHistory(index) {
  _todos = _history[index];
}

/**
 * Update a TODO item.
 * @param  {string} id
 * @param {object} updates An object literal containing only the data to be
 *     updated.
 */
function update(id, updates) {
  var postupdates = $.extend({_csrf:csrfToken}, updates);
  $.ajax({
    method: "PUT",
    url: urlBase+id,
    data: postupdates
  })
  .done(function( result ) {
    var id = result._id;
    delete result._id
    delete result.__v
    _todos = _todos.set(id, _todos.get(id).merge(updates));
    TodoStore.emitChange();
  });
}

function updateWithHistory(id, updates) {
  addHistoryEntry();
  update(id, updates);
}

/**
 * Update all of the TODO items with the same object.
 *     the data to be updated.  Used to mark all TODOs as completed.
 * @param  {object} updates An object literal containing only the data to be
 *     updated.

 */
function updateAll(updates) {
  addHistoryEntry();
  for (var id in _todos.toObject()) {
    update(id, updates);
  }
}
/**
 * Delete a TODO item.
 * @param  {string} id
 */
function destroy(id) {
  $.ajax({
    method: "DELETE",
    url: urlBase+id,
    data: {_csrf:csrfToken}
  })
  .done(function( msg ) {
    _todos = _todos.delete(id);
    TodoStore.emitChange();
  });

}

function destroyWithHistory(id) {
  addHistoryEntry();
  destroy(id);
}

/**
 * Delete all the completed TODO items.
 */
function destroyCompleted() {
  addHistoryEntry();
  for (var id in _todos.toObject()) {
    if (_todos.getIn([id, 'complete'])) {
      destroy(id);
    }
  }
}
var TodoStore = assign({}, EventEmitter.prototype, {

  /**
   * Tests whether all the remaining TODO items are marked as completed.
   * @return {boolean}
   */
  areAllComplete: function() {
    for (var id in _todos) {
      if (!_todos.getIn([id, 'complete'])) {
        return false;
      }
    }
    return true;
  },

  /**
   * Get the entire collection of TODOs.
   * @return {object}
   */
  getAll: function() {
    return _todos.toObject();
  },

  /**
   * Get the entire collection of from server.
   * @return {object}
   */
  fetchAll: function() {
      var that= this
      $.get(urlBase, function(results) {
        results.forEach(function(item){
           _todos = _todos.set(item._id, new TodoRecord({id : item._id, text : item.text}));
        })
        that.emitChange();
      })
  },



  getHistory : function () {
    return _history;
  },

  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },

  /**
   * @param {function} callback
   */
  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  /**
   * @param {function} callback
   */
  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }
});

// Register callback to handle all updates
AppDispatcher.register(function(action) {
  var text;

  switch(action.actionType) {
    case TodoConstants.TODO_CREATE:
      text = action.text.trim();
      if (text !== '') {
        create(text);
      }
      break;

    case TodoConstants.TODO_TOGGLE_COMPLETE_ALL:
      if (TodoStore.areAllComplete()) {
        updateAll({complete: false});
      } else {
        updateAll({complete: true});
      }
      TodoStore.emitChange();
      break;

    case TodoConstants.TODO_UNDO_COMPLETE:
      updateWithHistory(action.id, {complete: false});
      TodoStore.emitChange();
      break;

    case TodoConstants.TODO_COMPLETE:
      updateWithHistory(action.id, {complete: true});
      TodoStore.emitChange();
      break;

    case TodoConstants.TODO_HISTORY_SET:
      goToHistory(action.index);
      TodoStore.emitChange();
      break;
    case TodoConstants.TODO_UPDATE_TEXT:
      text = action.text.trim();
      if (text !== '') {
        updateWithHistory(action.id, {text: text});
      }
      TodoStore.emitChange();
      break;

    case TodoConstants.TODO_DESTROY:
      destroyWithHistory(action.id);
      TodoStore.emitChange();
      break;

    case TodoConstants.TODO_DESTROY_COMPLETED:
      destroyCompleted();
      TodoStore.emitChange();
      break;

    default:
      // no op
  }
});


module.exports = TodoStore;