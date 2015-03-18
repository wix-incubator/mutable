define(['lodash'], function (_) {

    "use strict";
    var count = 0;
    return {
        createConstructor: function (parentConstructor, methods, statics, name) {
            parentConstructor = parentConstructor || function () {};
            methods = methods || {};
            statics = statics || {};
            var constr = new Function('parentConstructor', 'methods', 'statics', '_', 'return ' + this.__CONSTRUCTORE__.toString().replace(/\$\$\$/gm, (name || 'Klass' + count++)) + ';')(parentConstructor, methods, statics, _);
//            var constr = function (owner, value, options) {
//                if((! this instanceof constr)){
//                    throw new Error('Barak Not Implemented This.....');
//
//                }
//                parentConstructor.call(this, owner, value, options);
//                for(var field in methods){
//                    if(typeof this[field] === 'function') {
//                        this[field] = this[field].bind(this);
//                    }
//                }
//                methods.init && methods.init.call(this, owner, value, options);
//                return this;
//            };
            _.extend(constr, parentConstructor, statics);
            constr.prototype = Object.create(parentConstructor.prototype);
            this.copyProps(constr.prototype, methods, statics);
            constr.prototype.constructor = constr;
            return constr;
        },
        __CONSTRUCTORE__: function $$$(owner, value, options) {
            parentConstructor.call(this, owner, value, options);
            _.forEach(methods, function(method, field){
                if(typeof method === 'function') {
                    this[field] = method.bind(this);
                }
            }, this);
            methods.init && methods.init.call(this, owner, value, options);
            return this;
        },
        copyProps: function(targetObj, methods, statics){
            var i = 1;
            while(i < arguments.length){
                var copyFrom = arguments[i];
                var props = Object.getOwnPropertyNames(copyFrom);
                for(var j = 0; j < props.length; j++){
                    var propName = props[j];
                    var descriptor = Object.getOwnPropertyDescriptor(copyFrom, propName);
                    Object.defineProperty( targetObj, propName, descriptor);
                }
                i++;
            }
        },
        defineGetSetProp: function(scope, name, value, isEnumerable) {
            Object.defineProperty(scope, name, {
                get: function(){ return value; },
                set: function(newVal){ value = newVal; },
                enumerable: (isEnumerable !== false)
            });
        }
    };
});