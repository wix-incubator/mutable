# Mutable
[![npm version](https://badge.fury.io/js/mutable.svg)](https://badge.fury.io/js/mutable)

Mutable state containers in javascript with dirty checking and more (WIP)

### What Mutable does
Mutable is a [mobx](https://github.com/mobxjs/mobx)-compatible class system library. Mutable offers a unique runtime schema engine that enforces [unidirectional data flow](https://facebook.github.io/flux/),
and formalizes the structure of props and state.
Mutable also supports data defaults, and non-nullable types.

## Using mutable
Add Mutable to your project by installing it with [npm](https://www.npmjs.com/):

```bash
npm install mutable --save
```

Simple code example:
```es6
import * as mutable from 'mutable';
import * as mobx from 'mutable';

// define a mutable class by providing a name and a spec (class schema)
const Dude = mutable.define('Dude', {
    spec: ()=>({
        name: Mutable.String.withDefault('Leon'),
        age: Mutable.Number.withDefault(110),
        address: Mutable.String.withDefault('no address')
    })
});
 
// Mutable types accept custom data according to their spec as the first argument of their constructor
const dude = new Dude({name:'Ido'});

mobx.autorun(function () {
    console.log(dude.name + ' ' + dude.age);
});
// prints: Leon 110
dude.name = 'Mike';
// prints: Mike 110
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

