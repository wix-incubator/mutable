"use strict";
define([
    './EntityRepo',
    './BaseType',
    './inherit',
    './String',
    './Number',
    './Boolean',
    './Array'
 ], function (
    EntityRepo,
    BaseType,
    inherit,
    StringType,
    NumberType,BooelanType,
    ArrayType
) {

    var BaseTypes = {};

    function registerType(name, getterName, Type){
        var className = 'entities/data-types/' + name;
        Type.getView = Type.prototype.getView;
        Type.$className = Type.prototype.$className = className;
        EntityRepo.registerEntity(className, 'Type', Type);
        BaseTypes.__defineGetter__(getterName, function(){
            return Type;
        });
    }

    registerType('String', 'string', StringType);
    registerType('Number', 'number', NumberType);
    registerType('Boolean', 'boolean', BooelanType);
    registerType('Array', 'array', ArrayType);

    BaseTypes.$private = function(fn, meta){
        fn.$private = true;
        fn.$meta = meta;
        return fn;
    };

    BaseTypes.$public = function(fn, meta){
        fn.$public = true;
        fn.$meta = meta;
        return fn;
    };

    return BaseTypes;

});
