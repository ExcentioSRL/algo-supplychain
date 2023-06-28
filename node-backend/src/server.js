require('dotenv').config()
const express = require('express');
const session = require('express-session');
const mongoDBStore = require('connect-mongodb-session')(session);

const usersRoutes = require('./routes/users.js');
const requestsRoutes = require('./routes/requests.js');
const stocksRoutes = require('./routes/stocks.js');
const {connectDB} = require('./database.js');
const { getNewStocks } = require('./stocksIndex.js');


connectDB();

const currentBoxes = [];
let lastID = 0; 

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
app.use('/users', usersRoutes);
app.use('/requests', requestsRoutes);
app.use('/stocks', stocksRoutes);

setInterval(() => {
    currentBoxes = getNewStocks(lastID)
    lastID = currentBoxes.length - 1
}, 5000) //requests all the boxes from the smart contract every 5 seconds

app.listen(PORT, () => {
    console.log("Server listening on port 3000");
});



module.exports = {app,currentBoxes};