/**
npm * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

var React = require('react');

var TodoApp = require('./components/TodoApp.react');

// React.render(
//   <TodoApp />,
//   document.getElementById('todoapp')
// );

var About = React.createClass({
  render: function () {
    return <h2>About</h2>;
  }
});

var Inbox = React.createClass({
  render: function () {
    return <h2>Inbox</h2>;
  }
});

var Home = React.createClass({
  render: function () {
    return <div>
    		<a href="#inbox">Inbox</a>
    		<TodoApp />
    	   </div>;
    	   
  }
});

var Router = require('react-router');
var Route = Router.Route;

// declare our routes and their hierarchy
var routes = (
  <Route handler={App}>
    <Route path="about" handler={About}/>
    <Route path="inbox" handler={Inbox}/>
    <Route path="/" handler={Home}/>

  </Route>
);

var RouteHandler = Router.RouteHandler;

var App = React.createClass({
  render () {
    return (
      <div>
        <h1>App</h1>
        <RouteHandler/>
      </div>
    )
  }
});

Router.run(routes, Router.HashLocation, function(Root){
  React.render(<Root/>, document.getElementById('todoapp'));
});