import * as Mutable from '../../src';
import {lifecycleContract} from '../lifecycle.contract.spec';
import {UserType} from './builders';

let counter = 0;
const lifeCycleAsserter = lifecycleContract();
lifeCycleAsserter.addFixture(
    (val) => Mutable.Es5Map.of(UserType).create({['k' + counter++] : val}),
    () => new UserType(),
    'es5 map with mutable values'
);

lifeCycleAsserter.addFixture(
    (val) => Mutable.Es5Map.of(Mutable.Number).create({['k' + counter++] : val}),
    () => Math.random(),
    'es5 map with primitive values'
);

export default lifeCycleAsserter;
