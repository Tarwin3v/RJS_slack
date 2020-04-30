import React, { Component } from "react";
import { Link } from "react-router-dom";
import md5 from "md5";
//SEMANTIC UI
import {
  Grid,
  Form,
  Segment,
  Button,
  Header,
  Message,
  Icon,
} from "semantic-ui-react";
//FIREBASE
import firebase from "../../firebase";

class Register extends Component {
  state = {
    username: "",
    email: "",
    password: "",
    passwordConfirmation: "",
    errors: [],
    loading: false,
    //@q https://firebase.google.com/docs/reference/js/firebase.database.Reference
    usersRef: firebase.database().ref("users"),
  };

  isFormValid = () => {
    let errors = [];
    let error;
    //@q check if an input is empty
    if (this.isFormEmpty(this.state)) {
      //@q if an input empty then we set an error obj with an error message
      error = { message: "Fill in all fields" };
      //@q we concat this error object this our error state array
      this.setState({ errors: errors.concat(error) });
      //@q then we return false
      return false;
      //@q check if the password have atleast 6 characters && if the password match the passwordConfirmation input
    } else if (!this.isPasswordValid(this.state)) {
      error = { message: "Password is invalid" };
      this.setState({ errors: errors.concat(error) });
      return false;
    } else {
      //@q at this point everything is working we can send back true && valid our inputs
      return true;
    }
  };

  isFormEmpty = ({ username, email, password, passwordConfirmation }) => {
    return (
      !username.length ||
      !email.length ||
      !password.length ||
      !passwordConfirmation
    );
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
    event.preventDefault();
    //@q if our isFormValid() function send back true we can go in the if block
    if (this.isFormValid()) {
      //@q we clean errors state array && set loading to true
      this.setState({ errors: [], loading: true });
      //@q we call firebase to create our new user with the data in our state
      //@q https://firebase.google.com/docs/reference/js/firebase.auth.Auth#createuserwithemailandpassword
      firebase
        .auth()
        .createUserWithEmailAndPassword(this.state.email, this.state.password)
        .then((createdUser) => {
          //@q https://firebase.google.com/docs/reference/js/firebase.auth#usercredential
          //@q https://firebase.google.com/docs/reference/js/firebase.User#updateprofile
          //@q we get back a UserCredential object with a user property && and updateProfile method
          createdUser.user
            .updateProfile({
              displayName: this.state.username,
              photoURL: `http://gravatar.com/avatar/${md5(
                createdUser.user.email
              )}?d=identicon`,
            })
            .then(() => {
              //@q then we persist this data to our database
              this.saveUser(createdUser).then(() => {
                console.log("User saved");
              });
              //@q at this point we set loading to false
              this.setState({ loading: false });
            })
            .catch((err) => {
              console.log(err);
              this.setState({
                errors: this.state.errors.concat(err),
                loading: false,
              });
            });
        })
        .catch((err) => {
          console.error(err);
          this.setState({
            errors: this.state.errors.concat(err),
            loading: false,
          });
        });
    }
  };

  //@q function to persist our updated data to our db
  saveUser = (createdUser) => {
    return this.state.usersRef.child(createdUser.user.uid).set({
      name: createdUser.user.displayName,
      avatar: createdUser.user.photoURL,
    });
  };

  handleInputError = (errors, inputName) => {
    return errors.some((error) =>
      error.message.toLowerCase().includes(inputName)
    )
      ? "error"
      : "";
  };

  displayErrors = (errors) =>
    errors.map((error, i) => <p key={i}>{error.message}</p>);

  render() {
    const {
      username,
      email,
      password,
      passwordConfirmation,
      errors,
      loading,
    } = this.state;
    return (
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h1" icon color="orange" textAlign="center">
            <Icon name="code branch" color="orange" />
            Register for DevChat
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
                className={this.handleInputError(errors, "email")}
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
                className={this.handleInputError(errors, "password")}
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
                className={this.handleInputError(errors, "password")}
                fluid
                name="passwordConfirmation"
                icon="repeat"
                iconPosition="left"
                placeholder="Password Confirmation"
                onChange={this.handleChange}
                value={passwordConfirmation}
              />
              <Button
                className={loading ? "loading" : ""}
                disabled={loading}
                color="orange"
                fluid
                size="large"
              >
                Submit
              </Button>
            </Segment>
          </Form>
          {errors.length > 0 && (
            <Message error>{this.displayErrors(errors)}</Message>
          )}
          <Message>
            Already registered ? <Link to="/login">Login</Link>
          </Message>
        </Grid.Column>
      </Grid>
    );
  }
}

export default Register;
