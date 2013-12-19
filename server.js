var express = require('express')
  , http = require('http')
  , path = require('path')
  , exphbs = require('express3-handlebars')
  , fs = require('fs');

var store = null;
try {
  store = require('./data/store.json');
} catch (e) {
  store = [];
  fs.writeFile('./data/store.json', '[]');
}

var app = express();

var PORT = process.env.PORT || 3000;

app.engine('handlebars', exphbs({defaultLayout: 'main'}));

app.set('view engine', 'handlebars')
  .use(express.favicon())
  .use(express.logger('dev'))
  .use(express.bodyParser())
  .use(express.methodOverride())
  .use(app.router)
  .use(express.static(path.join(__dirname, 'public')));

app.get('/gifts', function(req, res) {
  res.type('json');
  res.send(store);
});

app.get('/gift', function(req, res) {
  res.render('new_gift');
});

app.get('/gift/:id', function(req, res) {
  var gifts = store.filter(function(item) {
    return item.id == req.params['id'];
  });

  console.log(gifts);

  res.render('gift', gifts[0]);
});

app.post('/gift', function(req, res) {

  saveStore({
    name: req.body.name,
    description: req.body.description
  });

  res.redirect('/gifts');
});

function saveStore(data) {
  store.push({
    id: store.length,
    name: data.name,
    description: data.description
  });

  fs.writeFile('./data/store.json', JSON.stringify(store));

  return store;
}

http.createServer(app).listen(PORT, function() {
  console.log('Asteroid gifts server is listening on port', PORT);
});