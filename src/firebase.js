import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage';

const firebaseConfig = {
	apiKey: 'AIzaSyBdEkBZWOdkByc6x5-TTGywK1_YhCCykvg',
	authDomain: 'slack-clone-6fab9.firebaseapp.com',
	databaseURL: 'https://slack-clone-6fab9.firebaseio.com',
	projectId: 'slack-clone-6fab9',
	storageBucket: 'slack-clone-6fab9.appspot.com',
	messagingSenderId: '418886744755',
	appId: '1:418886744755:web:d4421e23714268bb970ec6',
	measurementId: 'G-30SS4BCSQP'
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase;
