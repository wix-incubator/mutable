define(['lodash', './inherit'], function(_, inherit) {
    'use strict';
    //var sourceTemplate = fmt('new {{TYPE_CONSTRUCTOR}}({{OWNER}}, {{VALUE}})');

    function BaseType(owner, value, options) {
//        inherit.defineGetSetProp(this, '__owner__', owner, false);
//        inherit.defineGetSetProp(this, '__value__', this.getDefaultValue(owner), false);
//        inherit.defineGetSetProp(this, '__options__', options, {});
        this.__owner__ = owner;
        this.__value__ = this.getDefaultValue(owner);
        this.__options__ = options;
        this.__initValue__(owner, value, options);
        this.__invalidated__ = 0;
    }

    BaseType.prototype = {

        constructor: BaseType,

        __initValue__: function(owner, value, options) {
            if (value !== undefined) {
                this.__silentSetVal__(value);
            }
        },

        getDefaultValue: function(owner) {

            if(this.constructor.defaultProps){
                return this.constructor.defaultProps(owner)
            } else if(this.defaultProps){
                return this.defaultProps(owner)
            } else {
                throw new Error('getDefaultValue() must be implemented for type [' + this.$className + ']');
            }


        },

        __silentSetVal__: function(newValue) {
            newValue = (newValue!==undefined && newValue.getValue) ? newValue.getValue() : newValue;
            if (newValue === this.__value__) {
                return false;
            }

            this.__value__ = newValue;
            this.__invalidated__ = 1;
            return true;
        },

        _manipulateVal: function(value) {
            return value;
        },

        setValue: function(newValue) {
            if (this.__silentSetVal__(newValue)) {
                this.__invokeChange__();
            }
        },
        valueOf: function() {
            return this.getValue();
        },
        getValue: function() {
            return this.__value__;
            //return ((this.__value__  && this.__value__.getValue) ? this.__value__.getValue() : this.__value__);
        },
        getValueWithType: function() {
            return this.getValue();
//            return {
//                type:this.$className,
//                value: this.getValue(),
//                options: {}
//            };
        },

        getInlineDefinition: function() {
//            return this.getValue();
            return {
                type:this.$className,
                value: this.getValue(),
                options: {}
            };
        },

        getTypeDefinition: function() {
            return {
                type: this.getTypeName()
            };
        },

        get: function() {
            return this;
        },
        clone: function(owner) {
            owner = owner || this.__owner__;
            var value = this.getValue();
            return new this.constructor(owner, value, this.__options__);
        },

        toString: function() {
            return this.getValue().toString();
        },

        toSource: function(ind, scopeConstructorMap, typeConstructorRef, owner, value) {
//            ind = ind || '';
//            owner = owner || 'null';
//            value = (value !== undefined) ? value : this.getValue();
//            return ind + sourceTemplate({
//                TYPE_CONSTRUCTOR: typeConstructorRef,
//                OWNER: owner,
//                VALUE: value
//            });
        },

        validateInput: function(value) {
            var TypeConstructor = (this.constructor === Function) ? this : this.constructor || this;
            if (this.isDataObject(value) && !(value instanceof TypeConstructor || value.__source__ instanceof TypeConstructor) && !TypeConstructor.isPrimitive()) {
                return false;
            }

            return (this.__options__ && this.__options__.validations || []).every(function(validator) {
                return validator(value);
            });
        },

        isDataObject: function(obj) {
            return (obj instanceof BaseType) || (obj instanceof BaseType.Immutable);
        },

        __invokeChange__: function() {
            if (this.__owner__) {
                this.__owner__.__invokeChange__();
            }
            this.__invalidate__();
        },

        __invalidate__: function() {
            this.__invalidated__ = 1;
            this.__owner__ && (this.__owner__.__invalidated__ = true);
        },

        __isInvalidated__: function() {
            return (this.__invalidated__ === 1);
        },

        __validate__: function() {
            this.__invalidated__ = 0;
        },

        __getImmutable__: function() {
            if (this.__isPrimitive__) {
                return this.__value__;
            }
            if (!this.__immutable__) {
                this.__immutable__ = new this.constructor.Immutable(this);
            }
            return this.__immutable__;
        },
        __isPrimitive__: true
    };

    BaseType.validateInput = function(value) {
        return this.prototype.validateInput.apply(this, arguments);
    };

    BaseType.isDataObject = function(value) {
        return this.prototype.isDataObject(value);
    };

    BaseType.isPrimitive = function() {
        return this.prototype.__isPrimitive__;
    };

    BaseType.Immutable = function ImmutableType(source) {
        inherit.defineGetSetProp(this, '__source__', source, false);
        //        this.__source__ = source;
        if (source.__source__) debugger;
    };

    BaseType.Immutable.prototype = {

        constructor: BaseType.Immutable,

        get owner() {
            return this.__source__.owner;
        },

        get: function() {
            return this;
        },

        getValue: function() {
            return this.__source__.getValue();
        },
        getValueWithType: function() {
            return this.__source__.getValueWithType();
        },

        getTypeDefinition: function() {
            return this.__source__.getTypeDefinition();
        },
        getTypeName: function() {
            return this.__source__.getTypeName();
        },
        clone: function(owner) {
            return this.__source__.clone(owner);
        },

        toString: function() {
            return this.__source__.toString();
        },

        valueOf: function() {
            return this.__source__.valueOf();
        },

        __isInvalidated__: function() {
            return this.__source__.__isInvalidated__();
        },
        __validate__: function() {
            // immutable shouldn't validate data
            //this.__source__.__validate__();
        }
    };

    return BaseType;
});
