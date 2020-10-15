const functions = require('firebase-functions');

const app = require('express')();

const FBAuth = require('./util/FBAuth');

const { getAllScream, postOneScream } = require('./handlers/scream');
const { signup, login, uploadImage } = require('./handlers/user');


// post routes
app.get('/screams', getAllScream);
app.post('/scream', FBAuth, postOneScream);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);

// user route
app.post('/login', login);
app.post('/signup', signup);



exports.api = functions.https.onRequest(app);