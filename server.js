var express = require('express');
// ⇣⇣ Forgot to require bodyParser
var bodyParser = require('body-parser');
var app = express();
var fs = require('fs');
var path = require('path');

app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

// Parenthesis were mis-matched     this one was forgotten ⇣
app.use('/', express.static(path.join(__dirname, 'public')));

// Get the User's favorites
app.get('/favorites', function(req, res){
  var data = fs.readFileSync('./data.json');
  res.setHeader('Content-Type', 'application/json');
  res.send(data);
// ⇣ Both the closing bracket for the anonymous function
// ⇣ and the closing paren for app.get were forgotten
});

// Record a new favorite
//   ⇣  Method should be POST to write data
app.post('/favorites', function(req, res){
  if(!req.body.imdbID || !req.body.Title || !req.body.Year){
    res.send("{Error:'Must have an imdbID, Title, and Year.'}");
    return
//⇣ Closing curly bracket for the if block was forgotten
  }

  var data = JSON.parse(fs.readFileSync('./data.json'));
  data.push(req.body);
  fs.writeFile('./data.json', JSON.stringify(data));
  res.setHeader('Content-Type', 'application/json');
  res.send(data);
});
//      ⇣ Function is actually called app.listen, not app.list
app.listen(3000, function(){
  console.log("Listening on port 3000");
});
