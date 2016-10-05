# Mutable
[![npm version](https://badge.fury.io/js/mutable.svg)](https://badge.fury.io/js/mutable)

Mutable state containers in javascript with dirty checking and more

### What Mutable does
Mutable is a javascript state management library designed with [React](https://github.com/facebook/react) in mind.
It allows for simple implementation of ```shouldComponentUpdate``` by efficiently tracking state changes while avoiding the verbosity involved with using immutable data.
In addition, Mutable enhances React components by offering a unique runtime schema engine that enforces [unidirectional data flow](https://facebook.github.io/flux/),
and formalizes the structure of props and state.
Mutable also supports default or even non-nullable types.

## Using mutable
Add Mutable to your project by installing it with [npm](https://www.npmjs.com/):

```bash
npm install mutable --save
```

Simple code example:
```es6
import * as Mutable from 'mutable';

// define a Mutable type by providing a name and a spec
const Dude = Mutable.define('Dude', {
    spec: ()=>({
        name: Mutable.String.withDefault('Leon'),
        age: Mutable.Number.withDefault(110),
        address: Mutable.String.withDefault('no address')
    })
});
 
// Mutable types accept custom data according to their spec as the first argument of their constructor
const dude = new Dude({name:'Ido'});
 
// Mutable instances behave just like ordinary javascript objects
console.log(dude.name); // prints: 'Ido'
console.log(dude.age); // prints: 110
 
// Mutable instances behave just like ordinary javascript objects
dude.name = 'Tom';
console.log(dude.name); // prints: 'Tom'
 
 
// Mutable keeps track of the state of the application by an internal revision counter.
// changes to Mutable instances are indexed by the revision in which they occur.
 
// advance the revision counter. Subsequent state changes will register to the new revision.
Mutable.revision.advance();
 
// read the current revision
const firstRevision = Mutable.revision.read();
// no changes has been made to dude since firstRevision started
console.log(dude.$isDirty(firstRevision)); // prints: false
 
// advance the revision counter
Mutable.revision.advance();

// change the state of the dude
dude.age = dude.age + 1;

// the dude instance has been changed since first revision
console.log(dude.$isDirty(firstRevision)); // prints: true
 
// advance revision
Mutable.revision.advance();
// define newRevision to point to the latest revision
const newRevision = Mutable.revision.read();
 
// the dude instance has not been changed since newRevision
console.log(dude.$isDirty(newRevision)); // prints: false
```
Integrating mutable into React components is up to the user.

### how to build and test locally from source
Clone this project locally.
Then, at the root folder of the project, run:
```shell
npm install
npm test
```
### how to run local continous test feedback
At the root folder of the project, run:
```shell
npm start
```
Then, open your browser at http://localhost:8080/webtest.bundle
and see any changes you make in tests or code reflected in the browser

### Versioning
Currently Mutable is in alpha mode. As such, it does not respect semver.

### License
We use a custom license, see ```LICENSE.md```

### Similar Projects
These are examples of the kinds of libraries we would like to model ourselves after.
 - [NestedTypes](https://github.com/Volicon/NestedTypes) : High-performance model framework, which can be used as drop-in backbonejs replacement.
 - [mobx](https://github.com/mobxjs/mobx) : Simple, scalable state management
 - [alt](http://alt.js.org/) : A library that facilitates the managing of state within your JavaScript applications. It is modeled after flux.
 - [immutable.js](https://github.com/facebook/immutable-js/) : Immutable persistent data collections for Javascript which increase efficiency and simplicity
 - [cls.js](https://github.com/camel-chased/cls.js) : Easy, dynamic (kind of mixin) javascript classes
 - [observable-value](https://github.com/medikoo/observable-value): Object representation of mutable value
 
 
