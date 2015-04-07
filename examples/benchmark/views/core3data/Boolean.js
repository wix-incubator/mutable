"use strict";
define(['./inherit', './BaseType'],function (inherit, BaseType) {

    var BooleanType = inherit.createConstructor(BaseType, {}, {
        defaultProps:function(owner) {
            return false;
        },

        getTypeName: function(){
            return 'entities/data-types/Boolean'
        },

        getView: function(viewName){
            if(viewName === 'form') {
                return { comp:'wix/comps/autogui/BooleanForm.comp' };
            }
            if(viewName === 'thumb') {
                return { comp:'wix/comps/autogui/BooleanThumb.comp' };
            }
        },

        toSource: function(ind, scopeConstructorMap, typeConstructorRef, owner, value){
            return BaseType.prototype.toSource(ind, scopeConstructorMap, 'BaseTypes.boolean', owner, '"' + this.getValue() + '"');
        }

    }, 'BooleanConst');

    BooleanType.validateInput = BaseType.validateInput;


    return BooleanType;

});
