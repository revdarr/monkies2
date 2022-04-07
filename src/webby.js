// webby.js
const net = require('net');
const fs = require('fs');
const path = require('path');
const HTTP_STATUS_CODES ={
    200:'OK',
    301:'Moved Permanently',
    404:'Not Found',
    500:'Internal Server Error'

};

const MIME_TYPES = {
    jpg:'image/jpeg',
    jpeg:'image/jpeg',
    png:'image/png',
    html:'text/html',
    css:'text/css',
    txt:'text/plain'
};

function getExtension(fileName) {
    const split = fileName.split('.');
    if (split.length<2) {
        return '';
    }
    return split[split.length-1].toLowerCase();
}

function getMIMEType(fileName) {
    const ext = MIME_TYPES[getExtension(fileName)];
    if (ext===undefined) {
        return '';
    }
    return ext;
}

class Request {
    constructor(s) {
      const [method, path] = s.split(' ');
      this.method = method;
      this.path = path;
    }
}

class Response {
  constructor(socket,statusCode=200,version="HTTP/1.1") {
    this.statusCode = statusCode;
    this.version=version;
    this.sock = socket;
    this.body = null;
    this.headers = {};

  }
  setHeader(name,value) {
    this.headers[name]=value;
  }
  end() {
    this.sock.end();
  }
  statusLineToString() {
    return this.version + " " + this.statusCode + " " + HTTP_STATUS_CODES[this.statusCode]+"\r\n";
  }
  headersToString() {
    let s = "";
    for (const header in this.headers) {
      s+=header+": " + this.headers[header]+"\r\n";
    }
    return s;
  }
  send(body) {
    this.body=body;
    if (!('Content-Type' in this.headers)) {
      this.headers['Content-Type']="text/html";
    }
    this.sock.write(this.statusLineToString()+this.headersToString() + "\r\n");
    this.sock.write(this.body);
    this.end();
  }
  status(statusCode) {
    this.statusCode = statusCode;
    return this;
  }
}
class App {
  constructor() {
    this.routes = {};
    this.middleware = null;
    this.server = net.createServer(sock => this.handleConnection(sock));
  }
  isLetter(str) { //taken from https://stackoverflow.com/questions/9862761/how-to-check-if-character-is-a-letter-in-javascript
    return str.length === 1 && str.match(/[a-z]/i);
  }
  normalizePath(path) {
    let sIndex = path.length;
    for (let i=1;i<sIndex;i++) {
      if (! this.isLetter(path[i])) {
        sIndex = i;
        break;
      }
    }
    return path.slice(0,sIndex).toLowerCase();
  }
  createRouteKey(method,path) {
    return method.toUpperCase() + " " + this.normalizePath(path);
  }
  get(path, cb) {
    const key = this.createRouteKey("GET",path);
    this.routes[key]=cb;
  }
  use(cb) {
    this.middleware=cb;
  }
  listen(port,host) {
    this.server.listen(port,host);
  }
  handleConnection(sock) {
    sock.on("data",data=> this.handleRequest(sock,data));
  }
  handleRequest(sock,binaryData) {
  
    const req = new Request(binaryData+'');
    const res = new Response(sock);
    if (this.middleware!==null) {
      
      this.middleware(req,res,(a1=req,a2=res) => {
        
        this.processRoutes(a1,a2);
      });
    }
    else {
      this.processRoutes(req,res);
    }
  }
  processRoutes(req,res) {
    const betterPath = this.createRouteKey(req.method,req.path);
    if (this.routes[betterPath]!==undefined) {
      this.routes[betterPath](req,res);
    } else {
      res.status(404);
     
      res.send("Page not found.");
    }
  }
  
}



function serveStatic(basePath) {
  function stat(req,res,next) {
    const newPath = path.join(basePath,req.path);
    fs.readFile(newPath,(err,data)=> {
      if (err===null) {
      const newPathSplit=newPath.split(".");
      const type = newPathSplit[newPathSplit.length-1];
      res.setHeader('Content-Type',type);
      res.status(200);
      res.send(data);
      } else {
        next();
      }
    });
  }
  return stat;
}


module.exports = {
    HTTP_STATUS_CODES:HTTP_STATUS_CODES,
    MIME_TYPES:MIME_TYPES,
    getExtension:getExtension,
    getMIMEType:getMIMEType,
    Request:Request,
    App:App,
    Response:Response,
    static:serveStatic,
};


/*
*/



