var deepIs = require('deep-is'),
    difflet = require('difflet')({ indent: 2, comment : true  });

function assertLogAsExpected(assertion, log, events){
    log = log.filter(() => {
        events.some(() => {});
    });
    this.assert(
        Mutable.BaseType.prototype.isPrototypeOf(action.prototype),
        'expected a Type but got #{act}',
        'expected not a Type but got #{act}',
        Mutable.BaseType,
        action,
        true
    );
}

export default function(chai, utils) {

    chai.Assertion.addMethod("triggers", function (...events) {
        var action = this._obj;
        var log = [];
        let unRegister = mobx.spy(change => log.push(change));
        try {
            action();
            assertLogAsExpected(this, log, events);
        } finally {
            unRegister();
        }
    });
};
