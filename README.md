<p align="center">
  <img src="http://i.imgur.com/pMKjQLZ.png" alt="Sigil.js logo"/>
</p>

#Kamea
Kamea is a store for producing immutable states in ES5. It was created to address a number of issues with Redux:

* Objects that aren't truly immutable
* Object.assign is super useful but also messy and not very precise
* Asynchronous operations are awkward to implement and require many actions
* Stuffing everything into a single switch statement

It has some nice features:
* entirely OOP interface
* [redux devtool extension](http://zalmoxisus.github.io/redux-devtools-extension/) support for time travel
* async state modifications without new actions
* very easily request modifications to immutable state

# Installation
CDN:
```html
<script src="https://unpkg.com/kamea@latest/dist/kamea.min.js"></script>
```

# Stores
Kamea is opinionated in how it creates stores. Often times state is broken down into domains within an application with related behavior per domain. This library makes it easy to create domains that correspond to pieces of the state:

```javascript
{
  <domain>: {
    <domain specific state>
  }
}
```

For instance

```javascript
var store = new Kamea()
store.domain("counter", {
  value: 0
})
store.domain("user", {
  firstName: "Richard",
  lastName: "Anaya"
})
```

Will create a store initialized with the data

```
// store.state will be
{
  counter: {
    value: 0
  },
  user: {
    firstName: "Richard",
    lastName: "Anaya"
  }
}
```

# Immutable data
Kamea produces immutable state on each action or commit to the store. To make these new immutable states, we must tell the store what the the next state should look like.  This library borrows heavily from a project [freezer-js](https://github.com/arqex/freezer). You can make requests for modifications in three ways.

##Value Modification
```javascript
var domain = store.domain("counter", {
  value: 0
})
domain.action("increment", function(state,action) {
  state.set("value", state.value + 1);
})
```

##Object Modification
```javascript
var domain = store.domain("user", {
  person: {
    firstName:"Richard",
    lastName:"Anaya"
  }
})
domain.action("change_name", function(state,action) {
  state.person.set("firstName", "Eric");
})
domain.action("remove_names", function(state,action) {
  state.person
    .remove("firstName")
    .remove("lastName");
})
```

##Array Modification
```javascript
var domain = store.domain("users", {
  names: ["Richard","Howard","Darryl"]
})
domain.action("change_name", function(state,action) {
  state.names.
    .push( "Jack" ) // ["Richard","Howard","Darryl","Jack"]
    .pop() // ["Richard","Howard","Darryl"]
    .unshift( 'Justin' ) // ["Justin","Richard","Howard","Darryl"]
    .shift() // ["Richard","Howard","Darryl"]
    .splice( 1, 1, 'Veronica', 'Shams') // ["Richard","Veronica","Shams","Darryl"]
})
```

# Counter

```javascript
var store = new Kamea()
var domain = store.domain("counter", {
  value: 0
})
domain.action("increment", function(state,action) {
  state.set("value", state.value + 1);
})
domain.action("decrement", function(state,action) {
  state.set("value", state.value - 1);
})
domain.action("increment_async", function(state,action,commit) {
  setTimeout(function(){
    commit(function(state){
      state.set("value", state.value + 1);
    })
  },1000)
})

console.log(store.state.counter.value)

store.subscribe(function() {
  console.log(store.state.counter.value)
})

store.dispatch({type:"increment"})
store.dispatch({type:"decrement"})
store.dispatch({type:"increment_async"})
```
