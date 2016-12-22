
type _Level = 'trace'|'debug'|'info'|'warn'|'error'|'fatal';
declare module "escalate" {

    export type Level = _Level;

    export interface Mailbox{
        post(level: Level, s: string): void;
        fatal(message: string): void;
        error(message: string): void;
        warn(message: string): void;
        info(message: string): void;
        debug(message: string): void;
        trace(message: string): void;
    }
    export function getMailBox(namespace:string):Mailbox;
}

declare namespace Chai {
    export interface Report{
        level?:_Level|RegExp;
        params?:string;
        context?:string;
    }
    interface Assertion {
        report(r: Report): Assertion;
    }
}
