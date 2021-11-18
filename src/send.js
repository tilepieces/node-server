const mimeTypes = require(__dirname +'/mimetypes');
const zlib = require('zlib');
const path = require('path');
const fs = require('fs');
module.exports = (source, destination, headerBase,status = 200,mtime = null) => {
    var ext = path.extname(source);
    var headers = mimeTypes[ext] ?
        Object.assign({'Content-Type': mimeTypes[ext]},headerBase) :
        headerBase;
    if(mtime != null)
        headers['last-modified-time'] = mtime;
    if(mimeTypes[ext] && ( mimeTypes[ext].startsWith("text/") ||
        mimeTypes[ext] == "application/json" ||
        mimeTypes[ext].indexOf("+xml")>-1)){
        headers['Content-Encoding']= 'gzip';
        destination.writeHead(status, headers);
        fs.createReadStream(source).pipe(zlib.createGzip()).pipe(destination);
    }
    else {
        destination.writeHead(status, headers);
        fs.createReadStream(source).pipe(destination);
    }
};