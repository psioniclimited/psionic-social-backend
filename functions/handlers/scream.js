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
}