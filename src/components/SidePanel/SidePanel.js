import React, { Component } from 'react';

//SEMANTIC
import { Menu } from 'semantic-ui-react';

//COMP
import UserPanel from './UserPanel';
import Channels from './Channels';
import DirectMessages from './DirectMessages';
import Starred from './Starred';

class SidePanel extends Component {
	render() {
		const { currentUser, primaryColor } = this.props;
		return (
			<Menu size="large" inverted fixed="left" vertical style={{ background: primaryColor, fontSize: '1.2rem' }}>
				<UserPanel currentUser={currentUser} primaryColor={primaryColor} />
				<Starred currentUser={currentUser} />
				<Channels currentUser={currentUser} />
				<DirectMessages currentUser={currentUser} />
			</Menu>
		);
	}
}

export default SidePanel;
