var connect = require('connect')
  , http = require('http')
  , path = require('path');

var app = connect();

var PORT = process.env.PORT || 3000;

app.use(connect.favicon())
  .use(connect.logger('dev'))
  .use(connect.static(path.join(__dirname, 'public')));

http.createServer(app).listen(PORT, function() {
  console.log('Asteroids server is listening on port', PORT);
});