import * as _ from 'lodash';
import {getMailBox} from 'escalate';

import BaseType from './base-type';
import PrimitiveBase from './primitive-base';
import {isAssignableFrom, validateNullValue, misMatchMessage} from './validation';
import {generateClassId} from './utils';
import {untracked} from 'mobx';

const MAILBOX = getMailBox('Mutable.define');

function defineGeneric(source){
    const result = defineType('GenericType', {spec: () => ({})});
    result.withDefault(source.defaults(), source.validate, source.options);
    return result;
}

export default function defineType(id, typeDefinition, ParentType, TypeConstructor) {
    ParentType = TypeConstructor || ParentType || BaseType;
    if (!BaseType.isJsAssignableFrom(ParentType)){
        MAILBOX.fatal(`Type definition error: ${id} is not a subclass of core3.Type`);
    }
    class Type extends ParentType {
        static ancestors = ParentType.ancestors.concat([ParentType.id]);
        static id = id;
        static uniqueId = generateClassId();
        constructor(...args){
            super(...args);
        }
    }
    // values that are calculated from spec require Type to be defined (for recursive types) so they are attached to the class after definition
    const typeSelfSpec = typeDefinition.spec(Type);
    const baseSpec = ParentType && ParentType.getFieldsSpec ? ParentType.getFieldsSpec() : {};
    normalizeSchema(Type, baseSpec, typeSelfSpec, ParentType.id);
    Type.__proto__ = Object.create(ParentType); // inherint non-enumerable static properties
    Type._spec = generateSpec(id, typeSelfSpec, baseSpec);
    setSchemaIterators(Type.prototype, typeSelfSpec, ParentType.prototype);
    generateFieldsOn(Type.prototype, typeSelfSpec);
    return Type;
}

function normalizeSchema(type, parentSpec, typeSelfSpec, parentName) {
    _.forEach(typeSelfSpec, (fieldDef, fieldName) => {
        if (validateField(type, parentSpec, fieldName, fieldDef, parentName)){
            if ((fieldDef || fieldDef._cloned) === BaseType) {
                typeSelfSpec[fieldName] = defineGeneric(fieldDef);
            }
        }
        // maybe we should delete the field from the spec if it's not valid?
    });
}

function generateSpec(id, spec, baseSpec) {
    _.forEach(spec, (field, fieldName) => {
        baseSpec[fieldName] = field;
    });
    return baseSpec;
}

function setSchemaIterators(target, spec, parent) {
    var complex = [];
    for (var k in spec) {
        if (spec[k] && spec[k]._spec) {
            complex[complex.length] = k;
        }
    }
    target.$dirtyableElementsIterator = function typeDirtyableElementsIterator(yielder) {
        for (let c of complex) {
            let k = this.__value__[c];
            if (k && _.isFunction(k.$setManager)) { // if value is dirtyable
                yielder(this, k);
            }
        }
        parent && _.isFunction(parent.$dirtyableElementsIterator) && parent.$dirtyableElementsIterator.call(this, yielder);
    };
    target.$atomsIterator = function atomsIterator(yielder) {
        for (var c in spec) {
            if (spec.hasOwnProperty(c)) {
                let a = this.__value__.$mobx.values[c];
                if (a && _.isFunction(a.reportObserved)) {
                    yielder(a);
                }
            }
        }
        parent && _.isFunction(parent.$atomsIterator) && parent.$atomsIterator.call(this, yielder);
    };
}

function validateField(type, parentSpec, fieldName, fieldDef, parentName) {
    var error;
    var errorContext = BaseType.createErrorContext(`Type definition error`, 'fatal');
    var path = `${type.id}.${fieldName}`;
    if (BaseType.prototype[fieldName]){
        error = 'is a reserved field.';
    } else if (parentSpec[fieldName]) { // todo add '&& !isAssignableFrom(...) check to allow polymorphism
        error = `already exists on super ${parentName}`;
    } else {
        var err = BaseType.reportFieldDefinitionError(fieldDef);
        if (err) {

            error = err.message;
            if (err.path) {
                path = path + err.path
            }
        }
    }
    if (error) {
        MAILBOX.fatal(`Type definition error: "${path}" ${error}`);
    } else {
        error = fieldDef.reportSetValueErrors(fieldDef.defaults());
        if (error) {
            MAILBOX.post(errorContext.level, misMatchMessage(errorContext, fieldDef, fieldDef.defaults(), path));
        }
    }
    return !error;
}

function generateFieldsOn(obj, fieldsDefinition) {
    _.forEach(fieldsDefinition, function(fieldDef, fieldName) {
        Object.defineProperty(obj, fieldName, {
            get: function() {
                var value = this.__value__[fieldName];
                if (!this.__isReadOnly__ || value===null || value===undefined || !value.$asReadOnly) {
                    return value;
                } else {
                    return value.$asReadOnly();
                }
            },
            set: function(newValue) {
                if (this.$isDirtyable()) {
                    this.$assignField(fieldName, newValue);
                } else {
                    untracked(() => {
                        MAILBOX.warn(`Attempt to override a read only value ${JSON.stringify(this.__value__[fieldName])} at ${this.constructor.id}.${fieldName} with ${JSON.stringify(newValue)}`);
                    });
                }
            },
            enumerable: true,
            configurable: false
        });
    });
}
