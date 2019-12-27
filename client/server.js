/* eslint-disable no-console */
/* eslint-disable prettier/prettier */
const express = require('express')
const path = require('path')
const history = require('connect-history-api-fallback')

const app = express()

app.get('/elb-health-check', (req, res) => {
	res.status(200);
	res.send('client is alive');
});

const staticFileMiddleware = express.static(path.join(__dirname + '/dist'))

app.use(function(req, res, next) {
  if((!req.secure) && (req.get('X-Forwarded-Proto') !== 'https')) {
    res.redirect('https://' + req.get('Host') + req.url);
  } else { 
    next(); 
  }
})

app.use(staticFileMiddleware)
app.use(history({
  disableDotRule: true,
  verbose: true
}))
app.use(staticFileMiddleware)

app.get('/', function (req, res) {
  res.render(path.join(__dirname + '/dist/index.html'))
})

var server = app.listen(process.env.PORT || 80, function () {
  var port = server.address().port
  console.log('App now running on port', port)
})