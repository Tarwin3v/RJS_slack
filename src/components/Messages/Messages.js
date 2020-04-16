import React, { Component } from 'react';
//SEMANTIC
import { Segment, Comment } from 'semantic-ui-react';
//COMP
import MessagesHeader from './MessagesHeader';
import MessageForm from './MessageForm';

class Messages extends Component {
	render() {
		return (
			<React.Fragment>
				<MessagesHeader />
				<Segment>
					<Comment.Group className="messages">{/*Messages*/}</Comment.Group>
				</Segment>
				<MessageForm />
			</React.Fragment>
		);
	}
}

export default Messages;
