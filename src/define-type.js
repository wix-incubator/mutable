import * as _ from 'lodash';
import {getMailBox} from 'escalate';

import BaseType from './base-type';
import PrimitiveBase from './primitive-base';
import {isAssignableFrom, validateNullValue, misMatchMessage} from './validation';
import {generateClassId, clonedMembers} from './utils';

const MAILBOX = getMailBox('Typorama.define');

export default function defineType(id, typeDefinition, ParentType, TypeConstructor) {
    ParentType = ParentType || BaseType;
    var Type = TypeConstructor || function Type(value, options, eventContext) {
        ParentType.call(this, value, options, eventContext);
    };
    clonedMembers.forEach(member => {
        Type[member] = Type[member] || ParentType[member];
    });
    var superTypeConstructor = Object.getPrototypeOf(Type.prototype).constructor;

    if (isAssignableFrom(ParentType, superTypeConstructor.type)) {
        Type.ancestors = superTypeConstructor.ancestors.concat([superTypeConstructor.id]);
    } else {
        Type.prototype = Object.create(ParentType.prototype);
        Type.prototype.constructor = Type;
        Type.ancestors = ParentType.id === 'BaseType' ? [ParentType.id] : ParentType.ancestors.slice();
    }

    Type.id       = id;
    Type.uniqueId = generateClassId();
    Type.type     = Type;
    Type._spec    = {};

    var typeSelfSpec = typeDefinition.spec(Type);
    Object.keys(typeSelfSpec).forEach(function(fieldId) {
        Type._spec[fieldId] = typeSelfSpec[fieldId];
    });
    var fullSpec = generateSpec(id, typeSelfSpec, ParentType);
    Object.keys(fullSpec).forEach(function(fieldId) {
        Type._spec[fieldId] = fullSpec[fieldId];
    });

    Type.getFieldsSpec = () => { return _.clone(fullSpec) };
    Type.prototype.$dirtyableElementsIterator = getDirtyableElementsIterator(typeSelfSpec, Type.prototype.$dirtyableElementsIterator);

    generateFieldsOn(Type.prototype, typeSelfSpec);

    return Type;
}

defineType.oldImpl = function(id, typeDefinition, TypeConstructor) {
    return defineType(id, typeDefinition, undefined, TypeConstructor);
};


function generateSpec(TypeId, spec, ParentType) {
    var baseSpec = ParentType && ParentType.getFieldsSpec ? ParentType.getFieldsSpec() : {};
    _.forEach(spec, (field, fieldName) => {
        if (baseSpec[fieldName]) {
            var path = `${TypeId}.${fieldName}`;
            var superName = ParentType.id;
            //MAILBOX.fatal(`Type definition error: "${path}" already exists on super ${superName}`);
            throw new Error(`Type definition error: "${path}" already exists on super ${superName}`);
        } else {
            baseSpec[fieldName] = field;
        }
    });
    return baseSpec;
}

function getDirtyableElementsIterator(spec, superIterator) {
    var complex = [];
    for (var k in spec) {
        if (spec[k] && spec[k]._spec) {
            complex[complex.length] = k;
        }
    }
    return function typeDirtyableElementsIterator(yielder) {
        for (let c of complex) {
            let k = this.__value__[c];
            if (k) {
                yielder(this, k);
            }
        }
        superIterator && superIterator.call(this, yielder);
    }
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
                if (!isAssignableFrom(BaseType, fieldDef.type) || this.$isDirtyable() || value === null || value === undefined) {
                    return value;
                } else {
                    return value.$asReadOnly();
                }
            },
            set: function(newValue) {
                if (this.$isDirtyable()) {
                    if (this.$assignField(fieldName, newValue)) {
                        this.$setDirty();
                    }
                } else {
                    MAILBOX.warn(`Attempt to override a read only value ${JSON.stringify(this.__value__[fieldName])} at ${this.constructor.id}.${fieldName} with ${JSON.stringify(newValue)}`);
                }
            },
            enumerable: true,
            configurable: false
        });
    });
}
