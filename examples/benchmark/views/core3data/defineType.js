define(['lodash', './BaseType', './CustomType','./BaseTypes', './inherit', './EntityRepo'], function (_, BaseType, CustomType, BaseTypes,  inherit, EntityRepo) {
    "use strict"

    var NO_OWNER = null;//new (function NoOwner(){}) ;

    return function (classDef) {
        var className = classDef.meta.id;
        var typeLogicDef = classDef.logic || {};
        var staticLogicDef = typeLogicDef.static || {};
        staticLogicDef.$className = className;

        if(staticLogicDef.getDefaultValue){
            throw new Error('getDefaultValue is deprecated use props insted in:' + className)
        }

        var fieldsDef = classDef.defaultProps(NO_OWNER);

        staticLogicDef.defaultProps = classDef.defaultProps;
        staticLogicDef.imports = classDef.imports;

        var TypeConstructor = inherit.createConstructor(CustomType, typeLogicDef, staticLogicDef, className + 'Const');
        var ImmutableTypeConstructor = inherit.createConstructor(CustomType.Immutable, typeLogicDef, staticLogicDef, className + 'ImmuteConst');

        TypeConstructor.__redefineType__ = redefineType;
        TypeConstructor.classDef = classDef;
//        TypeConstructor.defaultProps = classDef.defaultProps;

        TypeConstructor.__defaultFields__ = TypeConstructor.prototype.__defaultFields__ = fieldsDef;
        defineFields(TypeConstructor.prototype, fieldsDef);
        defineImmutableFields(ImmutableTypeConstructor.prototype, fieldsDef);
        TypeConstructor.prototype.NO_OWNER = NO_OWNER;
        ImmutableTypeConstructor.prototype.NO_OWNER = NO_OWNER;
//        Object.freeze(TypeConstructor.prototype);
//        Object.freeze(ImmutableTypeConstructor.prototype);

        TypeConstructor.getFields = function(){ return this.prototype.__fields__.concat(); }; // ToDo: move to customType prototype
        TypeConstructor.getView = typeLogicDef.getView; // ToDo: move getView to statics

        TypeConstructor.Immutable = ImmutableTypeConstructor;
        TypeConstructor.validate = CustomType.validate;
        EntityRepo.registerEntity(className, 'Type', TypeConstructor);
        return TypeConstructor;
    };

    function redefineType(newType) {
        if(this.$className !== newType.$className) {
            throw new Error('class name / package change not supported yet');
        }

        _.assign(this.prototype, newType.classDef.logic, newType.classDef.static);
        _.assign(this, newType.classDef.static);
        this.getView = newType.classDef.logic.getView; // ToDo: move getView to statics

        _.assign(this.Immutable.prototype, newType.classDef.logic, newType.classDef.static);
        _.assign(this.Immutable, newType.classDef.static);

        var prototype = this.prototype || {};


        this.defaultProps = prototype.defaultProps = newType.defaultProps;
        this.__defaultFields__ = prototype.__defaultFields__ = newType.__defaultFields__;
        defineFields(prototype, newType.__defaultFields__);
        defineImmutableFields(this.Immutable.prototype, newType.__defaultFields__);
    }

    function defineFields(typeLogicDef, fieldsDef) {
        typeLogicDef.__fields__ = [];
        _.forEach(fieldsDef, function(field, fieldName){
            typeLogicDef.__fields__.push(fieldName);
            if(field instanceof CustomType || field instanceof BaseTypes.array || field.__returnValue__){
                Object.defineProperty(typeLogicDef, fieldName, {
                    get: function(){ checkFieldValueExist(this, fieldName); return this.__value__[fieldName] },
                    set: function(newVal){
                        this.__value__[fieldName].setValue(newVal);
                    },
                    enumerable:true,
                    configurable: true
                });
            } else if(field instanceof BaseType){
                Object.defineProperty(typeLogicDef, fieldName, {
                    get: function(){ checkFieldValueExist(this, fieldName); return this.__value__[fieldName].getValue() },
                    set: function(newVal){
                        this.__value__[fieldName].setValue(newVal);
                    },
                    enumerable:true,
                    configurable: true
                });
            } else if(field !== undefined){
                Object.defineProperty(typeLogicDef, fieldName, {
                    get: function(){ checkFieldValueExist(this, fieldName); return this.__value__[fieldName] },
                    set: function(newVal){
                        this.__invalidated__ = 1;
                        this.__value__[fieldName] = newVal;
                    },
                    enumerable:true,
                    configurable: true
                });
            } else {
                throw new Error('im not dead yet! dont delete me!');
                Object.defineProperty(typeLogicDef, fieldName, {
                    get: function(){ checkFieldValueExist(this, fieldName); return this.__value__[fieldName] },
                    set: function(newVal){
                        this.__invalidated__ = 1;
                        this.__value__[fieldName] = newVal;
                    },
                    enumerable:true,
                    configurable: true
                });
            }
        })
    }

    function defineImmutableFields(typeLogicDef, fieldsDef) {
        _.forEach(fieldsDef, function(field, fieldName){
            if(field instanceof CustomType){
                Object.defineProperty(typeLogicDef, fieldName, {
                    get: function(){
                        var result = this.__source__[fieldName];
                        if(result && typeof result.__getImmutable__ === 'function') {
                            return result.__getImmutable__();
                        } else {
                            return result;
                        }
                    },
                    set: function(){ console.warn(fieldName + " field cannot be set on immutable " + this.__source__.constructor.$className); },
                    enumerable:true,
                    configurable: true
                });

            } else {
                Object.defineProperty(typeLogicDef, fieldName, {
                    get: function(){ return this.__source__[fieldName] },
                    set: function(){ console.warn(fieldName + " field cannot be set on immutable " + this.__source__.constructor.$className); },
                    enumerable:true,
                    configurable: true
                });
            }
        })
    };

    function checkFieldValueExist(instance, fieldName){
        var currentValue = instance.__value__[fieldName];
        if(currentValue === undefined){
            if(field instanceof BaseType && (currentValue.getTypeName() !== instance.__defaultFields__[fieldName].getTypeName())) {// ToDo: maybe cast old value if possible
                instance.__value__[fieldName] = instance.__defaultFields__[fieldName].clone(instance.__owner__);
            } else if(typeof currentValue !== typeof instance.__defaultFields__[fieldName]){
                instance.__value__[fieldName] = instance.__defaultFields__[fieldName];
            }
        }
    }

});