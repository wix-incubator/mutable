define(['lodash', './inherit', './BaseType'],function (_, inherit, BaseType) {
    "use strict";

    var CustomType = inherit.createConstructor(BaseType, {
        init: function(owner, value, options){
            //to be replaced by owner proxy;
            this.owner = owner;
        },

        __silentSetVal__: function(newValue){
            if(newValue==undefined)
            {
                return false;
            }
            var isChanged = false;
            newValue = (newValue.__source__) ? newValue.__source__ : newValue;
            _.forEach(this.__fields__, function(fieldName){
                if(newValue[fieldName] !== undefined){
                    var field = this.__value__[fieldName];
                    if(field.__silentSetVal__ && field.__silentSetVal__(newValue[fieldName])){
                        isChanged = true;
                    } else if(field !== newValue[fieldName]){
                        this.__value__[fieldName] = newValue[fieldName];
                        isChanged = true;
                    }
                }
            }, this);
            this.__invalidated__ = (isChanged) ? 1 : this.__invalidated__;
            return isChanged;
        },

        getValue: function(){
            var result = {};
            _.forEach(this.__fields__, function(fieldName){
                var field = this[fieldName];
                result[fieldName] = field.getValue ? field.getValue() : field;
            }, this);

            return result
        },

        getValueWithType: function(){
            var result = {};
            _.forEach(this.__fields__, function(fieldName){
                var field = this[fieldName];
                result[fieldName] = field.getValueWithType ? field.getValueWithType() : field;
            }, this);
            result.type = this.getTypeName();
            return result;
        },

        getInlineDefinition: function(modify){
            var value = this.getValueWithType();
            this._sanitizeFunctions(value);
            modify && modify(value);
            return value;
        },

        _sanitizeFunctions: function(obj){
            if(_.isArray(obj) || _.isPlainObject(obj))
            {
                _.forEach(obj, function(item, index){
                    if(_.isFunction(item))
                    {
                        delete obj[index];
                    }else{
                        this._sanitizeFunctions(item);
                    }
                }.bind(this))
            }
        },

        getTypeDefinition: function(){
            var result = {type:this.getTypeName(), structure:{}};
            _.forEach(this.__value__, function(field, fieldName){
                result.structure[fieldName] = field.getTypeDefinition();
            });
            return result;
        },

        getFields: function(){
            return this.__fields__.concat();
        },

        get: function(name){
            return this.__value__[name]; // ToDo: generate field if not exist on value
        },

        clone: function(owner){
            owner = owner || this.__owner__;
            var value = _.mapValues(this.__value__, function(cell){ return cell.clone(owner); });
            return new this.constructor(owner, value, this.__options__);
        },

        i: function(key){
            return this[key];
        },

        forEach: function(func){
            for(var fieldName in this.__value__){
                func(this[fieldName], fieldName);
            }
        },
        reduce: function(func, accumulator){
            for(var fieldName in this.__value__){
                accumulator = func(accumulator, this[fieldName], fieldName);
            }
            return accumulator;
        },
        mergeTo: function(obj){
            for(var fieldName in this.__value__){
                var fieldValue = this.__value__[fieldName];
                obj[fieldName] = (fieldValue.getValue) ? fieldValue.getValue() : fieldValue;
            }
        },

        __isInvalidated__: function isDataInvalidated(){
            if(this.__invalidated__ === 0){
                var isValidated = _.find(this.__value__, function(item){
                    return item.__isInvalidated__ && item.__isInvalidated__();
                });
                this.__invalidated__ = (isValidated) ? 1 : -1;
            }

            return (this.__invalidated__ === 1);
        },

        validateInput : function(value){

            var isDataObj = this.isDataObject(value);//(value instanceof TypeConstructor || value.__source__ instanceof TypeConstructor);

            var actualVal = isDataObj ? value.getValue() : value;
            var valKeys = isDataObj ? value.getFields() : _.keys(actualVal).sort();
            var defaultValue = this.__defaultFields__;
            for(var i = 0; i < valKeys.length; i++) {
                var key = valKeys[i];
                if(key !== "type") {
                    if(defaultValue[key] !== undefined) {
                        if(defaultValue[key].validateInput && !defaultValue[key].validateInput(actualVal[key])) {
                            return false;
                        } else if(typeof defaultValue[key] !== typeof actualVal[key]){
                            return false;
                        }
                    } else {
                        return false;
                    }
                }
            }

            var validations = [];
            if(this.__options__ && this.__options__.validations) {
                validations = this.__options__.validations;
            }
            for(i = 0;i < validations.length; ++i) {
                if(!validations[i](value)) {
                    return false;
                }
            }
            return true;
        },
        validateFieldInput : function(fieldName,value){

            var isDataObj = this.isDataObject(value);//(value instanceof TypeConstructor || value.__source__ instanceof TypeConstructor);

            var actualVal = isDataObj ? value.__value__: value;
            var defaultValue = this.__defaultFields__;

            if(defaultValue[fieldName]) {
                if(!defaultValue[fieldName].validateInput(actualVal)) {
                    return false;
                }
            }
            return true;
        },
        __validate__: function(){
            this.__invalidated__ = 0;
            _.forEach(this.__value__, function(item){
                return item && item.__validate__ && item.__validate__();
            });
        },

        getTypeName: function(){
            return this.$className
        },
        toSource: function(ind, scopeConstructorMap, typeConstructorRef, owner, value){
            value = _.reduce(this.__value__, function(src, itemVal, itemKey){
                return src + '\t' + itemKey + ': ' + itemVal.toSource(' ', scopeConstructorMap, typeConstructorRef, owner, value) + ',\n';
            }, '');
            value = (value) ? '{\n' + value + '\n}' : '{}';
            if(this.$className.indexOf('propType:')==0)
            {
                var compClassName = this.$className.replace('propType:','');
                if(scopeConstructorMap[compClassName])
                {
                    typeConstructorRef = scopeConstructorMap[compClassName]+'.propsType';
                }
                else
                {
                    typeConstructorRef = 'error: no comp import was found for ' + this.$className;

                }


            }else
            {
                typeConstructorRef = scopeConstructorMap[this.$className] || 'error: no custom type was found for ' + this.$className;
            }
            return BaseType.prototype.toSource(ind, scopeConstructorMap, typeConstructorRef, owner, value);
        },
        __isPrimitive__: false



    }, {}, 'CustomConst');

    CustomType.validateInput = BaseType.validateInput;
    CustomType.validateFieldInput = function(){return this.prototype.validateFieldInput.apply(this,arguments)};
    CustomType.Immutable = BaseType.Immutable;
    CustomType.getTypeName = function(){
        return this.$className
    };
    var immutableCustomTypeProto = {
        toSource: function(){ return this.__source__.toSource.apply(this.__source__, arguments); },
        i: function(index){ return this.__source__.i(index); }, // ToDo: use immutables fields
        forEach: function(func){ this.__source__.forEach(func); }, // ToDo: use immutables fields
        reduce: function(func, accumulator){ return this.__source__.reduce(func, accumulator); }, // ToDo: use immutables fields
        mergeTo: function(obj){
            this.__source__.mergeTo(obj);
        },
        get: function(name){
            if(this.__source__[name])
            {
                return this.__source__.get(name).__getImmutable__();
            }
        },
        getFields: function(){
            return this.__source__.getFields();
        }
    };

    CustomType.Immutable = inherit.createConstructor(BaseType.Immutable, immutableCustomTypeProto, {}, 'CustomImmutConst');

    return CustomType;

});
