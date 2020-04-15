import React, { Component } from 'react';
import { Link } from 'react-router-dom';
//SEMANTIC UI
import { Grid, Form, Segment, Button, Header, Message, Icon } from 'semantic-ui-react';
//FIREBASE
import firebase from '../../firebase';

class Login extends Component {
	state = {
		email: '',
		password: '',
		errors: [],
		loading: false
	};

	handleChange = (event) => {
		this.setState({ [event.target.name]: event.target.value });
	};
	handleSubmit = (event) => {
		event.preventDefault();
		if (this.isFormValid(this.state)) {
			this.setState({ errors: [], loading: true });
			firebase
				.auth()
				.signInWithEmailAndPassword(this.state.email, this.state.password)
				.then((signedInUser) => {
					console.log(signedInUser);
					this.setState({ loading: false });
				})
				.catch((err) => {
					console.log(err);
					this.setState({ errors: this.state.errors.concat(err), loading: false });
				});
		}
	};

	isFormValid = ({ email, password }) => email && password;

	handleInputError = (errors, inputName) => {
		return errors.some((error) => error.message.toLowerCase().includes(inputName)) ? 'error' : '';
	};

	displayErrors = (errors) => errors.map((error, i) => <p key={i}>{error.message}</p>);

	render() {
		const { email, password, errors, loading } = this.state;
		return (
			<Grid textAlign="center" verticalAlign="middle" className="app">
				<Grid.Column style={{ maxWidth: 450 }}>
					<Header as="h1" icon color="orange" textAlign="center">
						<Icon name="code branch" color="orange" />Login for DevChat
					</Header>
					<Form size="large" onSubmit={this.handleSubmit}>
						<Segment stacked>
							<Form.Input
								type="email"
								className={this.handleInputError(errors, 'email')}
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
								className={this.handleInputError(errors, 'password')}
								fluid
								name="password"
								icon="lock"
								iconPosition="left"
								placeholder="Password"
								onChange={this.handleChange}
								value={password}
							/>

							<Button
								className={loading ? 'loading' : ''}
								disabled={loading}
								color="orange"
								fluid
								size="large"
							>
								Submit
							</Button>
						</Segment>
					</Form>
					{errors.length > 0 && <Message error>{this.displayErrors(errors)}</Message>}
					<Message>
						You dont have an account ? <Link to="/register">Register</Link>
					</Message>
				</Grid.Column>
			</Grid>
		);
	}
}

export default Login;
