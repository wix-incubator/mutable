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
    var enumType = function EnumType(initValue) {
        var key = _.findKey(def, value => value === initValue);
        if (enumType[key]) {
            return enumType[key];
        }
        MAILBOX.error(`Enum[${Object.keys(def)}] must be initialized with value.`);
    };
    enumType.prototype = Object.create(EnumBase.prototype);
    enumType.prototype.constructor = enumType;

    enumType.prototype.toJSON = function() {
        return this.value;
    };
    enumType.prototype.toJS = function() {
        // ToDo: should return static ref (this) and accept it in constructor
        return this.value;
    };

    if (_.isArray(def)) {
        def = convertToObject(def);
    }

    var defVal = null;
    Object.keys(def).forEach(function(key) {
        enumType[key] = enumType[key] = createEnumMember(key, def[key], enumType.prototype);
        if (defVal == null) {
            defVal = enumType[key];
        }
    });

    enumType.defaults = function() {
        return defVal;
    };

    enumType.validate = function(v) {
        return this.validateType(v) || this.allowPlainVal(v);
    };

    enumType.validateType = function(v) {
        return (v instanceof enumType && enumType[v.key] === v);
    };

    enumType.allowPlainVal = function(plainVal) {
        return _.includes(def, plainVal); // ToDo: is enum nullable? || validateNullValue(this, val);
    };

    enumType.id = 'enum';
    enumType.create = enumType;

    enumType.reportDefinitionErrors = function() {
        return null;
    };
    enumType.reportSetErrors = function() {
        return null;
    };
    enumType.reportSetValueErrors = function() {
        return null;
    };

    enumType.withDefault = function(defaults, validate) {
        var NewType = PrimitiveBase.withDefault.call(this, defaults, validate);
        NewType.defaults = () => defaults;
        return NewType;
    };
    enumType.__proto__ = EnumBase;

    return enumType;
}
