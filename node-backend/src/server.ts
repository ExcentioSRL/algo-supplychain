import dotenv from 'dotenv'
import express,{Express,Request,Response} from "express";
import session from "express-session"
import {default as connectMongoDBStore} from "connect-mongodb-session"

import {router as usersRoutes} from './routes/users.js';
import {router as requestsRoutes} from './routes/requests.js';
import {router as stocksRoutes} from './routes/stocks.js';
import { connectDB } from './database.js';
import {getBoxesNames,getContentForAllBoxes} from "./boxes.js"
import { StockFromBoxes } from './types.js';



dotenv.config();
connectDB();
const mongoDBStore = connectMongoDBStore(session)

export let currentBoxes : StockFromBoxes[] = [];

const store = new mongoDBStore({
    uri: process.env.MONGODB_URI!,
    collection: 'sessions'
});
const PORT = process.env.PORT;
export const app : Express = express();

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
app.use(function (req : Request,res : Response,next){
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Methods","GET,HEAD,OPTION,POST,PUT,DELETE");
    res.header("Access-Control-Allow-Headers","auth-token, Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(express.json());
app.use('/users', usersRoutes);
app.use('/requests', requestsRoutes);
app.use('/stocks', stocksRoutes);

setInterval(async () => {
    const boxesNames : Uint8Array[] = await getBoxesNames()
    await getContentForAllBoxes(boxesNames).then(response => {
        currentBoxes = response
    })
}, 5000)  //requests all the boxes from the smart contract every 10 seconds

app.listen(PORT, () => {
    console.log("Server listening on port " + PORT);
});
