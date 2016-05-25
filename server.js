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

app.get('/favorites', function(req, res){
  var data = fs.readFileSync('./data.json');
  res.setHeader('Content-Type', 'application/json');
  res.send(data);
// ⇣ Both the closing bracket for the anonymous function
// ⇣ and the closing paren for app.get were forgotten
});

app.get('favorites', function(req, res){
  if(!req.body.name || !req.body.oid){
    res.send("Error");
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
