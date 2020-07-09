const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
app.set('view engine', 'ejs');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// URL database
const urlDatabase = {
  // b6UTxQ: { longURL: "https://www.tsn.ca", userID: "dcewc3" },
  // i3BoGr: { longURL: "https://www.google.ca", userID: "tiklay" }
};

// USERS database
const users = {};

// generates a "unique" string
const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};

// name and pw might be the same, but email is unique
const findUserByEmail = (email) => {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return false;
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
    user: users[req.cookies['user_id']]
  };
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const templateVars = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    user: findUserByEmail(req.body.email) // checks if user already registered
  }
  
  if (!templateVars.user.email) {
    res.render('email_error', templateVars)
  } else {
    if (req.body.password !== templateVars.user.password) { // checks if the pw input matches registered pw
      res.render('password_error', templateVars)
    }
  }
  const userID = templateVars.user.id;
  console.log('userID: ', userID);
  // set a user_id cookie containing the user's ID
  res.cookie('user_id', userID);
  res.redirect('/urls');
});

//logout
app.post('/logout', (req, res) => {
  //const user = users[req.cookies['user_id']];
  res.clearCookie('user_id');
  // for (let urls in urlDatabase) {
  //   delete urlDatabase[urls];
  // }
  res.redirect('/urls');
});

// list of all URLs ?????
app.get('/urls', (req, res) => {

  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies['user_id']]
  };

  if (req.cookies['user_id']) { // checks if logged in

    res.render('urls_index', templateVars);

  } else {

    res.render('error_message.ejs', templateVars)

  }

});

// newURL form
app.get('/urls/new', (req, res) => {
  const user = findUserByEmail(req.body.email); // checks if user already registered

  if (req.cookies['user_id']) { // logout to clear cookies before checking!

const templateVars = {
      user: users[req.cookies['user_id']]
    };

    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});


//redirects to specific short/longURL page
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[req.params.shortURL].longURL

  if (urlDatabase[shortURL]) { // if exists - render the page
    const templateVars = {
      shortURL,
      longURL,
      user: users[req.cookies['user_id']]
    };

    if (urlDatabase[shortURL].userID === req.cookies['user_id']) {

    res.render('urls_show', templateVars);
  } else {
    res.render('manipulate_error.ejs', templateVars)
  } 
  } else { // if doesn't exist - redirect to urls list page
    res.redirect('/urls');
  }
});

// redirects to longURL website
app.get('/u/:shortURL', (req, res) => {

  const templateVars = {
      //urls: urlDatabase,
    user: users[req.cookies['user_id']],
    shortURL: req.params.shortURL,
    keys: Object.keys(urlDatabase)
  }
// loop url db to check if shortURL is there

for (const key in templateVars.keys) {

  console.log('keys: ', templateVars.keys)
  console.log('key: ', templateVars.keys[key] )
  console.log('shortURL: ', templateVars.shortURL)

  if (templateVars.keys[key] === templateVars.shortURL) {
    res.redirect(urlDatabase[templateVars.shortURL].longURL);
  } else {
    res.render('url_error.ejs', templateVars);
  }
}

  // if (templateVars.shortURL) {
  //   console.log(templateVars.shortURL); // short URL(found in address bar)
  //   res.redirect(urlDatabase[templateVars.shortURL].longURL);
  // } else if (!urlDatabase[shortURL]) {
  //   res.render('url_error.ejs', templateVars)
  // }
});

// adds new URL to the urlDatabase
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  // urlDatabase[shortURL] = longURL;
  const userID = req.cookies['user_id']
  console.log('cookies: ', userID)

  urlDatabase[shortURL] = {
    longURL,
    userID
  }
  console.log('urlDB: ', urlDatabase)
  res.redirect(`/urls/${shortURL}`); // redirects to the 'TinyURL/Short URL' webpage after clicks Submit;
});

// deletes a URL from urlDatabase
app.post('/urls/:shortURL/delete', (req, res) => {
  // console.log('shortURL: ', req.params.shortURL)
  const templateVars = {
    user: findUserByEmail(req.body.email)
  }
  if (urlDatabase[req.params.shortURL].userID === req.cookies['user_id']) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.render('manipulate_error.ejs', templateVars)
  } 

  
});

// input new url into edit form
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  console.log('shortURL: ', shortURL)

  const longURL = urlDatabase[req.params.shortURL].longURL

  // urlDatabase[req.params.shortURL].longURL

   console.log('longURL: ', longURL)
  
  //urlDatabase[shortURL] = longURL;
  urlDatabase[shortURL] = {
    longURL,
    userID: req.cookies['user_id']
  }

   console.log('urlDatabase: ', urlDatabase)
   console.log('req.body: ', req.body.longURL)

   urlDatabase[shortURL].longURL = req.body.longURL

  res.redirect('/urls');
});

// takes user to registration form
app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']]
  };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  //const user = generateRandomString();
  const templateVars = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    user: findUserByEmail(req.body.email) // checks if user already registered
  }
  if (!templateVars.user) {
    if (templateVars.email === '' || templateVars.password === '') {
      res.render('empty_fields_error', templateVars);
    }
    // if not registered - add to the USERS db
    const userID = addNewUser(templateVars.name, templateVars.email, templateVars.password);

    console.log('userID: ', userID);
    // set a user_id cookie containing the user's newly generated ID
    res.cookie('user_id', userID);
    res.redirect('/urls');
  } else {
    res.render('email_exists_error', templateVars);
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});