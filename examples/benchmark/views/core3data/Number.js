"use strict";
define(['./inherit', './BaseType'], function (inherit, BaseType) {

    var NumberType = inherit.createConstructor(BaseType, {}, {
        defaultProps:function(owner) {
            return 0;
        },
        getTypeName: function(){
            return 'entities/data-types/Number'
        },
        getView: function(viewName){
            if(viewName === 'form') {
                return { comp:'wix/comps/autogui/NumberForm.comp' };
            }
            if(viewName === 'thumb') {
                return { comp:'wix/comps/autogui/NumberThumb.comp' };
            }
        },
        toSource: function(ind, scopeConstructorMap, typeConstructorRef, owner, value){
            return BaseType.prototype.toSource(ind, scopeConstructorMap, 'BaseTypes.number', owner, this.getValue());
        }
    }, 'NumberConst');

    NumberType.Immutable = BaseType.Immutable;
    NumberType.validateInput = BaseType.validateInput;

    return NumberType;

});
