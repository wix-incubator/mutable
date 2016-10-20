import * as mobx from 'mobx';

export function getMobxLogOf(action, subject) {
    var log = [];
    let unRegister = mobx.spy(change => log.push(change));
    try {
        action();
    } finally {
        unRegister();
    }
    log = log.filter(change => change.type);
    if (subject){
        log = log.filter(change => change.object === subject);
    }
    return log;
}
