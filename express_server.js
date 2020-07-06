const express = require('express');
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');

// generates a "unique" shortURL
const generateRandomString = () => {
  return Math.random().toString(36).slice(7);
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  let webPage = { urls: urlDatabase };
  res.render('urls_index', webPage);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls/:shortURL', (req, res) => {
  let webPage = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render('urls_show', webPage);
});

app.post('/urls', (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send('Ok'); // Respond with 'Ok' (we will replace this)
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});