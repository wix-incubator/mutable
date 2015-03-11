"use strict";
define(['./inherit', './BaseType'],function (inherit, BaseType) {

    var StringType = inherit.createConstructor(BaseType, {}, {
        defaultProps:function(owner) {
            return '';
        },

        getTypeName: function(){
            return 'entities/data-types/String'
        },

        getView: function(viewName){
            if(viewName=='form') {
                return {comp:'wix/comps/autogui/StringForm.comp'};
            }
            if(viewName=='thumb') {
                return {comp:'wix/comps/autogui/StringThumb.comp'};
            }
        },

        indexOf: function(){
            return this.__value__.indexOf.apply(this.__value__, arguments);
        },

        toSource: function(ind, scopeConstructorMap, typeConstructorRef, owner, value){
            return BaseType.prototype.toSource(ind, scopeConstructorMap, 'BaseTypes.string', owner, '"' + this.getValue() + '"');
        },
        validateInput: function(value){
            var passBaseValidations = BaseType.prototype.validateInput.call(this, value);
            if(!passBaseValidations && !this.__options__){
                return typeof value === 'string' || value instanceof String;
            }
            return passBaseValidations;
        }

    }, 'StringConst');

    StringType.validateInput = BaseType.validateInput;

    var immutableStringProto = {
        indexOf: function(){ return this.__source__.indexOf.apply(this.__source__, arguments); }
    };
    StringType.Immutable = inherit.createConstructor(BaseType.Immutable, immutableStringProto, {}, 'StringImmutConst');

    return StringType;

});
