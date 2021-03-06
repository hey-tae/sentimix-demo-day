const { ObjectId } = require('bson');

module.exports = function(app, passport, db) {
  const fs = require('fs');
  const path = require('path');
  const ObjectID = require('mongodb').ObjectID
  const multer = require('multer');
  
  var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        // cb(null, file.fieldname + '-' + Date.now())
        cb(null, file.originalname)
        console.log('multer file', file)

    }
});
  
var upload = multer({ storage: storage });
// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

// load recorder page
app.get('/record',isLoggedIn, function(req, res) {
  db.collection('playlists').find({owner: req.user._id}).sort( { date: -1 } ).toArray((err, audioFiles) => {
    if (err) return console.log(err)
    console.log('playlist length', audioFiles.length)
    res.render('recorder.ejs', {
      user : req.user,
      audioFiles: audioFiles
    })
  })
});

app.get('/uploader', function(req, res) {
  res.render('uploader.ejs');
});


//player
app.get('/player/:id',function(req, res) {
  db.collection('playlists').find({owner: ObjectId(req.params.id)}).sort( { date: -1 } ).toArray((err, audioFiles) => {
    if (err) return console.log(err)
    res.render('player.ejs', {
      user : req.user,
      audioFiles: audioFiles
    })
  })
});

// upload audio to server 
app.post('/upload',[isLoggedIn, upload.single('audio_data')], function(req, res) {
  const audioData = fs.readFileSync(path.join(__dirname + '/../uploads/' + req.file.filename))
  console.log(audioData.length, req.file.filename)
  console.log(req.body.type)
  console.log(req.body)
  db.collection('playlists').save({
    audioData: audioData,
    type: req.body.type ? req.body.type : 'sentiment',
    owner: req.user._id,
    title: req.file.filename,
    date: new Date()

  }, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/record')
  })
});


    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        db.collection('messages').find().toArray((err, result) => {
          if (err) return console.log(err)
          res.render('profile.ejs', {
            user : req.user,
            messages: result
          })
        })
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// message board routes ===============================================================

    app.post('/messages', (req, res) => {
      db.collection('messages').save({name: req.body.name, msg: req.body.msg, thumbUp: 0, thumbDown:0}, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
        res.redirect('/profile')
      })
    })

    app.put('/messages', (req, res) => {
      db.collection('messages')
      .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
        $set: {
          thumbUp:req.body.thumbUp + 1
        }
      }, {
        sort: {_id: -1},
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
    })

    app.put('/thumbDown', (req, res) => {
      db.collection('messages')
      .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
        $set: {
          thumbUp:req.body.thumbUp - 1
        }
      }, {
        sort: {_id: -1},
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
    })

    app.delete('/deletePlaylist', (req, res) => {
      const title = ObjectID(req.body.title)
      db.collection('playlists').findOneAndDelete({_id: title}, (err, result) => {
        if (err) return res.send(500, err)
        res.send('song deleted!')
      })
    })

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}

