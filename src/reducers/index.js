import { combineReducers } from 'redux';
import * as actionTypes from '../actions/types';

const INITIAL_STATE = {
	currentUser: null,
	isLoading: true
};

const user_reducer = (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case actionTypes.SET_USER:
			return {
				currentUser: action.payload.currentUser,
				isLoading: false
			};
		case actionTypes.CLEAR_USER:
			return {
				...state,
				isLoading: false
			};
		default:
			return state;
	}
};

const INITIAL_CHANNEL_STATE = {
	currentChannel: null
};

const channel_reducer = (state = INITIAL_CHANNEL_STATE, action) => {
	switch (action.type) {
		case actionTypes.SET_CURRENT_CHANNEL:
			return {
				...state,
				currentChannel: action.payload.currentChannel
			};
		default:
			return state;
	}
};

const rootReducer = combineReducers({
	user: user_reducer,
	channel: channel_reducer
});

export default rootReducer;
