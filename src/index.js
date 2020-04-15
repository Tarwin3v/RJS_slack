import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import { BrowserRouter as Router, Switch, Route, withRouter } from 'react-router-dom';

//FIREBASE
import firebase from './firebase';

//REDUX
import { createStore } from 'redux';
import { Provider, connect } from 'react-redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import rootReducer from './reducers/index';
import { setUser } from './actions/index';
//STYLE
import 'semantic-ui-css/semantic.min.css';
//COMP
import App from './components/App';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Spinner from './components/Spinner';

class Root extends Component {
	componentDidMount() {
		firebase.auth().onAuthStateChanged((user) => {
			if (user) {
				console.log(user);
				this.props.setUser(user);
				this.props.history.push('/');
			}
		});
	}

	render() {
		return this.props.isLoading ? (
			<Spinner />
		) : (
			<Switch>
				<Route exact path="/" component={App} />
				<Route path="/login" component={Login} />
				<Route path="/register" component={Register} />
			</Switch>
		);
	}
}

const mapStateToProps = (state) => ({
	isLoading: state.user.isLoading
});

const RootWithAuth = withRouter(connect(mapStateToProps, { setUser })(Root));

const store = createStore(rootReducer, composeWithDevTools());

ReactDOM.render(
	<Provider store={store}>
		<Router>
			<RootWithAuth />
		</Router>
	</Provider>,
	document.getElementById('root')
);
registerServiceWorker();
