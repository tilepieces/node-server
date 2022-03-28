const fs = require('fs');
const path = require("path");
const send = require(__dirname + '/send');
const pathToNix = require(__dirname + '/pathToNix');
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
  var referer = req.headers.referrer || req.headers.referer || false;
  var mustproxy = path.isAbsolute(serverPath);
  var proxyPath = mustproxy ? pathToNix($self.workspace + "/" + $self.projectName + "/") : pathToNix(serverPath);
  var isWorkspaceReferrer = referer && referer.startsWith($self.home + proxyPath);
  var proxyPathWithoutSlash = proxyPath.endsWith("/") ? proxyPath.slice(0, proxyPath.length - 1) : proxyPath;
  var isWorkspaceUrl = urlWithoutQuery.startsWith("/" + proxyPath) ||
    urlWithoutQuery == "/" + proxyPathWithoutSlash;
  if (isWorkspaceReferrer && !isWorkspaceUrl) {
    var urlToRedirect = urlWithoutQuery[0] == "/" ? urlWithoutQuery : "/" + urlWithoutQuery;
    res.writeHead(301,
      Object.assign({
        'Location':
          path.join((proxyPath[0] == "/" ? proxyPath : "/" + proxyPath) + urlToRedirect)
      }, $self.headers));
    res.end();
    return;
  }
  var urlToFind = !isWorkspaceUrl ?
    path.normalize($self.basePath + decodeURIComponent(urlWithoutQuery)) :
    path.normalize(serverPath + decodeURIComponent(urlWithoutQuery.replace(proxyPathWithoutSlash, "")));
  //console.log("referer ->",referer);
  //console.log(isWorkspaceUrl,proxyPath,proxyPathWithoutSlash,urlWithoutQuery.replace(proxyPath,""));
  //console.log("mustproxy,$self.basePath,serverPath,urlToFind",mustproxy,$self.basePath,serverPath,urlToFind,urlWithoutQuery);
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
      res.writeHead(500, Object.assign({"Content-Type": "text/plain"}, $self.headers));
      res.write(urlToFind + " access error \n" + JSON.stringify(err));
      res.end();
      return;
    }
    send(urlToFind, res, $self.headers);
  });
}