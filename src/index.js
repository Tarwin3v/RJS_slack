import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

//STYLE
import 'semantic-ui-css/semantic.min.css';

//COMP
import App from './components/App';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

const Root = () => (
	<Router>
		<Switch>
			<Route exact path="/" component={App} />
			<Route path="/login" component={Login} />
			<Route path="/register" component={Register} />
		</Switch>
	</Router>
);

ReactDOM.render(<Root />, document.getElementById('root'));
registerServiceWorker();
