define(['lodash', './inherit', './BaseType', './CustomType', './EntityRepo'],function (_, inherit, BaseType, CustomType, EntityRepo) {
    "use strict";
    var arrayProto = {
        __initValue__:function(owner, value, options){
            if(options){
                this.__options__.subTypes = this.__subTypes__ = _.map(options.subTypes, function(subType){
                    if(typeof subType === 'string'){
                        subType = EntityRepo.getEntity(subType);
                        if(!subType)
                            throw new Error(subType + ' is not loaded for ' + owner.$className);
                        return subType.entity;
                    } else {
                        return subType;
                    }
                });
            }
            value = (!value) ? [] : value.value || value;
            this.__silentSetVal__(value);
        },
        defaultProps:function(owner) {
            return [];
        },
        getValue: function(){
            var res  = [];
            for(var i=0;i<this.__value__.length;i++) {
                res[i] = this.__value__[i].getValue ? this.__value__[i].getValue() :this.__value__[i];
            }
            return res;
            //return ((this.__value__  && this.__value__.getValue) ? this.__value__.getValue() : this.__value__);
        },
        getValueWithType: function(){
            var res  = [];
            for(var i=0;i<this.__value__.length;i++) {
                res[i] = this.__value__[i].getValueWithType ? this.__value__[i].getValueWithType() :this.__value__[i];
            }
            return res;
        },

        getInlineDefinition: function(modify){
            var value = {
                type: this.$className,
                value: this.getValueWithType(),
                options: this._getInlineOptionsDefinition()
            };
            modify && modify(value);
            return value;
        },

        _getInlineOptionsDefinition: function(){
            var options = _.clone(this.__options__);
            options.subTypes = _.pluck(this.__options__.subTypes, '$className');
            return options;
        },

        __silentSetVal__: function(newValue){
            var isChanged = false;
            newValue = (newValue.__source__) ? newValue.__source__ : newValue;
            if(newValue.type==this.getTypeName() && _.isArray(newValue.value))
            {
                newValue = newValue.value;
            }
            if(!(newValue instanceof ArrayType) && !_.isArray(newValue)){
                console.warn('cannot set none array value to array');
                return false;
            }
            var oldValue = this.__value__;
            this.__value__ = [];
            var newValueLength = newValue.length;
            isChanged = true; // ToDo: need to check indices for change
            for(var i = 0; i < newValueLength; ++i) {
                var item = (newValue.i) ? newValue.i(i) : newValue[i];
//                var castVal = this._castChild(item);
                this.push(item, true);
            }
            this.__invalidated__ = (isChanged) ? 1 : this.__invalidated__;
            return isChanged;
        },
        _castChild: function(val){
            var isDataClass = val instanceof BaseType;
            var foundSubtype = false;
            if(!this.__subTypes__ || this.__subTypes__.length == 0) {
                return val;
            } else if(this.__subTypes__.length === 1) {
                val = new this.__subTypes__[0](this.__owner__, val);
            } else {
                for(var i = 0;i < this.__subTypes__.length; i++) {
                    var SubType = this.__subTypes__[i];
                    if(isDataClass) {

                    } else if(SubType.getTypeName() === val.type) {
                        val = new SubType(this.__owner__, val);
                        foundSubtype = true;
                    }
                }
                if(!foundSubtype) {
                    console.warn('Subtype not allowed '+val)
                }//this.__subTypes__[0]
            }
            return val;
        },
        clone: function(owner){
            owner = owner || this.__owner__;
            var value = _.map(this.__value__, function(cell){ return cell.clone(owner); });
            return new this.constructor(owner, value, this.__options__);
        },
        push: function(newItem,silent){
            var castValue = this.castType(newItem);
            if(castValue!==null) {
                this.__value__.push(castValue);
                if(!silent)
                    this.__invokeChange__();
            } else {
                console.warn('push error: validation fail');
            }
        },
        unshift: function(newItem){
            var castValue = this.castType(newItem);
            if(castValue !== null && castValue !== undefined) {
                this.__value__.unshift(castValue);
                this.__invokeChange__();
            } else {
                console.warn('unshift error: validation fail');
            }
        },
        pop: function(){
            var popCell = this.__value__.pop();
            this.__invokeChange__();
            return getCellValue(popCell);
        },
        shift: function(){
            var shiftCell = this.__value__.shift();
            this.__invokeChange__();
            return getCellValue(shiftCell);
        },
        i: function(index){
            return getCellValue(this.__value__[index]);
        },

        find : function(func){
            return _.find(this.__value__,func);
        },

        forEach: function(callback, context) {
            var length = this.length;
            for(var i = 0; i < length; ++i) {
                callback.call(context, this.i(i), i);
            }
        },

        reduce: function(func, accumulator){
            var length = this.length;
            for(var i = 0; i < length; ++i){
                accumulator = func(accumulator, this.i(i),i);
            }
            return accumulator;
        },

        map: function(callback, context) {
            var accumulator = [];
            var length = this.length;
            for(var i = 0; i < length; ++i) {
                accumulator.push(callback.call(context, this.i(i), i));
            }
            return accumulator;
        },

        filter: function(callbackOrIdentity, thisArg){
            var filteredValue = _.filter(this.__value__, callbackOrIdentity, thisArg);
            return new ArrayType(this.__owner__, filteredValue, this.__options__);
        },
        get length(){
            return (this.__value__) ? this.__value__.length : 0;
        },
        set length(newLength){
            if(this.__value__){
                this.__value__.length = newLength;
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
        __validate__: function(){
            this.__invalidated__ = 0;
            _.forEach(this.__value__, function(item){
                return item.__validate__();
            });
        },
        castType:function(value){
            var subTypes = this.__subTypes__;
            if(!subTypes || !subTypes.length) {
                console.log('*** no validations', value);
                return value;
            }
            var subType = _.find(subTypes, function(subType){
                return subType.validateInput(value);
            }.bind(this));

            if(subType) {
                if(this.isDataObject(value)) {
                    if(value.__owner__ !== this.__owner__){
                        value = value.clone(this.__owner__);
                    }
                    return value;
                } else {
                    return new subType(this.__owner__, value);
                }
            }
            return null;
        },
        getTypeName: function(){
            return 'entities/data-types/Array';
        },
        getSubTypes: function(){
            return this.__subTypes__.concat();
        },
        getView: function(viewName){
            if(viewName === 'form') {
                return { comp:'wix/comps/autogui/ArrayForm.comp' };
            }
            if(viewName === 'thumb') {
                return { comp:'wix/comps/autogui/ArrayThumb.comp' };
            }
        },

        toSource: function(ind, scopeConstructorMap, typeConstructorRef, owner, value){
            var childInd = (ind) ? ind + '\t' : '\t';
            var value = _.reduce(this.__value__, function(src, itemVal, itemKey){
                var prefix = (src) ? ',\n' : '';
                return src + prefix + itemVal.toSource(childInd, scopeConstructorMap, typeConstructorRef, owner, value);
            }, '');
            value = (value) ? '[\n' + value + '\n]' : '[]';
            return BaseType.prototype.toSource(ind, scopeConstructorMap, 'BaseTypes.array', owner, value);
        },
        __isPrimitive__: false
    };

    var ArrayType = inherit.createConstructor(BaseType, arrayProto, {}, 'ArrayConst');




    function getCellValue(cell) {
        if(cell instanceof CustomType){
            return cell;
        } else if(typeof cell.getValue === 'function'){
            return cell.getValue();
        }
        return undefined;
    }

    ArrayType.validateInput = BaseType.validateInput;

    var immutableArrayProto = {
        toSource: function(){ return this.__source__.toSource.apply(this.__source__, arguments); },
        i: function(index){
            var res = this.__source__.i(index);
            if(res.__getImmutable__ )
            {
                res = res.__getImmutable__();
            }
            return res;
        },
        push: function(newItem){ console.warn('cannot push on immutable array'); },
        unshift: function(newItem){ console.warn('cannot unshift on immutable array'); },
        pop: function(newItem){ console.warn('cannot pop on immutable array'); },
        shift: function(newItem){ console.warn('cannot shift on immutable array'); },
        reduce: function(func, accumulator){
            return this.__source__.reduce(function(accumulator, val, key){
                if(val && val.__getImmutable__ )
                {
                    val = val.__getImmutable__();
                }
                return func(accumulator, val, key);
            }, accumulator);
        },
        filter: function(callbackOrIdentity, thisArg){ return this.__source__.filter(callbackOrIdentity, thisArg).__getImmutable__(); },
        getSubTypes: function(){ return this.__source__.getSubTypes(); },
        get length(){ return this.__source__.length; },
        set length(newLength){ console.warn('length cannot be set on immutable array'); }
    };
    ArrayType.Immutable = inherit.createConstructor(BaseType.Immutable, immutableArrayProto, {}, 'ArrayImmutConst');

    return ArrayType;

});
