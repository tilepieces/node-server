const mockSettings = require("../settings.json");
const path = require("path");
const open = require('open');
const fsPromises = require('fs').promises;
const server = require("../server");
const GET =  require("./testUtils/GET");
const zlib = require('zlib');
const assert = require("./testUtils/assert");
console.log("Welcome to @tilepieces/server automated test.");
console.log("Be sure to have projects.json and settings.json in root. Process must start from the root. Use npm test")
console.log("Be sure to not have another process running on port " + mockSettings.server.port ,"or EADDRINUSE error will be raised");
(async ()=> {
    try {
        console.log("- Testing object instantiation:\n\n");
        const tilepiecesServer = await server(mockSettings);
        assert(tilepiecesServer.workspace == mockSettings.workspace,
            "tilepiecesServer.workspace == mockSettings.workspace");
        assert(tilepiecesServer.serverPath == mockSettings.workspace,
            "tilepiecesServer.serverPath == mockSettings.workspace");
        assert(tilepiecesServer.applicationName == mockSettings.applicationName,
            "tilepiecesServer.applicationName == mockSettings.applicationName");
        var processPath = process.cwd() + path.sep;
        assert(tilepiecesServer.basePath == processPath,
            "tilepiecesServer.basePath == (process.cwd() + path.sep)");
        var host = 'http://' + mockSettings.server.host + ':' + mockSettings.server.port + "/";
        assert(tilepiecesServer.home == host,
            `tilepiecesServer.home == http:// + mockSettings.server.host + : + mockSettings.server.port + /`);
        assert(tilepiecesServer.API ==
            require(processPath + mockSettings.APIInterface),
            `tilepiecesServer.API == require(processPath + mockSettings.APIInterface)`);
        console.log("\n\n- Testing server responses:\n\n");
        console.log(host + "index.html");
        var redirectCode = await GET(host + "");
        assert(redirectCode == "301","test redirect over directory");
        var indexhtml = await GET(host + "index.html");
        var indexHTMLText =  await new Promise((res,rej)=>{
            zlib.unzip(indexhtml, (err, buffer) => {
                if(err)
                    return rej(err);
                res(buffer.toString('utf8'));
            });
        });
        var realIndexHtml = await fsPromises.readFile(processPath + path.sep + "index.html", 'utf8');
        assert(indexHTMLText == realIndexHtml,"test response 'index.html'");
        console.log("HURRAH! all tests passed");
        console.log("Now let's go to e2e tests! Wait for browser open...");
        open('http://127.0.0.1:8546/');
    }
    catch (e) {
        console.error("test failed");
        console.error(e);
    }
})();