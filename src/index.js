import React, { Component } from "react";
import ReactDOM from "react-dom";
import registerServiceWorker from "./registerServiceWorker";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  withRouter,
} from "react-router-dom";

//FIREBASE
import firebase from "./firebase";

//REDUX
import { createStore } from "redux";
import { Provider, connect } from "react-redux";
import { composeWithDevTools } from "redux-devtools-extension";
import rootReducer from "./reducers/index";
import { setUser, clearUser } from "./actions/index";
//STYLE
import "semantic-ui-css/semantic.min.css";
//COMP
import App from "./components/App";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Spinner from "./components/Spinner";

class Root extends Component {
  //@q https://levelup.gitconnected.com/componentdidmakesense-react-lifecycle-explanation-393dcb19e459
  componentDidMount() {
    //@q https://firebase.google.com/docs/auth/web/manage-users#get_the_currently_signed-in_user
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        //@q if user sent back by firebase we call our setUser action with user as param
        this.props.setUser(user);
        //@q withRouter HOC give us access to history so we redirect the connected user to the home page
        this.props.history.push("/");
      } else {
        //@q no user we redirect to login page
        this.props.history.push("/login");
        //@q we clear user and set loading to false
        this.props.clearUser();
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

//@q redux give us access to state by props
const mapStateToProps = (state) => ({
  isLoading: state.user.isLoading,
});

//@q Root comp wrapped by connect of redux that give us access to actions and states
//@q && withRouter that give us access to match location and history props
const RootWithAuth = withRouter(
  connect(mapStateToProps, { setUser, clearUser })(Root)
);

//@q our store hold the complete state tree of our app
//@q https://redux.js.org/api/createstore
const store = createStore(rootReducer, composeWithDevTools());

//@q with Provider and store prop we give access to global state to our app
ReactDOM.render(
  <Provider store={store}>
    <Router>
      <RootWithAuth />
    </Router>
  </Provider>,
  document.getElementById("root")
);
registerServiceWorker();
