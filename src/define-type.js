import * as _ from 'lodash';
import {getMailBox} from 'escalate';

import BaseType from './base-type';
import PrimitiveBase from './primitive-base';
import {isAssignableFrom, validateNullValue, misMatchMessage} from './validation';
import {generateClassId} from './utils';
import {untracked} from 'mobx';

const MAILBOX = getMailBox('Mutable.define');

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
    Type.__proto__ = Object.create(ParentType);
    Type._spec = generateSpec(id, typeSelfSpec, ParentType);
    setSchemaIterators(Type.prototype, typeSelfSpec, ParentType.prototype);
    generateFieldsOn(Type.prototype, typeSelfSpec);

    return Type;
}

function generateSpec(id, spec, ParentType) {
    var baseSpec = ParentType && ParentType.getFieldsSpec ? ParentType.getFieldsSpec() : {};
    _.forEach(spec, (field, fieldName) => {
        if (baseSpec[fieldName]) { // todo add '&& !isAssignableFrom(...) check to allow polymorphism
            var path = `${id}.${fieldName}`;
            var superName = ParentType.id;
            MAILBOX.fatal(`Type definition error: "${path}" already exists on super ${superName}`);
        } else {
            baseSpec[fieldName] = field;
        }
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

function generateFieldsOn(obj, fieldsDefinition) {
    _.forEach(fieldsDefinition, function(fieldDef, fieldName) {
        var error;
        var errorContext = BaseType.createErrorContext(`Type definition error`, 'fatal');
        var path = `${obj.constructor.id}.${fieldName}`;
        if (obj[fieldName]) {
            error = `is a reserved field.`;
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
            return;
        }
        error = fieldDef.reportSetValueErrors(fieldDef.defaults());
        if (error) {
            MAILBOX.post(errorContext.level, misMatchMessage(errorContext, fieldDef, fieldDef.defaults(), path));
        }

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
