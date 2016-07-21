import * as _ from 'lodash';
import {getMailBox} from 'escalate';

import defineType from './define-type';
import {validateNullValue, misMatchMessage, arrow} from './validation';
import {validateAndWrap} from './type-match';
import {getValueTypeName} from './utils';
import BaseType from './base-type';
import Number from './number';
import * as generics from './generic-types';

const MAILBOX = getMailBox('Mutable.List');

class _List extends BaseType {

    static defaults() { return []; }

    static cloneValue(value) {
        if (_.isArray(value) || _List.validateType(value)) {
            if (!value){
                return value;
            }
            return value.map((itemValue, index) => {
                var Type = generics.getMatchingType(this.options.subTypes, itemValue);
                if (!Type) {
                    throw new Error('cloneValue error: no type found for index ' + index)
                }
                return Type.cloneValue(itemValue);
            });
        } else {
            return [];
        }
    }

    static validate(value) { return validateNullValue(this, value) || _.isArray(value); }

    static allowPlainVal(value, errorDetails = null) {
        if (validateNullValue(this, value)) {
            return true;
        } else if (!_.isArray(value)) {
            return false;
        }
        return !this.options || !this.options.subTypes ||
            value.every((element, idx) => {
                if (!generics.getMatchingType(this.options.subTypes, element)) {
                    if (errorDetails) {
                        errorDetails.path = `${errorDetails.path}[${idx}]`;
                        errorDetails.expected = generics.toString(this.options.subTypes);
                        errorDetails.actual = element;
                    }
                    return false;
                } else {
                    return true;
                }
            });
    }

    static wrapValue(value, spec, options, errorContext) {
        if (this.validateType(value)) {
            if (value.__value__.map) {
                return value.__value__.map((itemValue) => {
                    return this._wrapSingleItem(itemValue, options, null, errorContext);
                }, this);
            } else {
                MAILBOX.error('Unmet mutable type requirement.')
            }
        } else if (!_.isArray(value)) {
            MAILBOX.error('Unmet array type requirement.');
        }

        return value.map((itemValue, itemIndex) => {

            return this._wrapSingleItem(itemValue, options, null, {
                level: errorContext.level,
                entryPoint: errorContext.entryPoint,
                path: errorContext.path + '[' + itemIndex + ']'
            });
        }, this);
    }

    static _wrapSingleItem(value, options, lifeCycle, errorContext) {
        var result = generics.doOnType(options.subTypes, type => {
            if (type.validateType(value) || type.allowPlainVal(value)) {
                return validateAndWrap(value, type, lifeCycle, errorContext);
            }
        });
        if (null === result || undefined === result) {
            var allowedTypes = generics.toString(options.subTypes);
            MAILBOX.post(errorContext.level, misMatchMessage(errorContext, allowedTypes, value));
        } else {
            return result;
        }
    }

    static of(subTypes) {
        //TODO: remove this when transpiler shenanigans are over
        if (arguments.length > 1) {
            subTypes = Array.prototype.slice.call(arguments);
        }
        return this.withDefault(undefined, undefined, { subTypes });
    };

    static reportDefinitionErrors() {
        if (!this.options || !this.options.subTypes) {
            return { path: '', message: `Untyped Lists are not supported please state type of list item in the format core3.List<string>` }
        } else {
            var error = generics.reportDefinitionErrors(this.options.subTypes, BaseType.reportFieldDefinitionError);
            if (error) {
                return {
                    path: `<${error.path}>`,
                    message: error.message

                }
            }
        }
    }


    static createErrorContext(entryPoint, level, options) {
        options = options || this.options || this.__options__;
        return {
            level,
            entryPoint,
            path: 'List' + generics.toString(generics.normalizeTypes(options.subTypes))
        }
    }

    static preConstructor(){
        const report = this.reportDefinitionErrors();
        if (report) {
            MAILBOX.error('List constructor: ' + report.message);
        }
        super.preConstructor();
    }

    constructor(value = [], options = {}, errorContext) {
        if (!errorContext) {
            errorContext = _List.createErrorContext('List constructor error', 'error', options);
        }
        options.subTypes = generics.normalizeTypes(options.subTypes);
        super(value, options, errorContext);
    }

    toJSON(recursive = true, typed = false) {
        return this.__value__.map(item => {
            return (recursive && BaseType.validateType(item)) ? item.toJSON(true, typed) : item;
        });
    }

    __lodashProxyWrap__(key, fn, ctx) {
        if (!_.isUndefined(ctx)) {
            if (_.isFunction(fn)) {
                fn = _.bind(fn, ctx);
            } else {
                fn = _.matchesProperty(fn, ctx);
            }
        }
        var valueArray = _[key](this.__getValueArr__(), fn);
        return this.__wrapArr__(valueArray);
    }

    __lodashProxy__(key, fn, ctx) {
        if (!_.isUndefined(ctx)) {
            if (_.isFunction(fn)) {
                fn = _.bind(fn, ctx);
            } else {
                fn = _.matchesProperty(fn, ctx);
            }
        }
        var valueArray = _[key](this.__getValueArr__(), fn);
        return valueArray;
    }

    __getLodashIterateeWrapper__(iteratee, allowObj) {
        if (_.isFunction(iteratee)) {
            var mutableArr = this;
            return function(item, index) {
                return iteratee.call(this, item, index, mutableArr);
            }
        } else if (allowObj && _.isObject(iteratee)) {
            if (!iteratee.constructor || !iteratee.constructor.type) {
                iteratee = this.constructor._wrapSingleItem(iteratee, this.__options__, null);
            }
            return function wrappedObjMatchIterator(element) {
                // TODO add matches implementation in List and Map
                return iteratee.matches(element);
            }
        } else {
            return iteratee;
        }
    }

    __getValueArr__() {
        if (this.__isReadOnly__) {
            return _.map(this.__value__, function(item) {
                return (item.$asReadOnly) ? item.$asReadOnly() : item;
            })
        } else {
            return this.__value__;
        }
    }

    __wrapArr__(val) {
        return new this.constructor(val, this.__options__);
    }

    // Mutator methods

    pop() {
        if (this.$setDirty()) {
            if (this.__value__.length === 0) {
                return undefined;
            }
            return this.__value__.pop();
        } else {
            return null;
        }
    }

    push(...newItems) {
        if (this.$setDirty()) {
            return Array.prototype.push.apply(
                this.__value__,
                newItems.map((item, idx) => {
                    let errorContext = this.constructor.createErrorContext('List push error', 'error', this.__options__);
                    errorContext.path += `[${this.__value__.length + idx}]`;
                    return this.constructor._wrapSingleItem(item, this.__options__, this.__lifecycleManager__, errorContext);
                })
            );
        } else {
            return null;
        }
    }

    reverse() {
        if (this.$setDirty()) {
            this.__value__.reverse();
            return this;
        } else {
            return null;
        }
    }

    shift() {
        if (this.$setDirty()) {
            return this.__value__.shift();
        } else {
            return null;
        }
    }

    sort(cb) {
        if (this.$setDirty()) {
            return this.__wrapArr__(this.__value__.sort(cb));
        } else {
            return null;
        }
    }

    splice(index, removeCount, ...addedItems) {
        if (this.$setDirty()) {
            var spliceParams = [index, removeCount];
            addedItems.forEach(function(newItem, idx) {
                let errorContext = this.constructor.createErrorContext('List splice error', 'error', this.__options__);
                errorContext.path += `[${index + idx}]`;
                spliceParams.push(this.constructor._wrapSingleItem(newItem, this.__options__, this.__lifecycleManager__, errorContext))
            }.bind(this));
            return this.__value__.splice.apply(this.__value__, spliceParams);
            //return this.__value__.push(this.constructor._wrapSingleItem(newItem, this.__isReadOnly__, this.__options__));
        } else {
            return null;
        }
    }

    unshift(...newItems) {
        if (this.$setDirty()) {
            return Array.prototype.unshift.apply(
                this.__value__,
                newItems.map((item, idx) => {
                    let errorContext = this.constructor.createErrorContext('List unshift error', 'error', this.__options__);
                    errorContext.path += `[${idx}]`;
                    return this.constructor._wrapSingleItem(item, this.__options__, this.__lifecycleManager__, errorContext);
                })
            );
        } else {
            return null;
        }
    }

    set(index, element) {
        if (this.$setDirty()) {

            let errorContext = this.constructor.createErrorContext('List set error', 'error', this.__options__);
            return this.__value__[index] = this.constructor._wrapSingleItem(element, this.__options__, this.__lifecycleManager__, errorContext);
        } else {
            return null;
        }
    }

    // Accessor methods
    at(index) {
        var item = this.__value__[index];
        return (BaseType.validateType(item) && this.__isReadOnly__) ? item.$asReadOnly() : item;
    }

    concat(...addedArrays) {
        return this.__wrapArr__(this.__getValueArr__().concat(...addedArrays.map((array) => array.__getValueArr__ ? array.__getValueArr__() : array)));
    }

    join(separator = ',') {
        return this.__value__.join(separator);
    }

    slice(begin, end) {
        return this.__wrapArr__(this.__getValueArr__().slice(begin, end));
    }

    toString() {
        return this.__value__.toString();
    }

    valueOf() {
        return this.__value__.map(function(item) {
            return item.valueOf();
        });
    }

    toLocaleString() {
        MAILBOX.fatal('toLocaleString not implemented yet. Please do.');
    }

    indexOf(searchElement, fromIndex) {
        return this.__value__.indexOf(searchElement, fromIndex || 0);
    }

    lastIndexOf(searchElement, fromIndex) {
        return this.__value__.lastIndexOf(searchElement, fromIndex || this.__value__.length);
    }

    // Iteration methods

    forEach(iteratee, ctx) {
        this.__lodashProxy__('forEach', this.__getLodashIterateeWrapper__(iteratee, false), ctx);
    }

    find(predicate, ctx) {
        return this.__lodashProxy__('find', this.__getLodashIterateeWrapper__(predicate, true), ctx);
    }

    findIndex(predicate, ctx) {
        return this.__lodashProxy__('findIndex', this.__getLodashIterateeWrapper__(predicate, true), ctx);
    }

    map(iteratee, ctx) {
        return this.__lodashProxy__('map', this.__getLodashIterateeWrapper__(iteratee, true), ctx);
    }

    reduce(...args) {
        return _.reduce(this.__getValueArr__(), ...args);
    }

    every(fn, ctx) {
        return this.__lodashProxy__('every', this.__getLodashIterateeWrapper__(fn, true), ctx);
    }

    some(fn, ctx) {
        return this.__lodashProxy__('some', this.__getLodashIterateeWrapper__(fn, true), ctx);
    }

    filter(fn, ctx) {
        return this.__lodashProxyWrap__('filter', this.__getLodashIterateeWrapper__(fn, true), ctx);
    }

    setValue(newValue, errorContext) {
        var changed = false;
        if (newValue instanceof _List) {
            newValue = newValue.__getValueArr__();
        }
        if (_.isArray(newValue)) {
            var lengthDiff = this.__value__.length - newValue.length;
            if (lengthDiff > 0) {
                // current array is longer than newValue, fill the excess cells with undefined
                changed = true;
                this.__value__.splice(newValue.length, lengthDiff);
            }

            _.forEach(newValue, (itemValue, idx) => {
                let errorContext = errorContext ? _.clone(errorContext) : this.constructor.createErrorContext('List setValue error', 'error', this.__options__);
                errorContext.path += `[${idx}]`;
                var newItemVal = this.constructor._wrapSingleItem(itemValue, this.__options__, this.__lifecycleManager__, errorContext);
                changed = changed || newItemVal != this.__value__[idx];

                this.__value__[idx] = newItemVal;

            });
            if (changed) {
                this.$setDirty();
            }
            this.__value__.length = newValue.length;
        }
        return changed;
    }

    setValueDeep(newValue, errorContext = null) {
        var changed = false;
        if (newValue instanceof _List) {
            newValue = newValue.__getValueArr__();
        }

        if (_.isArray(newValue)) {
            changed = this.length !== newValue.length;
            let assignIndex = 0;
            let errorContext = errorContext ? _.clone(errorContext) : this.constructor.createErrorContext('List setValueDeep error', 'error', this.__options__);
            _.forEach(newValue, (itemValue, newValIndex) => {
                const currentItem = this.__value__[assignIndex];
                const isPassedArrayLength = this.length <= assignIndex;
                if (!isPassedArrayLength && (typeof currentItem === 'null' || typeof currentItem === 'undefined')) {
                    MAILBOX.post(errorContext.level, `${errorContext.entryPoint}: "${errorContext.path}" List setValueDeep() is not implemented for null cells yet`);
                } else if (isPassedArrayLength) {
                    this.__value__[assignIndex] = this.constructor._wrapSingleItem(itemValue, this.__options__, this.__lifecycleManager__, errorContext);
                } else if (currentItem.setValueDeep && !BaseType.validateType(itemValue) && !currentItem.$isReadOnly()) {
                    if (currentItem.constructor.allowPlainVal(itemValue)) {
                        changed = currentItem.setValueDeep(itemValue) || changed;
                    } else {
                        changed = true;
                        this.__value__[assignIndex] = this.constructor._wrapSingleItem(itemValue, this.__options__, this.__lifecycleManager__, errorContext);
                    }
                } else {
                    changed = changed || itemValue !== currentItem;
                    this.__value__[assignIndex] = this.constructor._wrapSingleItem(itemValue, this.__options__, this.__lifecycleManager__, errorContext);
                }
                assignIndex++;
            });
            if (changed) {
                this.$setDirty(true);
            }
            this.__value__.length = newValue.length;
        }
        return changed;
    }

    /**
     * get iterator over all array elements that are dirtyable
     */
    // consider optimizing if array is of primitive type only
    $dirtyableElementsIterator(yielder) {
        for (let element of this.__value__) {
            if (element && _.isFunction(element.$calcLastChange)) {
                yielder(this, element);
            }
        }
    }
}

export default defineType('List', {
    spec: function() {
        return {
            length: Number.withDefault(0)
        };
    }
}, null, _List);
