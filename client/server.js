const express = require('express');
const serveStatic = require('serve-static');
const path = require('path');
const fs = require('fs');
const app = express();

const PORT = 3000;

var https = require('https').createServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
}, app);


app.use('/', serveStatic(path.join(__dirname, '/dist')));

https.listen(PORT, () => { console.log('listening on port 3000')});