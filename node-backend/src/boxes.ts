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
    //console.log("QUI0")
    let data = await indexerClient.searchForApplicationBoxes(appID).do();
    //console.log("QUI1: " + data.boxes.length)
    return data.boxes.map((box: { name: any; }) => box.name);
}

export async function getContentForAllBoxes(boxNames: Uint8Array[]){
    let result;
    let boxes : StockFromBoxes[] = [];
    for(let i=0;i<boxNames.length; i++){
        result = await indexerClient.lookupApplicationBoxByIDandName(appID,boxNames[i]).do();
        boxes.push(new StockFromBoxes(result.name.toString(),result.value.toString(),result.value.toString())) //come faccio a parsare?
    }
    return boxes;
}

export function filterBoxes(stocks : StockFromBoxes[], requests : RequestClass[], isMyRequest : boolean){
    let risultato : StockToSend[] = [];
    for (let i = 0; i < requests.length; i++) {
        for (let j = 0; j < stocks.length; j++) {
            if (requests[i].id === stocks[j].id) {
                let stock: StockToSend;
                if (isMyRequest === true) {
                    stock = fromBoxesToStocks(stocks[j], false);
                } else {
                    stock = fromBoxesToStocks(stocks[j], false, requests[i].requester);
                }
                risultato.push(stock);
            }
        }
    }
    return risultato;
}

function parseBoxData(data: Uint8Array){

}

