import _ from 'lodash'
import React from 'react'

export default React.createClass({
	render() {
		let {count, map} = React.Children;
		let {cloneWithProps} = React.addons;
		return (
			<div>
				{
					count(this.props.children) > 1 ?
						map(this.props.children, (child) => cloneWithProps(child)) :
					count(this.props.children) === 1 ?
						cloneWithProps(this.props.children) :
					null
				}
			</div>
		);
	}
});
