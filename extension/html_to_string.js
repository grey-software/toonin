/**
 * Converts the Toonin Box popup html to a string so it can be injected
 */
const fs = require('fs');
var html = fs.readFileSync('./src/toonin_box.html', 'utf-8');
html = html.replace(/(\r\n\t|\n|\r\t)/gm,"");
var moduleString = "module.exports = {html: '";
moduleString += html + "'}";
//fs.writeFileSync('./src/js/inject/toonin_box.js', moduleString);