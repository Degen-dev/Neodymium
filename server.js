const
    Corrosion = require('./Corrosion-Heroku'),
    path = require('path'),
    config = require('./config.json'),
    fs = require('fs'),
    http = require('http'),
    https = require('https'),
    express = require('express'),
    app = express(),
    port = process.env.PORT || config.port,
    /*ssl = {
        key: fs.readFileSync(path.join(__dirname, '/ssl/default.key')),
        cert: fs.readFileSync(path.join(__dirname, '/ssl/default.crt')),
    },*/ 

    //Uncomment all comments (excluding this one) if you would like to use https

    server = http/*s*/.createServer(/*ssl, */app),
    error = fs.readFileSync(path.normalize(__dirname + '/public/error.html'), 'utf-8'),
    proxy = new Corrosion({
        prefix: config.prefix,
        title: config.title,
        codec: config.codec,
        standardMiddleware: true,
        requestMiddleware: [
            Corrosion.middleware.blacklist((config.blacklist || []), 'This page has been blocked!'),
        ],
    });

proxy.bundleScripts();

app.get('/', function(req, res){
    res.sendFile('index.html', { root: __dirname + '/public/'});
});
app.get('/media', function(req, res){
    res.sendFile('media.html', { root: __dirname + '/public/'})
});
app.get('/legal', function(req, res){
    res.sendFile('legal.txt', { root: __dirname + '/public/assets/'})
});
app.use(express.static(path.normalize(__dirname + '/public/')));
app.use((req, res) => {
    if (req.url.startsWith(proxy.prefix)) return proxy.request(req, res);
    res.status(404, res.send(error))
});

server.on('upgrade', (clientRequest, clientSocket, clientHead) => proxy.upgrade(clientRequest, clientSocket, clientHead)).listen(port);
console.log('Neodymium is available on port ' + port);
