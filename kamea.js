var Freezer = require('freezer-js');

function Domain(name,store){
	this._name = name;
	this._actions = {};
  this._store = store;
	this.state = store.state[name];
	this._commit = this._commit.bind(this);
}

Domain.prototype._commit = function(action,fn){
	this._store.state[this._name].transact();
	fn(this._store.state[this._name],this._store.state);
	this._store.state[this._name].run();
	this._store._commit({type:"$$ASYNC:"+action.type});
}

Domain.prototype.dispatch = function(action){
  if(this._actions[action.type]){
		this._store.state[this._name].transact();
    this._actions[action.type](this._store.state[this._name],action,(fn)=>this._commit(action,fn),this._store.state);
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

	if(window && window.__REDUX_DEVTOOLS_EXTENSION__){
    this._devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect();
    this._devTools.subscribe(this._onDevToolMessage.bind(this));
  }
}

Kamea.prototype._onDevToolMessage = function(message){
	if (message.type === 'START') {
    this._devToolStarted = true;
    var state = this.getState();
    this._devTools.init(state)
  } else if (message.type === 'STOP') {
    this._devToolStarted = false;
  } else if (message.type === 'DISPATCH' && message.payload.type === "JUMP_TO_STATE") { // Received a store action from Dispatch monitor
    this.setState(JSON.parse(message.state));
  }
}

Kamea.prototype._notifyDevToolActionState = function(action,state){
	if (!this._devToolStarted) return;
	this._devTools.send(action, state);
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

Kamea.prototype._commit = function(action){
	this.state.run();
	var newState = this._freezer.get();
	if(this.state != newState){
		this._notifyDevToolActionState(action,newState);
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
		this._commit(action);
  }
}

Kamea.prototype.getState = function(){
	return this._freezer.get();
}

Kamea.prototype.setState = function(state){
	this._freezer.set(state);
	this._publishNewState(this._freezer.get());
}

module.exports = Kamea;
