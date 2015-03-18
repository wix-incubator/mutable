import _ from 'lodash'
import React from 'react/addons'
import Immutable from 'immutable'
import Typorama from '../src'

debugger;

window.count = 0;
window.renderEmpty = false;
var onlyChild;
var dx = 200;
var dy = 200;
var dw = 100;
var dh = 100;

window.Immutable = Immutable;

function runTest(fn, times = 10){
	console.group('Test');
	var agg = [];
	while(times--){
		var t = performance.now();
		fn();
		agg[agg.length] = performance.now() - t;
	}
	console.groupEnd('Test');
	console.log(agg.reduce(function(a, b){return a + b}) / agg.length, 'avg');
}

window.runTest  = runTest;

function randInt(min, max){
	return (min + Math.random() * (max - min))|0;
}

function getRandomColor() {
	var letters = '0123456789ABCDEF'.split('');
	var color = '#';
	for (var i = 0; i < 6; i++ ) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

function createCrap(){
	var count = 100;
	var crap = {};
	while(count--){
		crap[Math.random()] = Math.random();
	}

	return crap;
}

function createLeafData(maxDeep, maxChild, childIndex){
	var children = [];
	if(maxDeep > 0){
		var index = maxChild//randInt(1, maxChild);
		while(index--){
			children[children.length] = createLeafData(maxDeep - 1,maxChild, index);
		}
	}
	return {
		key: (childIndex ? childIndex:'_')+ '-' + index,
		x: randInt(0, dx),
		y: randInt(0, dy),
		w: randInt(0, dw),
		h: randInt(0, dh),
		bg: getRandomColor(),
		crap: createCrap(),
		children: children
	}
}

function changeDataNode(data){
	data.bg = getRandomColor();
	data.x = randInt(0, dx)
	data.y = randInt(0, dy)
	data.w = randInt(0, dw)
	data.h = randInt(0, dh)
	return data;
}

function changeImmutableDataNode(data){
	return data.set('bg', getRandomColor())
		.set('x', randInt(0, dx))
		.set('y', randInt(0, dy))
		.set('w', randInt(0, dw))
		.set('h', randInt(0, dh))
}

function mapData(data, fn, level, index){
	level = level || 1;
	data = fn(data, level, index);
	data.children = data.children.map(function(child, i){
		return mapData(child, fn, level + 1, i);
	});
	return data;
}

function mapImmutableData(data, fn, level, index){
	level = level || 1;
	data = fn(data, level, index);
	data.get('children').map(function (child, i) {
		data = data.setIn(['children',i],mapImmutableData(child, fn, level + 1, i));
	});
	return data;
}


window.createLeafData = createLeafData;




var Leaf = React.createClass({
	shouldComponentUpdate(nextProps, nextState){
		return true;
	},
	render: function(){
		window.count++;
		var data = this.props.data;
		if(renderEmpty){
			return <div key={data.key}>
				{data.children.map((leaf) => <Leaf key={leaf.key} data={leaf}/>)}
			</div>
		} else {
			//console.count('json');
			//Object.keys(data.crap).map((v)=>{data.crap[v] * data.crap[v]})
			return <div key={data.key} style={
				{
					borderRadius: '50%',
					position: 'absolute',
					background: data.bg,
					width: data.w,
					height: data.h,
					left: data.x,
					top: data.y
				}
			}>
				{data.children.map((leaf) => <Leaf key={leaf.key} data={leaf}/>)}
			</div>
		}
	}

})


var LeafImmut = React.createClass({
	mixins:[React.addons.PureRenderMixin],
	render: function(){
		window.count++;
		var data = this.props.data;
		if(renderEmpty){
			return <div key={data.get('key')}>
				{data.get('children').toArray().map((leaf) => <LeafImmut key={leaf.get('key')} data={leaf}/>)}
			</div>
		} else {
			//data.get('crap').map((v)=>{v*v})
			//console.count('immutable');
			return <div style={
				{
					borderRadius: '50%',
					position: 'absolute',
					background: data.get('bg'),
					width: data.get('w'),
					height: data.get('h'),
					left: data.get('x'),
					top: data.get('y')
				}
			}>
				{data.get('children').toArray().map((leaf) => <LeafImmut key={leaf.get('key')} data={leaf}/>)}
			</div>
		}
	}

})


function leafChangeCondition(data, level, index){
	if(level === 3){
		return true;
		onlyChild = true;
	}
	return false;
}

var data = createLeafData(5, 5);
var immutData = Immutable.fromJS(data);

export default React.createClass({
	getInitialState: function(){
		return {
			test: ''
		};
	},
	componentDidMount: function(){
		console.timeEnd('render');
		console.log('count', count);
	},
	componentDidUpdate: function(){
		console.timeEnd('render');
		console.log('count', count);
	},
	renderTest: function(){

		var out;

		if(this.state.test === 'renderImmutable'){

			out = <LeafImmut data={immutData}/>

		} else if(this.state.test === 'renderJSON'){

			out = <Leaf data={data}/>

		} else {

			out = null;

		}

		return out;

	},
	updateData: function(){

		console.time('change data json');

			data = mapData(data, function(data, level, index){
				if(leafChangeCondition(data, level, index)){
					return changeDataNode(data);
				}
				return data;
			});

		console.timeEnd('change data json');

		onlyChild = false;

		console.time('change data immutable');

			immutData = mapImmutableData(immutData, function(data, level, index){
				if(leafChangeCondition(data, level, index)){
					return changeImmutableDataNode(data);
				}
				return data;
			});

		console.timeEnd('change data immutable');
	},
	render: function(){
		console.time('render');

		window.count = 0;
		onlyChild = false;

		return <div>

			<button onClick={()=>{this.updateData();this.setState({test: 'renderImmutable'})}}>renderImmutable</button>
			<button onClick={()=>{this.updateData();this.setState({test: 'renderJSON'})}}>renderJSON</button>

			<div id="test" style={{position:'relative'}}>{this.renderTest()}</div>

		</div>
	}
});
