import firebase from 'firebase/app'
import 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

var config = {
  apiKey: "AIzaSyBBZ_NsUbWFHy9BapcXfN4nfokN5IsI-n4",
  authDomain: "phippsbricks.firebaseapp.com",
  databaseURL: "https://phippsbricks.firebaseio.com",
  projectId: "phippsbricks",
  storageBucket: "phippsbricks.appspot.com",
  messagingSenderId: "544957687759"
};
const fire = firebase.initializeApp(config);
const db = firebase.firestore();
export const auth = firebase.auth();
export const provider = new firebase.auth.GoogleAuthProvider();
export default fire;