// https://stackoverflow.com/questions/37519650/normalizing-the-paths-in-nodejs
const path = require("path");
module.exports = function pathToNix(pathStr) {
  var p = path.normalize(pathStr);
  var path_regex = /\/\//;
  p = p.replace(/\\/g, "/");
  while (p.match(path_regex)) {
    p = p.replace(path_regex, "/");
  }
  return encodeURI(p);
}