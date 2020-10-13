const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();

admin.initializeApp();

const config = {
  apiKey: "AIzaSyDQkAMdjbWPkXtLwVSmJroP_eUiMjArfxw",
  authDomain: "psionic-social.firebaseapp.com",
  databaseURL: "https://psionic-social.firebaseio.com",
  projectId: "psionic-social",
  storageBucket: "psionic-social.appspot.com",
  messagingSenderId: "745455804572",
  appId: "1:745455804572:web:3140d015ba96ae7bb0cd59",
  measurementId: "G-7Z4JLCWW1D"
};

const firebase = require('firebase');
firebase.initializeApp(config);

const db = admin.firestore();

app.get('/screams', (req,res)=>{
  db
  .firestore()
  .collection('scream')
  .orderBy('createdAt','desc')
  .get()
  .then((data) => {
    let screams = [];
    data.forEach((doc) => {
      screams.push({
        screamId: doc.id,
        body: doc.data().body,
        userHandle: doc.data().userHandle,
        createdAt: doc.data().createdAt
      });
    });
    return res.json(screams);
  })
  .catch((err) => console.error(err));
})

app.post('/scream', (req, res) => {
  if(req.method !=='POST'){
    return res.status(400).json({ error: 'Method not Allowed'});
  }
  const newScream={
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString()
  };
  db
  .firestore()
  .collection("scream")
  .add(newScream)
  .then( doc => {
    res.json({message: `document ${doc.id} created successfully`});
  })
  .catch(err => {
    res.status(500).json({error: 'something went wrong'});
    console.log('something went wrong');
  });
});

const isEmail = (email) => {
  const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if(email.match(emailRegEx)) return true;
  else return false;
}

const isEmpty = (string) => {
  if(string.trim() === '') return true;
  else return false;
}

// signup route
app.post('/signup',(req,res)=>{
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

  let errors = {};

  if(isEmpty(newUser.email)){
    errors.email = 'Email must not be empty'
  } else if(!isEmail(newUser.email)){
    errors.email = 'Must be a valid email address';
  }

  if(isEmpty(newUser.password)) errors.password = "Must not be empty";
  if(newUser.password !== newUser.confirmPassword) errors.confirmPassword = "Password must match";
  if(isEmpty(newUser.handle)) errors.handle = "Must not be empty";
  

  if(Object.keys(errors).length > 0) return res.status(400).json(errors);
  //  validate data
  let token, userId;
  db.doc(`users/${newUser.handle}`)
  .get()
  .then(doc => {
    if(doc.exists){
      return res.status(400).json({handle: 'this handle already taken'});
    } else {
      return firebase
      .auth()
      .createUserWithEmailAndPassword(newUser.email, newUser.password)
    }  
  })
  .then(data => {
    userId = data.user.uid;
    return data.user.getIdToken();
  })
  .then(idtoken => {
    token = idtoken;
    const userCredentials = {
      handle: newUser.handle,
      email: newUser.email,
      createdAt: new Date().toISOString(),
      userId
    };
    return db.doc(`/users/${newUser.handle}`).set(userCredentials);
  })
  .then(() => {
    return res.status(201).json({token});
  })
  .catch(err => {
    console.log(err);
    if(err.code === 'auth/email-already-in-use'){
      return res.status(201).json({email:'Email is already in use'});
    } else {
      return res.status(500).json({error: err.code});
    }
    
  })

})

exports.api = functions.https.onRequest(app);