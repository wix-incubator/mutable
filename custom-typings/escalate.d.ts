
declare module "escalate" {

    export type Level = 'trace'|'debug'|'info'|'warn'|'error'|'fatal';

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
