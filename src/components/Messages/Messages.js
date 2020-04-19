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
		isPrivateChannel: this.props.isPrivateChannel,
		privateMessagesRef: firebase.database().ref('privateMessages'),
		messagesRef: firebase.database().ref('messages'),
		messages: [],
		messagesLoading: true,
		currentChannel: this.props.currentChannel,
		user: this.props.currentUser,
		numUniqueUsers: '',
		searchTerm: '',
		searchLoading: false,
		searchResults: []
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
		const ref = this.getMessagesRef();
		ref.child(channelId).on('child_added', (snap) => {
			loadedMessages.push(snap.val());

			this.setState({
				messages: loadedMessages,
				messagesLoading: false
			});
			console.log(loadedMessages);
		});
		this.countUniqueUsers(loadedMessages);
	};

	getMessagesRef = () => {
		const { messagesRef, privateMessagesRef, isPrivateChannel } = this.state;
		return isPrivateChannel ? privateMessagesRef : messagesRef;
	};

	countUniqueUsers = (messages) => {
		const uniqueUsers = messages.reduce((acc, message) => {
			if (!acc.includes(message.user.name)) {
				acc.push(message.user.name);
			}
			return acc;
		}, []);
		const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0;
		const numUniqueUsers = `${uniqueUsers.length} user${plural ? 's' : ''}`;
		this.setState({ numUniqueUsers });
	};

	displayMessages = (messages) =>
		messages.length > 0 &&
		messages.map((message) => <Message key={message.timestamp} message={message} user={this.state.user} />);

	displayChannelName = (channel) => {
		return channel ? `${this.state.isPrivateChannel ? '@' : '#'}${channel.name}` : '';
	};

	handleSearchChange = (event) => {
		this.setState(
			{
				searchTerm: event.target.value,
				searchLoading: true
			},
			() => this.handleSearchMessages()
		);
	};

	handleSearchMessages = () => {
		const channelMessages = [ ...this.state.messages ];
		const regex = new RegExp(this.state.searchTerm, 'gi');
		const searchResults = channelMessages.reduce((acc, message) => {
			if ((message.content && message.content.match(regex)) || message.user.name.match(regex)) {
				acc.push(message);
			}
			return acc;
		}, []);
		this.setState({ searchResults });
	};

	render() {
		const {
			messagesRef,
			messages,
			currentChannel,
			user,
			numUniqueUsers,
			searchTerm,
			searchResults,
			isPrivateChannel
		} = this.state;
		return (
			<React.Fragment>
				<MessagesHeader
					channelName={this.displayChannelName(currentChannel)}
					numUniqueUsers={numUniqueUsers}
					handleSearchChange={this.handleSearchChange}
					isPrivateChannel={isPrivateChannel}
				/>
				<Segment className="messages">
					<Comment.Group>
						{searchTerm ? this.displayMessages(searchResults) : this.displayMessages(messages)}
					</Comment.Group>
				</Segment>
				<MessageForm
					messagesRef={messagesRef}
					currentChannel={currentChannel}
					currentUser={user}
					isPrivateChannel={isPrivateChannel}
					getMessagesRef={this.getMessagesRef}
				/>
			</React.Fragment>
		);
	}
}

export default Messages;
