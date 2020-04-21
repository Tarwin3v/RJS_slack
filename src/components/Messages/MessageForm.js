import React, { Component } from 'react';
import uuidv4 from 'uuid/v4';
//FIREBASE
import firebase from '../../firebase';
//SEMANTIC
import { Segment, Button, Input } from 'semantic-ui-react';
//COMP
import FileModal from './FileModal';
import ProgressBar from './ProgressBar';

export class MessageForm extends Component {
	state = {
		storageRef: firebase.storage().ref(),
		typingRef: firebase.database().ref('typing'),
		uploadState: '',
		uploadTask: null,
		percentUploaded: 0,
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

	handleKeyDown = () => {
		const { message, typingRef, channel, user } = this.state;
		if (message) {
			typingRef.child(channel.id).child(user.uid).set(user.displayName);
		} else {
			typingRef.child(channel.id).child(user.uid).remove();
		}
	};

	createMessage = (fileUrl = null) => {
		const message = {
			timestamp: firebase.database.ServerValue.TIMESTAMP,
			user: {
				id: this.state.user.uid,
				name: this.state.user.displayName,
				avatar: this.state.user.photoURL
			}
		};

		if (fileUrl !== null) {
			message['image'] = fileUrl;
		} else {
			message['content'] = this.state.message;
		}
		return message;
	};

	sendMessage = () => {
		const { getMessagesRef } = this.props;
		const { message, channel, typingRef, user } = this.state;
		if (message) {
			this.setState({ loading: true });

			getMessagesRef()
				.child(channel.id)
				.push()
				.set(this.createMessage())
				.then(() => {
					this.setState({ loading: false, message: '', errors: [] });
					typingRef.child(channel.id).child(user.uid).remove();
				})
				.catch((err) => {
					console.log(err);
					this.setState({ loading: false, errors: this.state.errors.concat(err) });
				});
		} else {
			this.setState({ errors: this.state.errors.concat({ message: 'Add a message' }) });
		}
	};

	sendFileMessage = (fileUrl, ref, pathToUpload) => {
		ref
			.child(pathToUpload)
			.push()
			.set(this.createMessage(fileUrl))
			.then(() => {
				this.setState({
					uploadState: 'done'
				});
			})
			.catch((err) => {
				console.log(err);
				this.setState({
					errors: this.state.errors.concat(err)
				});
			});
	};

	getPath = () => {
		if (this.props.isPrivateChannel) {
			return `chat/private-${this.state.channel.id}`;
		} else {
			return `chat/public`;
		}
	};

	uploadFile = (file, metadata) => {
		const pathToUpload = this.state.channel.id;
		const ref = this.props.getMessagesRef();
		const filePath = `${this.getPath()}/${uuidv4()}.jpg`;

		this.setState(
			{
				uploadState: 'uploading',
				uploadTask: this.state.storageRef.child(filePath).put(file, metadata)
			},
			() => {
				this.state.uploadTask.on(
					'state_changed',
					(snap) => {
						const percentUploaded = Math.round(snap.bytesTransferred * 100 / snap.totalBytes);
						this.setState({ percentUploaded });
					},
					(err) => {
						console.log(err);
						this.setState({
							errors: this.state.errors.concat(err),
							uploadState: 'error',
							uploadTask: null
						});
					},
					() => {
						this.state.uploadTask.snapshot.ref
							.getDownloadURL()
							.then((downloadUrl) => {
								this.sendFileMessage(downloadUrl, ref, pathToUpload);
							})
							.catch((err) => {
								console.log(err);
								this.setState({
									errors: this.state.errors.concat(err),
									uploadState: 'error',
									uploadTask: null
								});
							});
					}
				);
			}
		);
	};

	openModal = () => {
		this.setState({ modal: true });
	};
	closeModal = () => {
		this.setState({ modal: false });
	};

	render() {
		const { errors, message, loading, modal, uploadState, percentUploaded } = this.state;
		return (
			<Segment className="message__form">
				<ProgressBar uploadState={uploadState} percentUploaded={percentUploaded} />
				<Input
					fluid
					name="message"
					style={{ marginBottom: '0.7em' }}
					label={<Button icon={'add'} />}
					labelPosition="left"
					placeholder="Write your message"
					value={message}
					onChange={this.handleChange}
					onKeyDown={this.handleKeyDown}
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
						disabled={uploadState === 'uploading'}
						onClick={this.openModal}
					/>

					<FileModal modal={modal} closeModal={this.closeModal} uploadFile={this.uploadFile} />
				</Button.Group>
			</Segment>
		);
	}
}

export default MessageForm;
