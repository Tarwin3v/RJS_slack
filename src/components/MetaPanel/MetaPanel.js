import React, { Component } from 'react';
//SEMANTIC
import { Segment, Accordion, Header, Icon, Image } from 'semantic-ui-react';

class MetaPanel extends Component {
	state = {
		currentChannel: this.props.currentChannel,
		isPrivateChannel: this.props.isPrivateChannel,
		activeIndex: 0
	};

	setActiveIndex = (event, titleProps) => {
		const { index } = titleProps;
		const { activeIndex } = this.state;
		const newIndex = activeIndex === index ? -1 : index;
		this.setState({ activeIndex: newIndex });
	};
	render() {
		const { activeIndex, isPrivateChannel, currentChannel } = this.state;

		if (isPrivateChannel) return null;
		return (
			<Segment loading={!currentChannel}>
				<Header as="h3" attached="top">
					About # {currentChannel && currentChannel.name}
				</Header>
				<Accordion styled attached="true">
					<Accordion.Title active={activeIndex === 0} index={0} onClick={this.setActiveIndex}>
						<Icon name="dropdown" />
						<Icon name="info" />
						Details
					</Accordion.Title>
					<Accordion.Content active={activeIndex === 0}>
						{currentChannel && currentChannel.details}
					</Accordion.Content>
					<Accordion.Title active={activeIndex === 1} index={1} onClick={this.setActiveIndex}>
						<Icon name="dropdown" />
						<Icon name="user cirle" />
						Top Posters
					</Accordion.Title>
					<Accordion.Content active={activeIndex === 1}>Posters</Accordion.Content>
					<Accordion.Title active={activeIndex === 2} index={2} onClick={this.setActiveIndex}>
						<Icon name="dropdown" />
						<Icon name="pencil" />
						Created By
					</Accordion.Title>
					<Accordion.Content active={activeIndex === 2}>
						<Header as="h3">
							<Image circular src={currentChannel && currentChannel.createdBy.avatar} />
							{currentChannel && currentChannel.createdBy.name}
						</Header>
					</Accordion.Content>
				</Accordion>
			</Segment>
		);
	}
}

export default MetaPanel;
