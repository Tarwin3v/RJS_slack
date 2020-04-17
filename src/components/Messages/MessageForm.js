import React, { Component } from 'react';
//FIREBASE
import firebase from '../../firebase';
//SEMANTIC
import { Segment, Button, Input } from 'semantic-ui-react';
//COMP
import FileModal from './FileModal';

export class MessageForm extends Component {
	state = {
		message: '',
		channel: this.props.currentChannel,
		user: this.props.currentUser,
		loading: false,
		modal: false,
		errors: []
	};

	handleChange = (event) => {
		this.setState({
			[event.target.name]: event.target.value,
			errors: []
		});
	};

	createMessage = () => {
		const message = {
			timestamp: firebase.database.ServerValue.TIMESTAMP,
			user: {
				id: this.state.user.uid,
				name: this.state.user.displayName,
				avatar: this.state.user.photoURL
			},
			content: this.state.message
		};
		return message;
	};
	sendMessage = () => {
		const { messagesRef } = this.props;
		const { message, channel } = this.state;
		if (message) {
			this.setState({ loading: true });

			messagesRef
				.child(channel.id)
				.push()
				.set(this.createMessage())
				.then(() => {
					this.setState({ loading: false, message: '', errors: [] });
				})
				.catch((err) => {
					console.log(err);
					this.setState({ loading: false, errors: this.state.errors.concat(err) });
				});
		} else {
			this.setState({ errors: this.state.errors.concat({ message: 'Add a message' }) });
		}
	};

	openModal = () => {
		this.setState({ modal: true });
	};
	closeModal = () => {
		this.setState({ modal: false });
	};

	render() {
		const { errors, message, loading, modal } = this.state;
		return (
			<Segment className="message__form">
				<Input
					fluid
					name="message"
					style={{ marginBottom: '0.7em' }}
					label={<Button icon={'add'} />}
					labelPosition="left"
					placeholder="Write your message"
					value={message}
					onChange={this.handleChange}
					className={errors.some((error) => error.message.includes('message')) ? 'error' : ''}
				/>
				<Button.Group className="button__group">
					<Button
						color="orange"
						content="Add Reply"
						labelPosition="left"
						icon="edit"
						disabled={loading}
						onClick={this.sendMessage}
						style={{ marginRight: '1em' }}
					/>
					<Button
						color="teal"
						content="Upload Media"
						labelPosition="right"
						icon="cloud upload"
						disabled={loading}
						onClick={this.openModal}
					/>
					<FileModal modal={modal} closeModal={this.closeModal} />
				</Button.Group>
			</Segment>
		);
	}
}

export default MessageForm;
