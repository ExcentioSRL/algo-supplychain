import dotenv from 'dotenv';
import express,{Express,Request,Response} from "express";
import session from "express-session";
import {default as connectMongoDBStore} from "connect-mongodb-session";
import * as http from "http";
import * as io from "socket.io";

import {router as usersRoutes} from './routes/users.js';
import { connectDB } from './database.js';
import {getBoxesNames,getContentForAllBoxes, getContentForBox} from "./indexer.js";
import { Box, RequestClass, Stock, walletAddress } from './types.js';
import { getStocksByOwner, removeDuplicates, removeRequestsFromStocks } from './helpers/helper_stocks.js';
import { updateBoxesWithChangedBox } from './indexer.js';
import { createRequest, deleteRequest } from './helpers/helper_requests.js';
import { searchPIVAorName } from './helpers/helper_users.js';
import { searchStocksByPartialID } from './helpers/helper_boxes.js';


dotenv.config();
connectDB();
const mongoDBStore = connectMongoDBStore(session);

export let currentBoxes : Box[] = [];

const store = new mongoDBStore({
    uri: process.env.MONGODB_URI!,
    collection: 'sessions'
});

const ENDPOINTS_PORT = process.env.ENDPOINTS_PORT;
const SOCKET_PORT = process.env.SOCKET_PORT;

export const app : Express = express();
const server = http.createServer(app); 
const serverSocket = new io.Server(server,{
    cors: {
        origin: "http://localhost:5173"
    }
});
let sockets = new Map<string,string>();

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


await getContentForAllBoxes(await getBoxesNames()).then(response => {
    currentBoxes = response
});

server.listen(SOCKET_PORT, () => {
    console.log("Server sockets listening on port " + SOCKET_PORT);
});
app.listen(ENDPOINTS_PORT, () => {
    console.log("Server endpoints listening on port " + ENDPOINTS_PORT);
});

/* --- rimuovere socket ID e usare i cookie? */
serverSocket.on('connection', (socket) => {

    socket.on('get_stocks',async(callback) => {
        const stocks: Stock[] = await getStocksByOwner(sockets.get(socket.id)!)
        callback(stocks);
    });

    socket.on('wallet_login',async (wallet: walletAddress,callback) => {
        sockets.set(socket.id, wallet)
        const stocks : Stock[] = await getStocksByOwner(wallet)
        callback(stocks)
    });

    socket.on('wallet_logout', async() => {
        sockets.delete(socket.id)
    })

    socket.on('stock_creation',async (id: string, callback) => {
        currentBoxes.push(await getContentForBox(id))
        const stocks : Stock[] = await getStocksByOwner(sockets.get(socket.id)!)
        callback(stocks)
    });

    socket.on('stock_change_ownership', async (id : string,callback) => {
        await updateBoxesWithChangedBox(id)
        const stocks : Stock[] = await getStocksByOwner(sockets.get(socket.id)!)
        callback(stocks)
    });

    socket.on('create_request', async (id: string, oldOwner: string,requester:string,callback) => {
        await createRequest(id,oldOwner,requester)
        console.log("wallet: " + sockets.get(socket.id))
        //Se l'altro proprietario è connesso, aggiorna anche la sua lista di Stock
        const stocks : Stock[] = await getStocksByOwner(sockets.get(socket.id)!)
        callback(stocks)
    });

    socket.on('delete_request',async (id: string,callback) => {
        deleteRequest(id).then((resolve) => {
        }).catch((error) => {})
 
        //Se l'altro proprietario è connesso, aggiorna anche la sua lista di Stock
        const stocks : Stock[] = await getStocksByOwner(sockets.get(socket.id)!)
        callback(stocks)
    });

    socket.on('search_stocks', async(data: string,walletAddress: walletAddress,callback) => {
        let stocks: Stock[] = []
        /*const matches = await searchPIVAorName(data)
        for(let i=0;i<matches.length;i++){
            stocks.concat(await getStocksByOwner(matches[i]))
        }*/
        stocks = stocks.concat(await searchStocksByPartialID(data,walletAddress))
        stocks = removeRequestsFromStocks(stocks)
        callback(stocks)
    })
});