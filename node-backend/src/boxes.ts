import pkg from 'algosdk';
import dotenv from 'dotenv';
import { RequestClass, StockFromBoxes, StockToSend, fromBoxesToStocks } from './types.js';

dotenv.config()
const {Indexer} = pkg

let indexerClient: pkg.Indexer;
let appID = parseInt(process.env.APP_ID!);



function createIndexerClient(){
    return new pkg.Indexer('', 'https://testnet-idx.algonode.cloud', '')
}

export async function getBoxesNames(){
    if(indexerClient === undefined){
        indexerClient = createIndexerClient();
    }
    let data = await indexerClient.searchForApplicationBoxes(appID).do();
    return data.boxes.map((box: { name: any; }) => box.name);
}

export async function getContentForAllBoxes(boxNames: Uint8Array[]){
    let result;
    let boxes : StockFromBoxes[] = [];
    let addresses;
    for(let i=0;i<boxNames.length; i++){
        result = await indexerClient.lookupApplicationBoxByIDandName(appID,boxNames[i]).do();
        addresses = parseBoxData(result.value);
        boxes.push(new StockFromBoxes(pkg.decodeUint64(result.name,"safe"),addresses[0],addresses[1]));
    }
    console.log("Lunghezza1: " + boxes.length)
    return boxes;
}

export async function filterBoxes(stocks : StockFromBoxes[], requests : RequestClass[], isMyRequest : boolean){
    let risultato : StockToSend[] = [];
    for (let i = 0; i < requests.length; i++) {
        for (let j = 0; j < stocks.length; j++) {
            console.log("i e j: " + requests[i].id + " " + stocks[j].id)
            if (requests[i].id == stocks[j].id) {
                let stock: StockToSend;
                if (isMyRequest === true) {
                    stock = await fromBoxesToStocks(stocks[j], false);
                } else {
                    stock = await fromBoxesToStocks(stocks[j], false, requests[i].requester);
                }
                risultato.push(stock);
            }
        }
    }
    return risultato;
}

function parseBoxData(data : Uint8Array){
    let stringTupleCodec = pkg.ABIType.from('(address,address)')
    let decodedData = stringTupleCodec.decode(data).toString()
    return decodedData.split(",")
}



