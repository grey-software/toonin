const express = require('express')
const serveStatic = require('serve-static')
const path = require('path')

const app = express();

const PORT = 3000;


app.use('/', serveStatic(path.join(__dirname, '/dist')));

app.listen(PORT, () => { console.log('listening on port 3000')});
