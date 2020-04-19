import React, { Component } from 'react';
//REDUX
import { connect } from 'react-redux';
import { setCurrentChannel, setPrivateChannel } from '../../actions/index';

//SEMANTIC
import { Menu, Icon } from 'semantic-ui-react';

class Starred extends Component {
	state = {
		activeChannel: '',
		starredChannels: []
	};
	displayChannels = (channels) =>
		channels.length > 0 &&
		channels.map((channel) => (
			<Menu.Item
				key={channel.id}
				onClick={() => this.changeChannel(channel)}
				name={channel.name}
				style={{ opacity: 0.7 }}
				active={channel.id === this.state.activeChannel}
			/>
		));

	setActiveChannel = (channel) => {
		this.setState({ activeChannel: channel.id });
	};

	changeChannel = (channel) => {
		this.setActiveChannel(channel);
		this.props.setCurrentChannel(channel);
		this.props.setPrivateChannel(false);
	};

	render() {
		const { starredChannels } = this.state;
		return (
			<Menu.Menu className="menu">
				<Menu.Item>
					<span>
						<Icon name="star" /> STARRED
					</span>{' '}
					({starredChannels.length})
				</Menu.Item>
				{this.displayChannels(starredChannels)}
			</Menu.Menu>
		);
	}
}

export default connect(null, { setPrivateChannel, setCurrentChannel })(Starred);
