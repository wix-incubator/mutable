import {lifecycleContract} from '../lifecycle.contract.spec.js';
import Typorama from '../../src';
import {UserType} from './builders';

var lifeCycleAsserter = lifecycleContract();
lifeCycleAsserter.addFixture(
    (...elements) => Typorama.Array.of(UserType).create(elements),
    () => new UserType(),
    'array with mutable elements'
);
lifeCycleAsserter.addFixture(
    (...elements) => Typorama.Array.of(Typorama.Number).create(elements),
    () => Math.random(),
    'array with primitives'
);

export default lifeCycleAsserter;