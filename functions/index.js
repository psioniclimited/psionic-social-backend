const functions = require('firebase-functions');

const app = require('express')();

const FBAuth = require('./util/FBAuth');

const {getAllScream, postOneScream} = require('./handlers/scream');
const {signup,login, uploadImage} = require('./handlers/user');


// get all post
app.get('/screams', getAllScream);
// create a post
app.post('/scream', FBAuth, postOneScream);
// signup route
app.post('/signup', signup);
// login route
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);


exports.api = functions.https.onRequest(app);