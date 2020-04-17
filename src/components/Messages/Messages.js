import React, { Component } from 'react';
//FIREBASE
import firebase from '../../firebase';
//REDUX
//SEMANTIC
import { Segment, Comment } from 'semantic-ui-react';
//COMP
import MessagesHeader from './MessagesHeader';
import MessageForm from './MessageForm';
import Message from './Message';

class Messages extends Component {
	state = {
		messagesRef: firebase.database().ref('messages'),
		messages: [],
		messagesLoading: true,
		currentChannel: this.props.currentChannel,
		user: this.props.currentUser
	};

	componentDidMount() {
		const { currentChannel, user } = this.state;
		if (currentChannel && user) {
			this.addListeners(currentChannel.id);
		}
	}

	addListeners = (channelId) => {
		this.addMessageListener(channelId);
	};

	addMessageListener = (channelId) => {
		let loadedMessages = [];
		this.state.messagesRef.child(channelId).on('child_added', (snap) => {
			loadedMessages.push(snap.val());
			console.log(loadedMessages);
			this.setState({
				messages: loadedMessages,
				messagesLoading: false
			});
		});
	};

	displayMessages = (messages) =>
		messages.length > 0 &&
		messages.map((message) => <Message key={message.timestamp} message={message} user={this.state.user} />);

	render() {
		const { messagesRef, messages, currentChannel, user } = this.state;
		return (
			<React.Fragment>
				<MessagesHeader />
				<Segment className="messages">
					<Comment.Group>{this.displayMessages(messages)}</Comment.Group>
				</Segment>
				<MessageForm messagesRef={messagesRef} currentChannel={currentChannel} currentUser={user} />
			</React.Fragment>
		);
	}
}

export default Messages;
