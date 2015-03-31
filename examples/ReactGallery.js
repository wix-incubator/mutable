var Typorama = require('../src/index');
var React = require('react');

var Image = Typorama.define('Image', {
	spec: function(ThisType){		
		return {
			src: Typorama.String.withDefault('http://default-image.jpg'),
			alt: Typorama.String.withDefault('default-image')
		};		
	}
});


var GalleryItem = Typorama.define('GalleryItem', {
	spec: function(ThisType){		
		return {
			title: Typorama.String.withDefault('Item'),
			image: Image			
		};	
	}
});


var GalleryPropTypes = Typorama.define('GalleryProps', {
	spec: function(ThisType){		
		return {
			items: Typorama.Array.of(GalleryItem).withDefault(function(times){
				return [GalleryItem.defaults(), GalleryItem.defaults(), GalleryItem.defaults()];
			})
		};		
	}
});


var Gallery = React.createClass({
	getDefaultProps: function(){	
		return GalleryPropTypes.defaults();
	},
	componentWillMount(){
		
		/*
		   var props = new GalleryPropTypes(this.props);
			Object.defineProperty(this, 'props', {
				get: function(){
					return props;
				},
				set: function(props){
					debugger
					props = new GalleryPropTypes(props);
				}
			});
		*/
	},
	componentWillUpdate : function(nextProps, nextState, nextContext){
		//nextProps.  = GalleryPropTypes.prototype;
	},
	componentWillReceiveProps(newProps){
		//newProps.__proto__ = GalleryPropTypes.prototype;
		//should be merge
		//this.props = new GalleryPropTypes(newProps);
	},
	render : function(){
	debugger
		var items = this.props.items.map(function(item){
			return <div>
				<h1>{item.title}</h1>
				<img src={item.image.src} alt={item.image.alt}/>
			</div>;
		});
		return <div>{items}</div>;
	}

});

var App = React.createClass({
	componentDidMount: function(){
		setInterval(this.setState.bind(this,{}),3000)
	},
	render: function(){
		return <div>
			<Gallery {...new GalleryPropTypes().$asReadOnly()}/>
		</div>;
	}
});


React.render(<App/>, document.body)