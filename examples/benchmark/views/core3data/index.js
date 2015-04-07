import BaseTypes from "./BaseTypes"
import defineType from "./defineType"


var TestType = defineType({
    meta: {
        id:"TestType"
    },
    extend: [],
    implement: [],
    logic: {
        getView : function (viewName) {
            if(viewName=='form'){
                return {comp:'wix/comps/autogui/ImageForm.comp'};
            }
            if(viewName=='thumb'){
                return {comp:'wix/comps/autogui/ImageThumb.comp'};
            }
        }
    },
    defaultProps: function(owner){
        return {
            key : "",
            x : 0,
            y : 0,
            w : 0,
            h : 0,
            bg : "",
            children : new BaseTypes.array(owner, [], { subTypes:[TestType] })
        };
    },
//    defaultProps: function(owner){
//        return {
//            key : new BaseTypes.string(owner, ""),
//            x : new BaseTypes.number(owner, 0),
//            y : new BaseTypes.number(owner, 0),
//            w : new BaseTypes.number(owner, 0),
//            h : new BaseTypes.number(owner, 0),
//            bg : new BaseTypes.string(owner, 1000),
//            children : new BaseTypes.array(owner, [], { subTypes:[TestType] })
//        };
//    },
    imports: []

});

export default {
    "defineType":defineType,
    "TestType":TestType
}