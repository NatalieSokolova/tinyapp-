const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
app.set('view engine', 'ejs'); 
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// generates a "unique" string (used for shortURL)
const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};

// homepage message
// app.get('/', (req, res) => {
//   res.send('Hello!');
// });

// app.get('/urls.json', (req, res) => {
//   res.json(urlDatabase);
// });

//login
app.post('/login', (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
  console.log('username:', username)
  res.redirect('/urls');
});

//logout
app.post('/logout', (req, res) => {
  const username = req.body.username;
  res.clearCookie('username');
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
    username: req.cookies['username']
  }
  res.render('urls_index', templateVars);
});

// newURL form
app.get('/urls/new', (req, res) => {
  const templateVars = {
    username: req.cookies['username']
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

app.get('/register', (req, res) => {
  const templateVars = {
    username: null
  };
  res.render('register', templateVars);
})

// app.get('/hello', (req, res) => {
//   res.send('<html><body>Hello <b>World</b></body></html>\n');
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
