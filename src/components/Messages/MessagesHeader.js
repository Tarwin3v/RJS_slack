import React, { Component } from 'react';
//SEMANTIC
import { Header, Segment, Input, Icon } from 'semantic-ui-react';

class MessagesHeader extends Component {
	render() {
		const { channelName, numUniqueUsers, handleSearchChange } = this.props;
		return (
			<Segment clearing>
				<Header fluid="true" as="h2" floated="left" styles={{ marginBottom: 0 }}>
					<span>
						{channelName}
						<Icon name={'star outline'} color="black" />
					</span>
					<Header.Subheader>{numUniqueUsers}</Header.Subheader>
				</Header>
				<Header floated="right">
					<Input
						size="mini"
						icon="search"
						name="searchTerm"
						placeholder="Search Messages"
						onChange={handleSearchChange}
					/>
				</Header>
			</Segment>
		);
	}
}

export default MessagesHeader;
