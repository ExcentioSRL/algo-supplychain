require('dotenv').config()
const express = require('express');
const {connectDB} = require('./database.js');
const {router} = require('./routes.js');
const session = require('express-session');
const mongoDBStore = require('connect-mongodb-session')(session)

connectDB();

const store = new mongoDBStore({
    uri: process.env.MONGODB_URI,
    collection: 'sessions'
});
const PORT = process.env.PORT;
const app = express();

app.use(session({
    secret: "fh7yn9a", //testa Math.random()
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
        secure: false,
        maxAge: 5 * 60 * 1000
    }
}));
app.use(function (req,res,next){
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods","GET,HEAD,OPTION,POST,PUT,DELETE");
    res.header("Access-Control-Allow-Headers","auth-token, Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.json());
app.use('/', router);


app.listen(PORT)

module.exports = {app};