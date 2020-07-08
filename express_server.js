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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// USERS database
const users = { 
  // example users for testing
//   "userRandomID": {
//     id: "userRandomID", 
//     email: "user@example.com", 
//     password: "purple-monkey-dinosaur"
//   },
//  "user2RandomID": {
//     id: "user2RandomID", 
//     email: "user2@example.com", 
//     password: "dishwasher-funk"
//   }
}

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
}

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
}

// homepage message
// app.get('/', (req, res) => {
//   res.send('Hello!');
// });

// app.get('/urls.json', (req, res) => {
//   res.json(urlDatabase);
// });

//login
app.post('/login', (req, res) => {
  //const user = users[req.cookies['user_id']];
  const username = req.body.username;
  res.cookie('username', username);
  // console.log('username:', username);
  // console.log('body: ', req.body);
  res.redirect('/urls');
});

//logout
app.post('/logout', (req, res) => {
  // const username = req.body.username;
  // res.clearCookie('username');
  // for (let urls in urlDatabase) {
  //   delete urlDatabase[urls];
  // }
  // res.redirect('/urls');
  const user = users[req.cookies['user_id']];
  res.clearCookie('user_id');
  for (let urls in urlDatabase) {
    delete urlDatabase[urls];
  }
  res.redirect('/urls');
});

// list of all URLs
app.get('/urls', (req, res) => {
  //let webPage = { urls: urlDatabase };
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies['username'],
    user: users[req.cookies['user_id']]
  }
  res.render('urls_index', templateVars);
});

// newURL form
app.get('/urls/new', (req, res) => {
  const templateVars = {
    username: req.cookies['username'],
    user: users[req.cookies['user_id']]
  }
  res.render('urls_new', templateVars);
});

//redirects to specific short/longURL page
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) { // if exists - render the page
  const templateVars = {
    shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies['username'],
    user: users[req.cookies['user_id']]
  }
  res.render('urls_show', templateVars);
  } else { // if doesn't exist - redirect to urls list page
  res.redirect('/urls');
  }
});

// redirects to longURL website
app.get('/u/:shortURL', (req, res) => {
  console.log(req.params.shortURL) // short URL(found in address bar)
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// adds new URL to the urlDatabase
app.post('/urls', (req, res) => {
  // console.log('POST req.body: ', req.body); // found in form
  // console.log('longURL: ', longURL);
  // console.log('database: ', urlDatabase); 
    const shortURL = generateRandomString();
    const longURL = req.body.longURL;
    urlDatabase[shortURL] = longURL;
  
  res.redirect(`/urls/${shortURL}`); // redirects to the 'TinyURL/Short URL' webpage after clicks Submit;
});

// deletes a URL from urlDatabase
app.post('/urls/:shortURL/delete', (req, res) => {
  // console.log('shortURL: ', req.params.shortURL) 
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

// input new url into edit form
app.post('/urls/:shortURL', (req, res) => {
  const longURL = req.body.longURL;
  // console.log('longURL: ', longURL)
  const shortURL = req.params.shortURL;
  // console.log('shortURL: ', shortURL)
  urlDatabase[shortURL] = longURL;
  // console.log('urlDatabase: ', urlDatabase)
  res.redirect('/urls');
});

// takes user to registration form
app.get('/register', (req, res) => {
  const templateVars = {
    username: null,
    user: users[req.cookies['user_id']]
  };
  res.render('register', templateVars);
})

app.post('/register', (req, res) => {
  //const user = generateRandomString();
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  const user = findUserByEmail(email); // checks if user already registered

  if (!user) {
    // if not registered - add to the USERS db
    const userID = addNewUser(name, email, password);

    console.log('userID: ', userID);

    // set a user_id cookie containing the user's newly generated ID
    res.cookie('user_id', userID);
    
    res.redirect('/urls');
  } else {
    res.status(401).send('Error: email already exists');
  }
})

// app.get('/hello', (req, res) => {
//   res.send('<html><body>Hello <b>World</b></body></html>\n');
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});