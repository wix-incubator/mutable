import _ from 'lodash'
import React from 'react'

export default React.createClass({
	getInitialState: function() {
		return {
			activeTab: 0
		};
	},
	setActive: function(index) {
		this.setState({activeTab: index});
	},
	isTab: (vdom) => React.isValidElement(vdom) && vdom.type.displayName == 'tab',
	render: function() {
		let { activeTab } = this.state;
		let { children } = this.props;
		let { count, map} = React.Children;

		if(count(children)) {
			let { classSet } = React.addons;

			return (
				<div>
					<div className="tab-title-wrapper">
						{map(children, function(child, index) {
							let title = _.isString(child) ? 'string' : child.props.title || 'missing title';
							let classes = classSet({
								'tab-title' : true,
								'active'    : this.state.activeTab === index
							});
							return (
								<div key={index} className={classes} onClick={() => this.setActive(index)}>
									{title}
								</div>
							);
						}, this)}
					</div>
					{map(children, (child, index) => {
						return (index === this.state.activeTab ?
							this.isTab(child) ?
								(<div className="tab-body" style={child.props.style}>{child.props.children}</div>) :
								(<div className="tab-body">{child}</div>) :
						null);
					}, this)}
				</div>
			);
		} else {
			return null;
		}
	}
});
