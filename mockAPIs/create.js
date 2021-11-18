const fs = require("fs");
function readProjects(){
    return new Promise((res,rej)=>{
        fs.readFile("./projects.json", 'utf8',(err,data)=>{
            if(err)
                rej(err);
            else
                res(JSON.parse(data))
        });
    })
}
function writeResponse(res,resObj,headers){
    res.writeHead(200, Object.assign({"Content-Type": "application/json"},headers));
    res.write(JSON.stringify(resObj));
    res.end();
}
function createDir(name){
    return new Promise(res=>{
        fs.mkdir(name, { recursive: true },err=>res(err))
    })
}
module.exports = async function(req,res,$self){
    var { method, url } = req;
    console.log("[create] ",method,url);
    var urlParams = new URLSearchParams(url);
    var projectName = urlParams.get('projectName');
    projectName && projectName.trim();
    if(!projectName || !projectName.length){
        writeResponse(res,{method,url,projectName,result:0,err:"no projectname"},$self.headers);
    }
    var projects = await readProjects();
    var prEntry = projects.find(v=>v.name == projectName);
    if(prEntry){
        $self.serverPath = prEntry.path;
    }
    else {
        $self.serverPath = $self.workspace + "/" + projectName + "/";
        var pathExists = fs.existsSync($self.serverPath) && fs.lstatSync($self.serverPath).isDirectory();
        if (!pathExists) {
            var makeDirErr = await createDir($self.serverPath);
            if (makeDirErr) return writeResponse(res, {method, url, projectName, result: 0, err: makeDirErr});
        }
        projects.unshift({
            name : projectName,
            path : $self.serverPath
        });
        try {
            await new Promise(res=> {
                fs.writeFile("./projects.json", JSON.stringify(projects, null, 4), 'utf8', err=> {
                    if (err)
                        rej(err);
                    else
                        res();
                })
            });
        }
        catch(e) {
            return writeResponse(res, {method, url, projectName, result: 0, err: e});
        }
    }
    writeResponse(res,{method,url,projectName,result:1});
};