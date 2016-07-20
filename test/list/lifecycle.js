import * as Mutable from '../../src';
import {lifecycleContract} from '../lifecycle.contract.spec';
import {UserType} from './builders';

var lifeCycleAsserter = lifecycleContract();
        lifeCycleAsserter.addFixture(
            (...elements) => Mutable.List.of(UserType).create(elements),
            () => new UserType(),
            'List with mutable elements'
        );
        lifeCycleAsserter.addFixture(
            (...elements) => Mutable.List.of(Mutable.Number).create(elements),
            () => Math.random(),
            'List with primitives'
        );

export default lifeCycleAsserter;
