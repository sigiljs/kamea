var Freezer = require('freezer-js');

function Domain(name,store){
	this._name = name;
	this._actions = {};
  this._store = store;
	this.state = store.state[name];
	this._commit = this._commit.bind(this);
}

Domain.prototype._commit = function(fn){
	this._store.state[this._name].transact();
	fn(this._store.state[this._name],this._store.state);
	this._store.state[this._name].run();
	this._store._commit();
}

Domain.prototype.dispatch = function(action){
  if(this._actions[action.type]){
		this._store.state[this._name].transact();
    this._actions[action.type](this._store.state[this._name],action,this._commit,this._store.state);
		this._store.state[this._name].run();
  }
}

Domain.prototype.action = function(name,fn){
	this._actions[name] = fn;
}

function Kamea(){
  this._freezer = new Freezer({});
  this.state = this._freezer.get();
  this._domains = {};
  this._subscribers = [];
}

Kamea.prototype._publishNewState = function(newState){
	this.state = newState;
	for(var i in this._domains){
  	this._domains[i].state = newState[i]
  }
	for(var i = 0 ; i < this._subscribers.length; i++){
		this._subscribers[i]();
	}
}

Kamea.prototype._commit = function(){
	this.state.run();
	var newState = this._freezer.get();
	if(this.state != newState){
		this._publishNewState(newState);
	}
}

Kamea.prototype.subscribe = function(fn){
	this._subscribers.push(fn);
}

Kamea.prototype.domain = function(name,initialState){
	this.state = this.state.set(name,initialState);
  var d = new Domain(name,this);
  this._domains[name] = d;
  return d;
}

Kamea.prototype.dispatch = function(action){
	for(var i in this._domains){
  	this._domains[i].dispatch(action);
		this._commit();
  }
}


module.exports = Kamea;
