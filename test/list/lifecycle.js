import * as Typorama from '../../src';
import {lifecycleContract} from '../lifecycle.contract.spec';
import {UserType} from './builders';

var lifeCycleAsserter = lifecycleContract();
lifeCycleAsserter.addFixture(
    (...elements) => Typorama.List.of(UserType).create(elements),
    () => new UserType(),
    'List with mutable elements'
);
lifeCycleAsserter.addFixture(
    (...elements) => Typorama.List.of(Typorama.Number).create(elements),
    () => Math.random(),
    'List with primitives'
);

export default lifeCycleAsserter;
