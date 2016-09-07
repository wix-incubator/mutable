import {expect} from 'chai';

import {transaction} from 'mobx';
import Mutable from '../src';
const {transactionStart, transactionEnd, isInTransaction} = Mutable;

describe('Mobx spoon transactions', function() {

    // baseline test, to see that gs is the right way to test transaction hooks
    it('tracks native mobx transaction state', function() {
        expect(isInTransaction()).to.not.be.ok;
        let transactionDidRun = false;
        transaction(() => {
            transactionDidRun = true;
            expect(isInTransaction()).to.be.ok;
        });
        expect(isInTransaction()).to.not.be.ok;
        expect(transactionDidRun).to.eql(true);
    });

    // sanity test, to check sanity functionality and non-breakage,
    // assuming spoon is a naive clone of mobx logic (not omitting untested side-effects)
    it('Mutable\'s transactionStart, transactionEnd behave the same as mobx\'s', function() {
        expect(isInTransaction()).to.not.be.ok;
        transactionStart();
        expect(isInTransaction()).to.be.ok;
        transactionEnd();
        expect(isInTransaction()).to.not.be.ok;
    });

});

