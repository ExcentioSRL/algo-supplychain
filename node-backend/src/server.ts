import dotenv from 'dotenv'
import express,{Express,Request,Response} from "express";
import session from "express-session"
import {default as connectMongoDBStore} from "connect-mongodb-session"
import * as http from "http"
import * as io from "socket.io"
import {router as usersRoutes} from './routes/users.js';
import {router as requestsRoutes} from './routes/requests.js';
import { connectDB } from './database.js';
import {getBoxesNames,getContentForAllBoxes, getContentForBox, updateBoxesWithNewBox} from "./boxes.js"
import { Box, RequestClass } from './types.js';
import { getStocksByOwner } from './routes/stocks.js';



dotenv.config();
connectDB();
const mongoDBStore = connectMongoDBStore(session)

export let currentBoxes : Box[] = [];

const store = new mongoDBStore({
    uri: process.env.MONGODB_URI!,
    collection: 'sessions'
});

const ENDPOINTS_PORT = process.env.ENDPOINTS_PORT;
const SOCKET_PORT = process.env.SOCKET_PORT;

export const app : Express = express();
const server = http.createServer(app) 
const socket = new io.Server(server)
let sockets = new Map<string,string>()

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

const boxesNames: Uint8Array[] = await getBoxesNames()
await getContentForAllBoxes(boxesNames).then(response => {
    currentBoxes = response
})



server.listen(SOCKET_PORT, () => {
    console.log("Server sockets listening on port " + SOCKET_PORT);
})
app.listen(ENDPOINTS_PORT, () => {
    console.log("Server endpoints listening on port " + ENDPOINTS_PORT);
});

socket.on('connection', (socket) => {

    socket.on('wallet_login',async (wallet: string) => {
        sockets.set(socket.id, wallet)
        const stocks = await getStocksByOwner(wallet)
        socket.send(stocks)
    })

    socket.on('stock_creation',async (uuid: Uint8Array) => {
        currentBoxes.push(await getContentForBox(uuid))
        const stocks = await getStocksByOwner(sockets.get(socket.id)!)
        socket.send(stocks)
    })

    socket.on('stock_change_ownership', async (box : Box) => {
        updateBoxesWithNewBox(box)
        const stocks = await getStocksByOwner(sockets.get(socket.id)!)
        socket.send(stocks)
    })

    socket.on('create_request', async (request: RequestClass) => {
        const stocks = await getStocksByOwner(sockets.get(socket.id)!)
        socket.send(stocks)
    })
})