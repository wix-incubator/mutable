import * as _ from 'lodash';
import {getMailBox} from 'escalate';
import {inherit, getPrimeType} from './../utils';
import {Any} from './any';

const MAILBOX = getMailBox('mutable.defineEnum');

export class EnumBase extends Any {
    static id = 'enum';
    static allowPlainVal(v) { return true; }
    static create(v) { return v; }
    static validate(v) {
        return v == null || v instanceof EnumBase;
    }
    static validateType(v) {
        return v == null || v instanceof EnumBase;
    }
    static defaults(v) { return null; }

    toJSON(){
        return this.value;
    }
    toJS(){
        return this.value;
    }
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
class EnumType extends EnumBase{

    static validate(v) {
        return this.validateType(v) || this.allowPlainVal(v);
    }
    static validateType(v) {
        return (v instanceof getPrimeType(this) && this[v.key] === v);
    }
    static reportDefinitionErrors() {
        return null;
    }
    static reportSetErrors() {
        return null;
    }
    static reportSetValueErrors() {
        return null;
    }
    static withDefault(defaults, validate) {
        var NewType = super.withDefault(defaults, validate);
        NewType.defaults = () => defaults;
        return NewType;
    };
    constructor(value, options, errorContext){
        super(value, options, errorContext);
        return value;
    }
}
export function defineEnum(def) {

    const enumType = inherit('EnumType', EnumType, function validateEnum(type, value, options, errorContext) {
        var key = _.findKey(def, defValue => defValue === value);
        if (type[key]) {
            return [type[key], options, errorContext];
        }
        MAILBOX.error(`Enum[${Object.keys(def)}] must be initialized with value.`);
        return [undefined, options, errorContext];
    });

    enumType.create = enumType;
    enumType._prime = enumType;

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
    enumType.allowPlainVal = function(plainVal) {
        return _.includes(def, plainVal); // ToDo: is enum nullable? || validateNullValue(this, val);
    };
    enumType.withDefault = function(defaults, validate) {
        var NewType = Any.withDefault.call(this, defaults, validate);
        NewType.defaults = () => defaults;
        return NewType;
    };
    enumType.__proto__ = EnumBase;

    return enumType;
}
