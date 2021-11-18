var fs = require("fs");
var Busboy = require('busboy');
module.exports = function(req,res,$self){
    var { method, url } = req;
    var rootPath  = $self.serverPath;
    console.log("[testPost] " , method,url);
    var busboy = new Busboy({ headers: req.headers });
    var fields = [];
    var fileArray = [];
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        var buf = [];
        file.on('data', function(data) {
            buf.push(data);
        });
        file.on('end', function() {
            fileArray = Buffer.concat(buf);
            fields.push(fieldname);
        });
    });
    busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
        console.log('Field [' + fieldname + ']: value: ' + val, " isArray " + Array.isArray(val));
    });
    busboy.on('finish', function() {
        console.log('Done parsing form!');
        console.log("I'm writing on ",rootPath + fields[0]);
        fs.writeFile(rootPath + fields[0], fileArray,"binary", function (err) {
            if (err) {
                console.log(err);
                res.writeHead(200, Object.assign({"Content-Type": "application/json"},$self.headers));
                res.write(JSON.stringify({result:0,path:rootPath,fields,error:err}));
                res.end();
            }
            else {
                res.writeHead(200, Object.assign({"Content-Type": "application/json"},$self.headers));
                res.write(JSON.stringify({result: 1, path: rootPath, fields}));
                res.end();
            }
        });
    });
    req.pipe(busboy);
}