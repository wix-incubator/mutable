import _ from 'lodash'
import React from 'react'

export default React.createClass({
	render() {
		return (
			<fieldset>
				<legend>{this.props.title || 'missing title'}</legend>
				{this.props.children}
			</fieldset>
		);
	}
});
