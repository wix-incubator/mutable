import * as Typorama from '../../src';
import {lifecycleContract} from '../lifecycle.contract.spec';
import {UserType} from './builders';

    const lifeCycleAsserter = lifecycleContract();
        lifeCycleAsserter.addFixture(
            (key, val) => Typorama.Map.of(UserType, UserType).create([[key, val]]),
            () => new UserType(),
            'map with mutable keys and values'
        );

        lifeCycleAsserter.addFixture(
            (key, val) => Typorama.Map.of(Typorama.Number, Typorama.Number).create([[key, val]]),
            () => Math.random(),
            'map with primitive keys and values'
        );

export default lifeCycleAsserter;
