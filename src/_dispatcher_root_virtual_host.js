const fs = require('fs');
const path = require("path");
const send = require(__dirname + '/send');
module.exports = function (req, res) {
  var $self = this;
  var controllers = $self.API;
  var {method, url} = req;
  console.log(method, url);
  if (controllers.length) {
    for (var i = 0; i < controllers.length; i++) {
      var c = controllers[i];
      if (url.startsWith(c.url) && c.method == method) {
        c.controller(req, res, $self);
        return;
      }
    }
  }
  var serverPath = $self.serverPath;
  var urlWithoutQuery = url.split("?").shift(); // ignore query parameters
  var isApplicationPath = url.startsWith("/" + $self.applicationName + "/");
  var urlToFind = isApplicationPath ?
    $self.basePath + decodeURIComponent(urlWithoutQuery) :
    serverPath + decodeURIComponent(urlWithoutQuery);
  var exists = fs.existsSync(urlToFind);
  if (!exists) {
    res.writeHead(404, Object.assign({"Content-Type": "text/plain"}, $self.headers));
    res.write(urlToFind + " 404 Not Found");
    res.end();
    return;
  }
  if (fs.lstatSync(urlToFind).isDirectory()) {
    res.writeHead(301, Object.assign({'Location': path.join(urlWithoutQuery, "index.html")}, $self.headers));
    res.end();
    return;
  }
  fs.access(urlToFind, fs.F_OK, (err) => {
    if (err) {
      //res.writeHead(500, {'Content-Type': 'text/html'});
      res.writeHead(500, Object.assign({"Content-Type": "text/plain"}, $self.headers));
      res.write(urlToFind + " access error \n" + JSON.stringify(err));
      res.end();
      return;
    }
    send(urlToFind, res, $self.headers);
  });
}