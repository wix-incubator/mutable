import * as mu from '../../src';
import {lifecycleContract} from '../lifecycle.contract.spec';
import {UserType} from './builders';

var lifeCycleAsserter = lifecycleContract();
        lifeCycleAsserter.addFixture(
            (...elements) => mu.List.of(UserType).create(elements),
            () => new UserType(),
            'List with mu elements'
        );
        lifeCycleAsserter.addFixture(
            (...elements) => mu.List.of(mu.Number).create(elements),
            () => Math.random(),
            'List with primitives'
        );

export default lifeCycleAsserter;
