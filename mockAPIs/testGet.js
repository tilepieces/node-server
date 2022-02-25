module.exports = function (req, res, $self) {
  var {method, url} = req;
  console.log("[testGet] ", method, url);
  res.writeHead(200, Object.assign({"Content-Type": "application/json"}, $self.headers));
  res.write(JSON.stringify({method, url}));
  res.end();
}