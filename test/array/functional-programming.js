import Typorama from '../../src';
import {expect} from 'chai';
import {aNumberArray, aStringArray, anEmptyArray, UserType, AddressType} from './builders';
import {either} from '../../src/composite'
import sinon from 'sinon';

describe('map', function() {
    var usersList = Typorama.Array.of(UserType).create([{age: 11}, {age: 12}]);

	describe('with property name iteratee', function() {

		it('naively works', function() {
			var newList = usersList.map('age');

			// Take a property and return an array
			expect(_.isArray(newList)).to.be.true;
			// Make sure the values and length are correct
			expect(newList).to.eql([11, 12]);
		});

		it('matches property value to thisArg', function() {
			var newList = usersList.map('age', 11);

			// Take a property and return an array
			expect(_.isArray(newList)).to.be.true;
			// Make sure the values and length are correct
			expect(newList).to.eql([true, false]);
		});
	});

	describe('with object iteratee', function() {
		it('works with typorama instances', function() {
			var newList = usersList.map(UserType.create({age: 11}));

			// Take a property and return an array
			expect(_.isArray(newList)).to.be.true;
			// Make sure the values and length are correct
			expect(newList).to.eql([true, false]);
		});

		it('works with pojos', function() {
			var newList = usersList.map({age: 11});

			// Take a property and return an array
			expect(_.isArray(newList)).to.be.true;
			// Make sure the values and length are correct
			expect(newList).to.eql([true, false]);
		});
	});

	it('calls a callback function on every item in an array and constructs a new array from the results', function() {
        var newList = aNumberArray([1, 2, 3]).map(num => num * 2);

		// Take a callback function and return an array
		expect(_.isArray(newList)).to.be.true;
		// Make sure the values and length are correct
		expect(newList).to.eql([2, 4, 6]);
	});

	it('passes the index to the map func', function() {
        var newList = aNumberArray([1, 2, 3]).map((num, index) => num * index);

		expect(_.isArray(newList)).to.be.true;
		expect(newList).to.eql([0, 2, 6]);
	});


	it('provides readonly version if needsd', function() {
		var roList = usersList.$asReadOnly();

		var doubles = (user,index) => {
			expect(user.$isReadOnly()).to.be.equal(true);
			return user.age * index;
		};

		var newList = roList.map(doubles);

		expect(_.isArray(newList)).to.be.true;
		expect(newList).to.eql([0, 12]);
	});

});

describe('reduce', function() {
	var sum = (a, b) => a + b;

    it('runs the iteratee for each member of the array minus one', function() {
        var spy = sinon.spy();
        var items = [1,2,3];

        aNumberArray(items).reduce(spy);

        expect(spy).to.have.callCount(items.length - 1);
    });

	it('aggregate all elements of an array', function () {
        expect(aNumberArray([10, 20, 30]).reduce(sum)).to.equal(60);
	});

	it('aggregate all elements of an array, starting from the zero element', function () {
        expect(aNumberArray([10, 20, 30]).reduce(sum, 40)).to.equal(100);
	});

	it('uses the first item of the array as the zero element if none was supplied', function () {
		var numberList = aNumberArray();

		expect(numberList.reduce(_.identity)).to.eql(numberList.at(0));
	});

	it('uses the supplied zero element', function () {
		var zeroElement = 42;

		expect(aNumberArray().reduce(_.identity, zeroElement)).to.equal(zeroElement);
	});

	it('should match currentValue to the correct current item from the array', function () {
		var mixedList = Typorama.Array.of(either(UserType, AddressType)).create([{_type: 'User'}, {_type: 'Address'}])

		mixedList.reduce(function(accumulator, currentValue, index) {
			expect(currentValue).to.eql(mixedList.at(index));
		});
	});

	//TODO make this pass
	xit('handles an empty array as long as a zero element is supplied', function() {
		expect(anEmptyArray().reduce(_.identity, 0)).to.equal(0);
	});
});

describe('forEach',function() {
	it('should call the method passed with item, index, arr', function() {
		var sourceArr = ['a','b'];
		var numberList = aStringArray(sourceArr);
		var spy = sinon.spy();

		numberList.forEach(spy);

		expect(spy).to.have.been.calledWith('a', 0, numberList).and.calledWith('b', 1, numberList);
	});
});

describe('every',function() {
	it('returns false for an empty array', function() {
		expect(anEmptyArray().every(_.identity)).to.beFalse;
	});

	it('returns true if all elements pass the test provided by the callback', function() {
		expect(aStringArray(['a', 'a']).every(elem => elem === 'a')).to.beTrue
	});

	it('returns false if at least one element in the array returns false from the callback', function() {
		expect(aStringArray(['a', 'b']).every(elem => elem === 'a')).to.beFalse

	})
});

describe('some', function() {
	it('should return true if any elements pass the test provided by the callback', function() {
		var arr = Typorama.Array.of(Typorama.String).create(['a', 'b']);
		var areAll = arr.some(function (element) {
			return element === 'a';
		});
		expect(areAll).to.equal(true);
	});
	it('should return false if all elements fail to pass the test provided by the callback', function() {
		var arr = Typorama.Array.of(Typorama.String).create(['b', 'b']);
		var areAll = arr.some(function (element) {
			return element === 'a';
		});
		expect(areAll).to.equal(false);
	})
});

describe('find',function() {
	it('should return the first element that passes the callback test', function() {
		var arr = Typorama.Array.of(UserType).create([{name: 'lando'}, {name: 'mollari'}]);
		var itemFound = arr.find(function(element) {
			return element.name === 'mollari'
		});
		expect(itemFound).to.equal(arr.at(1));
	});
	xit('should return the first element that matches the passed object', function() {
		var arr = Typorama.Array.of(UserType).create([{name: 'lando'}, {name: 'mollari'}]);
		var itemFound = arr.find({name: 'mollari'});
		expect(itemFound).to.equal(arr.at(1));
	});
	it('should return undefined if no elements that pass the callback test', function() {
		var arr = Typorama.Array.of(UserType).create([{name: 'lando'}, {name: 'mollari'}]);
		var itemFound = arr.find((element) => element.name === `G'Kar`);
		expect(itemFound).to.equal(undefined);
	})

});

describe('findIndex',function() {
	it('should return the index of the first element that passes the callback test', function() {
		var arr = Typorama.Array.of(UserType).create([{name: 'lando'}, {name: 'mollari'}]);
		var itemIndex = arr.findIndex(function(element) {
			return element.name === 'mollari'
		});
		expect(itemIndex).to.equal(1);
	});
	xit('should return the index of the first element that matches the passed object', function() {
		var arr = Typorama.Array.of(UserType).create([{name: 'lando'}, {name: 'mollari'}]);
		var itemIndex = arr.findIndex({name: 'mollari'});
		expect(itemIndex).to.equal(1);
	});
	it('should return -1 if no elements pass the callback test', function() {
		var arr = Typorama.Array.of(UserType).create([{name: 'lando'}, {name: 'mollari'}]);
		var itemIndex = arr.findIndex((element) => `G'Kar` === element.name);
		expect(itemIndex).to.equal(-1);
	})

});

describe('filter',function() {
	it('should return a new array with all elements that pass the callback test', function() {
		var arr = Typorama.Array.of(Typorama.Number).create([42, 3, 15, 4, 7]);
		var filterArray = arr.filter(function(element) {
			return element > 5;
		});
              expect(filterArray).to.be.instanceof(Typorama.Array);
		expect(filterArray.length).to.equal(3);
		expect(filterArray.valueOf()).to.eql([42, 15, 7]);
	});
	it('should return an empty array if no elements pass the callback test', function() {
		var arr = Typorama.Array.of(Typorama.Number).create([42, 3, 15, 4, 7]);
		var filterArray = arr.filter(function(element) {
			return element > 50;
		});
		expect(filterArray.length).to.equal(0);
	});
});