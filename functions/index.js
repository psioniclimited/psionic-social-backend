const functions = require('firebase-functions');

const app = require('express')();

const FBAuth = require('./util/FBAuth');

const { 
  getAllScream, 
  postOneScream, 
  getScream, 
  commentOnScream } = require('./handlers/scream');
const { 
  signup, 
  login, 
  uploadImage, 
  addUserDetails, 
  getAuthenticatedUser } = require('./handlers/user');


// post routes
app.get('/screams', getAllScream);
app.post('/scream', FBAuth, postOneScream);
app.get('/scream/:screamId',getScream);
app.post('/scream/:screamId/comment', FBAuth, commentOnScream)


// user route
app.post('/login', login);
app.post('/signup', signup);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);



exports.api = functions.https.onRequest(app);