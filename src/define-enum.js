import * as _ from 'lodash';
import {getMailBox} from 'escalate';

import BaseType from './base-type';
import PrimitiveBase from './primitive-base';

const MAILBOX = getMailBox('Mutable.defineEnum');

export class EnumBase extends PrimitiveBase {
    static allowPlainVal(v) { return true; }
    static create(v) { return v; }
    static validate(v) { return v == null || v instanceof EnumBase; }
    static validateType(v) { return v == null || v instanceof EnumBase; }
    static defaults(v) { return null; }
}

function createEnumMember(key, value, proto) {

    var member = Object.create(proto);
    member.key = key;
    member.value = value;
    member.toString = function() { return value.toString(); };
    member.valueOf = function() { return value.valueOf(); };
    if (value instanceof Object) {
        Object.keys(value).forEach(function(tkey) {
            member[tkey] = value[tkey];
        });
    }

    return Object.freeze(member);
}

function convertToObject(def) {
    var tdef = {};
    def.forEach(function(key) {
        tdef[key] = key;
    });
    return tdef;
}

export function defineEnum(def) {
    var EnumType = function EnumType(initValue) {
        var key = _.findKey(def, value => value === initValue);
        if (EnumType[key]) {
            return EnumType[key];
        }
        MAILBOX.error(`Enum[${Object.keys(def)}] must be initialized with value.`);
    };
    EnumType.prototype = Object.create(EnumBase.prototype);
    EnumType.prototype.constructor = EnumType;

    EnumType.prototype.toJSON = function() {
        return this.value;
    };
    EnumType.prototype.toJS = function() {
        // ToDo: should return static ref (this) and accept it in constructor
        return this.value;
    };

    if (_.isArray(def)) {
        def = convertToObject(def);
    }

    var defVal = null;
    Object.keys(def).forEach(function(key) {
        EnumType[key] = EnumType[key] = createEnumMember(key, def[key], EnumType.prototype);
        if (defVal == null) {
            defVal = EnumType[key];
        }
    });

    EnumType.defaults = function() {
        return defVal;
    };

    EnumType.validate = function(v) {
        return (v instanceof EnumType && EnumType[v.key] === v);
    };

    EnumType.validateType = EnumType.validate;
    EnumType.allowPlainVal = function(plainVal) {
        return _.includes(def, plainVal); // ToDo: is enum nullable? || validateNullValue(this, val);
    };

    EnumType.id = 'enum';
    EnumType.create = BaseType.create;

    EnumType.reportDefinitionErrors = function() {
        return null;
    };
    EnumType.reportSetErrors = function() {
        return null;
    };
    EnumType.reportSetValueErrors = function() {
        return null;
    };

    EnumType.withDefault = function(defaults, validate) {
        var NewType = PrimitiveBase.withDefault.call(this, defaults, validate);
        NewType.defaults = () => defaults;
        return NewType;
    };
    EnumType.__proto__ = EnumBase;

    return EnumType;
}
