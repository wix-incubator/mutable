import * as sinon from 'sinon';
import {expect} from 'chai';

import * as mu from '../src';

describe('LifecycleManager', function() {
    var lifecycleManager;
    beforeEach('init', () => {
        lifecycleManager = new mu.LifeCycleManager();
    });
    describe('manages change', () => {
        it('.forbidChange() sets __readOnly__ to true', () => {
            lifecycleManager.__readOnly__ = false;
            lifecycleManager.forbidChange();
            expect(lifecycleManager.__readOnly__).to.be.ok;
        });
        it('.allowChange() sets __readOnly__ to false', () => {
            lifecycleManager.__readOnly__ = true;
            lifecycleManager.allowChange();
            expect(lifecycleManager.__readOnly__).not.to.be.ok;
        });
    });
    describe('manages tracking', () => {
        it('.forbidTracking() sets __tracked__ to false', () => {
            lifecycleManager.__tracked__ = true;
            lifecycleManager.forbidTracking();
            expect(lifecycleManager.__tracked__).not.to.be.ok;
        });
        it('.alowTracking() sets __readOnly__ to true', () => {
            lifecycleManager.__tracked__ = false;
            lifecycleManager.alowTracking();
            expect(lifecycleManager.__tracked__).to.be.ok;
        });
    });
    describe('.$bindAtom()', () => {
        let atom, originalReportObserved;
        beforeEach('init', () => {
			originalReportObserved = sinon.spy();
            atom = {reportObserved : originalReportObserved};
            lifecycleManager.$bindAtom(atom);
        });
        describe('proxies original atom.reportObserved', () => {
            it('ignores calls when __tracked__ is false', () => {
                lifecycleManager.__tracked__ = false;
                atom.reportObserved();
                expect(originalReportObserved).to.have.not.been.called;
            });
            it('calls original when __tracked__ is true', () => {
                lifecycleManager.__tracked__ = true;
                atom.reportObserved(1, null, '3'); // 1, null, '3' are just arbitrary arguments
                expect(originalReportObserved).to.have.been.calledOnce;
                expect(originalReportObserved.firstCall).to.have.been.calledWith(1, null, '3');
                expect(originalReportObserved.firstCall).to.have.been.calledOn(atom);
            });
        });
    });
});
