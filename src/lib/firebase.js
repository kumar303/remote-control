import firebase from 'firebase';

const config = {
  apiKey: "AIzaSyD9cmg7IjnqqcJS4VzRJ4hd33VbPZTJRU0",
  authDomain: "remote-control-796d2.firebaseapp.com",
  databaseURL: "https://remote-control-796d2.firebaseio.com",
  storageBucket: "remote-control-796d2.appspot.com",
  messagingSenderId: "997013944296"
};

const app = firebase.initializeApp(config);

export default app;
