(function (factory) {
    if (typeof define === "function" && define.amd) {
        define(["exports", "module", "lodash", "./defineType", "./BaseType", "./number", "./string", "./defineTypeUtils"], factory);
    } else if (typeof exports !== "undefined" && typeof module !== "undefined") {
        factory(exports, module, require("lodash"), require("./defineType"), require("./BaseType"), require("./number"), require("./string"), require("./defineTypeUtils"));
    }
})(function (exports, module, _lodash, _defineType, _BaseType2, _number, _string, _defineTypeUtils) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    var _ = _interopRequire(_lodash);

    var defineType = _interopRequire(_defineType);

    var BaseType = _interopRequire(_BaseType2);

    var number = _interopRequire(_number);

    var string = _interopRequire(_string);

    var generateWithDefault = _defineTypeUtils.generateWithDefault;

    var _Array = (function (_BaseType) {
        function _Array() {
            var value = arguments[0] === undefined ? [] : arguments[0];
            var options = arguments[1] === undefined ? {} : arguments[1];

            _classCallCheck(this, _Array);

            if (options.subTypes && _.isArray(options.subTypes)) {
                options.subTypes = options.subTypes.reduce(function (subTypes, type) {
                    subTypes[type.id || type.name] = type;
                    return subTypes;
                }, {});
            }

            _get(Object.getPrototypeOf(_Array.prototype), "constructor", this).call(this, value, options);
        }

        _inherits(_Array, _BaseType);

        _createClass(_Array, {
            toJSON: {
                value: function toJSON() {
                    return this.__value__.map(function (item) {
                        return item instanceof BaseType ? item.toJSON() : item;
                    });
                }
            },
            copyWithin: {

                // To check with Nadav: map, pop, push, reverse, shift, sort, concat, slice, some, unshift, join, valueOf

                // Add a Warn method to BaseType

                // Mutator methods

                value: function copyWithin() {
                    throw "Slice not implemented yet. Please do.";
                }
            },
            fill: {
                value: function fill() {
                    throw "Slice not implemented yet. Please do.";
                }
            },
            pop: {
                value: function pop() {
                    if (this.__isReadOnly__) {
                        return null;
                    }
                    this.__isInvalidated__ = true;
                    return this.__value__.pop();
                }
            },
            push: {
                value: function push() {
                    var _this = this;

                    for (var _len = arguments.length, newItems = Array(_len), _key = 0; _key < _len; _key++) {
                        newItems[_key] = arguments[_key];
                    }

                    if (this.__isReadOnly__) {
                        return null;
                    }

                    this.$setDirty();
                    var options = this.__options__;

                    return Array.prototype.push.apply(this.__value__, newItems.map(function (item) {
                        return _this.constructor._wrapSingleItem(item, options);
                    }));
                }
            },
            reverse: {
                value: function reverse() {
                    if (this.__isReadOnly__) {
                        return null;
                    }
                    this.__isInvalidated__ = true;
                    return this.__value__.reverse();
                }
            },
            shift: {
                value: function shift() {
                    if (this.__isReadOnly__) {
                        return null;
                    }
                    this.__isInvalidated__ = true;
                    return this.__value__.shift();
                }
            },
            sort: {
                value: function sort(cb) {
                    if (this.__isReadOnly__) {
                        return null;
                    }
                    this.__isInvalidated__ = true;
                    return this.__value__.sort(cb);
                }
            },
            setValue: {
                value: function setValue(newValue) {
                    var _this = this;

                    if (newValue instanceof _Array) {
                        newValue = newValue.toJSON();
                    }
                    if (_.isArray(newValue)) {
                        //fix bug #33. reset the current array instead of replacing it;
                        this.__value__.length = 0;
                        _.forEach(newValue, function (itemValue) {
                            _this.push(itemValue);
                        });
                    }
                }
            },
            splice: {
                value: function splice(index, removeCount) {
                    for (var _len = arguments.length, addedItems = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
                        addedItems[_key - 2] = arguments[_key];
                    }

                    if (this.__isReadOnly__) {
                        return null;
                    }
                    this.$setDirty();
                    var spliceParams = [index, removeCount];
                    addedItems.forEach((function (newItem) {
                        spliceParams.push(this.constructor._wrapSingleItem(newItem, this.__options__));
                    }).bind(this));
                    return this.__value__.splice.apply(this.__value__, spliceParams);
                    //return this.__value__.push(this.constructor._wrapSingleItem(newItem, this.__isReadOnly__, this.__options__));
                }
            },
            unshift: {
                value: function unshift() {
                    if (this.__isReadOnly__) {
                        return null;
                    }
                    this.__isInvalidated__ = true;
                    return this.__value__.unshift();
                }
            },
            at: {

                // Accessor methods

                value: function at(index) {
                    var item = this.__value__[index];
                    return this.__isReadOnly__ && item instanceof BaseType ? item.$asReadOnly() : item;
                }
            },
            concat: {
                value: function concat() {
                    for (var _len = arguments.length, addedArrays = Array(_len), _key = 0; _key < _len; _key++) {
                        addedArrays[_key] = arguments[_key];
                    }

                    return new this.constructor(Array.prototype.concat.apply(this.__value__, addedArrays.map(function (array) {
                        return array.__value__ || array;
                    })), this.__options__);
                }
            },
            join: {
                value: function join() {
                    var separator = arguments[0] === undefined ? "," : arguments[0];

                    return this.__value__.join(separator);
                }
            },
            toSource: {
                value: function toSource() {
                    throw "Slice not implemented yet. Please do.";
                }
            },
            toString: {
                value: function toString() {
                    throw "Slice not implemented yet. Please do.";
                }
            },
            valueOf: {
                value: function valueOf() {
                    return this.__value__.map(function (item) {
                        return item.valueOf();
                    });
                }
            },
            toLocaleString: {
                value: function toLocaleString() {
                    throw "Slice not implemented yet. Please do.";
                }
            },
            indexOf: {
                value: function indexOf() {
                    throw "Slice not implemented yet. Please do.";
                }
            },
            lastIndexOf: {
                value: function lastIndexOf() {
                    throw "Slice not implemented yet. Please do.";
                }
            },
            forEach: {
                // Iteration methods

                value: function forEach(cb) {
                    var that = this;
                    this.__value__.forEach(function (item, index, arr) {
                        cb(item, index, that);
                    });
                }
            },
            entries: {
                value: function entries() {
                    throw "Slice not implemented yet. Please do.";
                }
            },
            find: {
                value: function find(cb) {
                    var self = this;
                    return _.find(this.__value__, function (element, index, array) {
                        return cb(element, index, self);
                    });
                    return _.find(this.__value__, cb);
                }
            },
            findIndex: {
                value: function findIndex(cb) {
                    var self = this;
                    return _.findIndex(this.__value__, function (element, index, array) {
                        return cb(element, index, self);
                    });
                }
            },
            keys: {
                value: function keys() {
                    throw "Slice not implemented yet. Please do.";
                }
            },
            reduce: {
                value: function reduce() {
                    throw "Slice not implemented yet. Please do.";
                }
            },
            reduceRight: {
                value: function reduceRight() {
                    throw "Slice not implemented yet. Please do.";
                }
            },
            values: {
                value: function values() {
                    throw "Slice not implemented yet. Please do.";
                }
            }
        }, {
            defaults: {
                value: function defaults() {
                    return [];
                }
            },
            test: {
                value: function test(value) {
                    return Array.isArray(value);
                }
            },
            wrapValue: {
                value: function wrapValue(value, spec, options) {
                    var _this = this;

                    if (value instanceof BaseType) {
                        return value.__value__.map(function (itemValue) {
                            return _this._wrapSingleItem(itemValue, options);
                        }, this);
                    }

                    return value.map(function (itemValue) {
                        return _this._wrapSingleItem(itemValue, options);
                    }, this);
                }
            },
            _wrapSingleItem: {
                value: function _wrapSingleItem(itemValue, options) {
                    if (itemValue instanceof BaseType) {
                        return itemValue;
                    } else if (typeof options.subTypes === "function") {
                        return options.subTypes.create(itemValue, options.subTypes.options);
                    } else if (typeof options.subTypes === "object") {

                        var subType = options.subTypes[itemValue._type ? itemValue._type : number.test(itemValue) ? number.name : string.test(itemValue) ? string.name : Object.keys(options.subTypes)[0]];

                        return subType.create(itemValue, subType.options);
                    }
                }
            },
            of: {
                value: function of(subTypes, defaults, test) {
                    return this.withDefault(defaults, test, { subTypes: subTypes });
                }
            }
        });

        return _Array;
    })(BaseType);

    module.exports = _Array;

    _Array.withDefault = generateWithDefault();

    ["map", "filter", "slice"].forEach(function (key) {

        var loFn = _[key];
        _Array.prototype[key] = function (fn, ctx) {

            var valueArray = loFn(this.__value__, function () {
                return fn.apply(this, arguments);
            }, ctx || this);

            return new this.constructor(valueArray, false, this.__options__);
        };
    });

    ["every", "some"].forEach(function (key) {

        var loFn = _[key];
        _Array.prototype[key] = function (fn, ctx) {

            var valueArray = loFn(this.__value__, function () {
                return fn.apply(ctx || this, arguments);
            });

            return valueArray;
        };
    });

    defineType("Array", {
        spec: function spec() {
            return {
                length: number.withDefault(0)
            };
        }
    }, _Array);
});

//fix bug #33. reset the current array instead of replacing it;
//# sourceMappingURL=array.js.map