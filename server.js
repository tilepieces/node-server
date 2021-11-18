const http = require('http');
const dispatcherModule = require(__dirname + '/src/dispatcher');
const headerBase = require(__dirname +'/src/headers');
const send = require(__dirname + '/src/send');
const path = require("path");
const mimeTypes = require(__dirname +'/src/mimetypes');
function Server(settings,basePath) {
    var $self = this;
    $self.workspace = settings.workspace;
    $self.serverPath = settings.workspace;
    $self.applicationName = settings.applicationName;
    $self.basePath = basePath || process.cwd() + path.sep;
    $self.home = 'http://' + settings.server.host + ':' + settings.server.port + "/";
    $self.API = require($self.basePath + settings.APIInterface);
    $self.headers = Object.assign(settings.headers||{},headerBase);
    $self.mimeTypes = mimeTypes;
    $self.projectName = null;
    $self.send = send;
    $self.server = new Promise((resolve, reject)=>{
        var server = http.createServer((req,res)=>{
            $self.dispatcher(req,res);
        }).listen(settings.server.port, settings.server.host,err=>{
            if (err)
                reject(err);
            else
                resolve($self);
        });
        server.on('error', function (e) {
            reject(e);
        });
    });
    return $self.server;
}
Server.prototype.dispatcher = dispatcherModule;
module.exports = function(settings,basePath){
    return new Server(settings,basePath);
};
