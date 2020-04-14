import React, { Component } from 'react';
import { Link } from 'react-router-dom';
//SEMANTIC UI
import { Grid, Form, Segment, Button, Header, Message, Icon } from 'semantic-ui-react';
//FIREBASE
import firebase from '../../firebase';

class Register extends Component {
	state = {
		username: '',
		email: '',
		password: '',
		passwordConfirmation: '',
		errors: []
	};

	isFormValid = () => {
		let errors = [];
		let error;

		if (this.isFormEmpty(this.state)) {
			error = { message: 'Fill in all fields' };
			this.setState({ errors: errors.concat(error) });
			return false;
		} else if (!this.isPasswordValid(this.state)) {
			error = { message: 'Password is invalid' };
			this.setState({ errors: errors.concat(error) });
			return false;
		} else {
			return true;
		}
	};

	isFormEmpty = ({ username, email, password, passwordConfirmation }) => {
		return !username.length || !email.length || !password.length || !passwordConfirmation;
	};

	isPasswordValid = ({ password, passwordConfirmation }) => {
		if (password.length < 6) {
			return false;
		} else if (password !== passwordConfirmation) {
			return false;
		} else {
			return true;
		}
	};

	handleChange = (event) => {
		this.setState({ [event.target.name]: event.target.value });
	};
	handleSubmit = (event) => {
		if (this.isFormValid()) {
			event.preventDefault();
			firebase
				.auth()
				.createUserWithEmailAndPassword(this.state.email, this.state.password)
				.then((createdUser) => {
					console.log(createdUser);
				})
				.catch((err) => console.error(err));
		}
	};

	displayErrors = (errors) => errors.map((error, i) => <p key={i}>{error.message}</p>);

	render() {
		const { username, email, password, passwordConfirmation, errors } = this.state;
		return (
			<Grid textAlign="center" verticalAlign="middle" className="app">
				<Grid.Column style={{ maxWidth: 450 }}>
					<Header as="h2" icon color="orange" textAlign="center">
						<Icon name="puzzle piece" color="orange" />Register for DevChat
					</Header>
					<Form size="large" onSubmit={this.handleSubmit}>
						<Segment stacked>
							<Form.Input
								type="text"
								fluid
								name="username"
								icon="user"
								iconPosition="left"
								placeholder="Username"
								onChange={this.handleChange}
								value={username}
							/>
							<Form.Input
								type="email"
								fluid
								name="email"
								icon="mail"
								iconPosition="left"
								placeholder="Email adress"
								onChange={this.handleChange}
								value={email}
							/>
							<Form.Input
								type="password"
								fluid
								name="password"
								icon="lock"
								iconPosition="left"
								placeholder="Password"
								onChange={this.handleChange}
								value={password}
							/>
							<Form.Input
								type="password"
								fluid
								name="passwordConfirmation"
								icon="repeat"
								iconPosition="left"
								placeholder="Password Confirmation"
								onChange={this.handleChange}
								value={passwordConfirmation}
							/>
							<Button color="orange" fluid size="large">
								Submit
							</Button>
						</Segment>
					</Form>
					{errors.length > 0 && <Message error>{this.displayErrors(errors)}</Message>}
					<Message>
						Already registered ? <Link to="/login">Login</Link>
					</Message>
				</Grid.Column>
			</Grid>
		);
	}
}

export default Register;
