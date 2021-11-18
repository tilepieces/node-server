const http = require('http');
module.exports = function(URL) {
    return new Promise((res, rej)=> {
        http.get(URL,resp => {
            const { statusCode } = resp;
            const contentType = resp.headers['content-type'];
            if (statusCode !== 200) {
                res(statusCode);
                return;
            }
            //resp.setEncoding('utf8');
            let rawData = [];
            resp.on('data', chunk => rawData.push(chunk));
            resp.on('end', () => {
                var buffer = Buffer.concat(rawData);
                res(buffer)
            });
        }).on('error', (e) => {
            rej(e.message);
        });
    })
}