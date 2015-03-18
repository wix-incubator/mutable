/* @flow */
'use strict';
import React from 'react/addons'
import Immut from './views/testImmut'

window.render = () => React.render(<Immut/>, document.body);
window.React = React;
render();
