const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
app.set('view engine', 'ejs');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
let cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
}));
const bcrypt = require('bcrypt');

// URL database
const urlDatabase = {};

// USERS database
const users = {};

const findUserByEmail = require('./helpers');

// generates a "unique" string
const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};

const addNewUser = (name, email, password) => {
  const userID = generateRandomString();
  const newUser = {
    id: userID,
    name,
    email,
    password
  };
  users[userID] = newUser;
  return userID;
};



//login
app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const templateVars = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    user: findUserByEmail(req.body.email, users) // checks if user already registered
  };
  if (!templateVars.user.email) {
    res.render('email_error', templateVars);
  } else {
    if (!bcrypt.compareSync(templateVars.password, templateVars.user.password)) {
      res.render('password_error', templateVars);
    }
  }
  const userID = templateVars.user.id;
  //console.log('userID: ', userID);
  // set a user_id cookie containing the user's ID
  req.session.user_id = userID;
  res.redirect('/urls');
});

//logout
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// list of all URLs ?????
app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id]
  };
  if (req.session.user_id) { // checks if logged in
    res.render('urls_index', templateVars);
  } else {
    res.render('error_message.ejs', templateVars);
  }
});

// newURL form
app.get('/urls/new', (req, res) => {
  //const user = findUserByEmail(req.body.email, users); // checks if user already registered
  if (req.session.user_id) { // rememder to logout to clear cookies before checking!
    const templateVars = {
      user: users[req.session.user_id]
    };
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

//redirects to specific short/longURL page
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (urlDatabase[shortURL]) { // checks if exists
    const templateVars = {
      shortURL,
      longURL,
      user: users[req.session.user_id]
    };
    if (urlDatabase[shortURL].userID === req.session.user_id) { // checks the owner
      res.render('urls_show', templateVars);
    } else {
      res.render('manipulate_error.ejs', templateVars);
    }
  } else { // if doesn't exist - redirect to urls list page
    res.redirect('/urls');
  }
});

// redirects to longURL website
app.get('/u/:shortURL', (req, res) => {
  console.log(req.params.shortURL); // short URL(found in address bar)
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
  const templateVars = {
    //urls: urlDatabase,
    user: users[req.session.user_id],
    shortURL: req.params.shortURL,
    keys: Object.keys(urlDatabase)
  };
  // loop url db to check if shortURL is there
  for (const key in templateVars.keys) {
  // console.log('keys: ', templateVars.keys)
  // console.log('key: ', templateVars.keys[key] )
  // console.log('shortURL: ', templateVars.shortURL)
    if (templateVars.keys[key] === templateVars.shortURL) {
      res.redirect(urlDatabase[templateVars.shortURL].longURL);
    } else {
      res.render('url_error.ejs', templateVars);
    }
  }
});
// adds new URL to the urlDatabase

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  // urlDatabase[shortURL] = longURL;
  const userID = req.session.user_id;
  console.log('cookies: ', userID);
  urlDatabase[shortURL] = {
    longURL,
    userID
  };
  console.log('urlDB: ', urlDatabase);
  res.redirect(`/urls/${shortURL}`); // redirects to the 'TinyURL/Short URL' webpage after clicks Submit;
});

// deletes a URL from urlDatabase
app.post('/urls/:shortURL/delete', (req, res) => {
  // console.log('shortURL: ', req.params.shortURL)
  const templateVars = {
    user: findUserByEmail(req.body.email, users)
  };
  if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.render('manipulate_error.ejs', templateVars);
  }
});

// input new url into edit form
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  console.log('shortURL: ', shortURL);
  const longURL = urlDatabase[req.params.shortURL].longURL;
  //  console.log('longURL: ', longURL)
  urlDatabase[shortURL] = {
    longURL,
    userID: req.session.user_id
  };
  //  console.log('urlDatabase: ', urlDatabase)
  //  console.log('req.body: ', req.body.longURL)
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect('/urls');
});

// takes user to registration form
app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const templateVars = {
    name: req.body.name,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10),
    user: findUserByEmail(req.body.email, users) // checks if user already registered
  };
  // console.log('pw:', templateVars.password)
  if (!templateVars.user) {
    if (templateVars.email === '' || templateVars.password === '') {
      res.render('empty_fields_error', templateVars);
    }
    // if not registered - add to the USERS db
    const userID = addNewUser(templateVars.name, templateVars.email, templateVars.password);
    console.log('userID: ', userID);
    // set a user_id cookie containing the user's newly generated ID
    req.session.user_id = userID;
    res.redirect('/urls');
  } else {
    res.render('email_exists_error', templateVars);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});