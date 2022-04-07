// app.js

const path = require("path");
/*
// require your module
const webby = require('./webby.js');

// create a web application
const app = new webby.App();

// add me some middlware!
app.use((req, res, next) => {
    console.log(req.method, req.path);
    
    next();
    console.log(res.statusCode);
    
   });
// add a route
app.get('/hello', function(req, res) {
    // send back a response if route matches
    res.send('<h1>HELLO WORLD</h1>');
   });
   app.use(webby.static(path.join(__dirname, '..', 'public')));
app.listen(3000, '127.0.0.1');
*/
// require your module
const webby = require('./webby.js');

// create a web application
const app = new webby.App();

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}



app.get('/gallery', function(req,res) {
    const style = path.join("..",'css','styles.css');
    let s =`<head>
    <link rel="stylesheet" href="`+style+`">
  </head>
  <body>
    <h1> Monkies!!</h1><div class="row">`;
    const picN = 1+getRandomInt(4);
    for (let i=0;i<picN;i++) {
        const picPick = 1+getRandomInt(4);
        const animal = 'animal'+picPick.toString()+".jpg";
        const temp = `
        <div class="column">
            
          <img src="`+(path.join( '..','img',animal))+`" alt="Snow" style="width:100%">
          </div>`;
          s+=temp;
    }
    s+=` </div></body>`;
    res.setHeader('Content-Type','html');
    res.send(s);
});

app.get('/', function(req,res) {
    const style = path.join("..",'css','styles.css');
    res.send(`<head>
    <link rel="stylesheet" href="`+style+`">
  </head><h1> welcome to chimps </h1> <a href="http://linserv1.cims.nyu.edu:10161/gallery">See some chimps!!</a>`);
});
app.get('/pics', function(req,res) {
    res.status(301).setHeader('Location',"http://linserv1.cims.nyu.edu:10161/gallery").send("");
    
    
});
app.use(webby.static(path.join(__dirname, '..', 'public')));
if (process.env.PORT==null) {
	app.listen(3000, '127.0.0.1');
} else {
  console.log(process.env.PORT);
	app.listen(process.env.PORT);
}
