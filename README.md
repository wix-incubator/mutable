# Mutable

Mutable state containers with dirty checking and more

### What Mutable does
Mutable is a state management library designed with [React](https://github.com/facebook/react) in mind.
It supports simple implementation of ```shouldComponentUpdate``` by efficiently tracking state changes while avoiding the verbosity involved with using immutable data.
In addition, Mutable enhances React components by offering a unique runtime schema engine that enforces [unidirectional data flow](https://facebook.github.io/flux/),
and formalizes the structure of props and state.
Mutable also supports default or even non-nullable types.

## Using mutable
add mutable to your project by installing it
```npm install mutable --save```
define a Mutable type by providing a name and a spec:
```es6
import * as Mutable from 'mutable';

const Dude = Mutable.define('Dude', {
  spec: ()=>({
                 name: Mutable.String.withDefault('Leon'),
                 age: Mutable.Number.withDefault(110),
                 address: Mutable.String.withDefault('no address')
             })
});

 // Mutable types are composable, so you can build custom types out of custom Types:

const ThreeDudes = Mutable.define('ThreeDudes', {
  spec: ()=>({
                 first: Dude.withDefault({name:'Barak',  age:111}),
                 second: Dude.withDefault({name:'Jiri',  age:109}),
                 third:Dude
             })
});

 // Mutable types accept custom data as the first argument of their constructor

const troika = new ThreeDudes({third: new Dude({name:'Ido'})});
console.log(troika.first.name); // prints 'Barak'
console.log(troika.second.name); // prints 'Jiri'
console.log(troika.third.name); // prints 'Ido'

 // Mutable keeps track of the state of the application by an internal revision counter.
 // Changes to Mutable instances are indexed by the revision in which they occur:

const revision = Mutable.revision;
let rev = revision.read();
console.log(troika.$isDirty(rev)) // prints 'false' as the troika instance has not been changed since revision rev

revision.advance();

troika.first.name = 'Tom';

console.log(troika.$isDirty(rev)) // prints 'true' as the troika instance has been changed since revision rev

console.log(troika.first.name); // prints 'Tom' as expected
```

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
There are examples of the kinds of libraries we’d like to model ourselves after.
 - [mobx](https://github.com/mobxjs/mobx) : Simple, scalable state management
 - [immutable.js](https://github.com/facebook/immutable-js/) : Immutable persistent data collections for Javascript which increase efficiency and simplicity
 - [cls.js](https://github.com/camel-chased/cls.js) : Easy, dynamic (kind of mixin) javascript classes
