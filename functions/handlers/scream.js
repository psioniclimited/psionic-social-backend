const {db} = require('../util/admin');

exports.getAllScream = (req,res)=>{
  db.collection('scream')
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
}

exports.postOneScream = (req, res) => {
  
  if(req.body.body.trim() ===''){
    return res.status(400).json({ error: 'Body must not be empty'});
  }

  const newScream={
    body: req.body.body,
    userHandle: req.body.handle,
    createdAt: new Date().toISOString()
  };

  db.collection("scream")
  .add(newScream)
  .then( doc => {
    res.json({message: `document ${doc.id} created successfully`});
  })
  .catch(err => {
    res.status(500).json({error: 'something went wrong'});
    console.log('something went wrong');
  });
};


// get scream
exports.getScream = (req, res) => {
  let screamData = {};
  db.doc(`/scream/${req.params.screamId}`).get()
  .then(doc => {
    if(!doc.exists){
      return res.status(404).json({error: 'Scream not found'})
    }
    screamData = doc.data();
    screamData.screamId = doc.id;
    return db
    .collection('comments')
    .orderBy('createdAt','desc')
    .where('screamId','==',req.params.screamId)
    .get();
  })
  .then(data => {
    screamData.comments = [];
    data.forEach(doc => {
      screamData.comments.push(doc.data());
    });
    return res.json(screamData);
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({error: err.code});
  })
};

// comment on a post
exports.commentOnScream = (req, res) => {
  if(req.body.body.trim() === '') return res.status(400).json({error: 'Must not be empty'});

  const newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    screamId: req.params.screamId,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl
  }

  db.doc(`/scream/${req.params.screamId}`).get()
  .then(doc => {
    if(!doc.exists){
      return res.status(404).json({error: 'Scream not found'});
    }
    return db.collection('comments').add(newComment);
  })
  .then(()=>{
    res.json(newComment);
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({error: 'Something went wrong'});
  })
}