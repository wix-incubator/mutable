import _ from 'lodash';
import Typorama from '../src';
import {aDataTypeWithSpec} from '../test-kit/testDrivers/index';
import {expect, err} from 'chai';
import {revision} from '../src/lifecycle';
import {lifecycleContract} from './lifecycle.contract.spec.js';
import sinon from 'sinon';

describe('promitive defaults', function(){
	
	it('null function', function(){
		var Type = Typorama.Function.nullable().withDefault(null);
		var value = Type();
		expect(value === null).to.equal(true);
	});
	
	
	it('null string', function(){
		var Type = Typorama.String.nullable().withDefault(null);
		var value = Type();
		expect(value === null).to.equal(true);
	});
	
	
	it('null boolean', function(){
		var Type = Typorama.Boolean.nullable().withDefault(null);
		var value = Type();
		expect(value === null).to.equal(true);
	});
	
	
	it('null number', function(){
		var Type = Typorama.Number.nullable().withDefault(null);
		var value = Type();
		expect(value === null).to.equal(true);
	});

///////////////////////////////////////////////////////////////////////	
///////////////////////////////////////////////////////////////////////	
	
	it('function', function(){
		var Type = Typorama.Function.withDefault(function(){return 'abc'});
		var value = Type();
		expect(value() === 'abc').to.equal(true);
	});
	
	it('string', function(){
		var Type = Typorama.String.withDefault('abc');
		var value = Type();
		expect(value === 'abc').to.equal(true);
	});
	
	
	it('boolean', function(){
		var Type = Typorama.Boolean.withDefault(true);
		var value = Type();
		expect(value === true).to.equal(true);
	});
	
	
	it('number', function(){
		var Type = Typorama.Number.withDefault(123);
		var value = Type();
		expect(value === 123).to.equal(true);
	});
	
});
