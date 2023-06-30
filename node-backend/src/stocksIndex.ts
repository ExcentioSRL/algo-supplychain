import pkg from  'algosdk';
import { RequestClass, StockFromBoxes, StockToSend, fromBoxesToStocks } from './types.js';
import axios from "axios";

const {Indexer} = pkg

let indexerClient: pkg.Indexer;
let appID = 1002;

function createIndexerClient(){
    const token = "a".repeat(64);
    const server = "http://172.18.0.4";
    const port = 8980;
    return new Indexer(token, server, port);

}
 

export async function getBoxesNames(){
    if(indexerClient === undefined){
        indexerClient = createIndexerClient();
    }
    console.log("QUI0")
    const response = await indexerClient.searchForApplicationBoxes(appID).do();
    //const response = await axios.get("http://172.18.0.4:8980/v2/applications/"+ appID + "/boxes");
    console.log("QUI1: " + response.boxes.length)
    return response.boxes.map((box: { name: any; }) => box.name);
}

export async function getContentForAllBoxes(boxNames: Uint8Array[]){
    let result;
    let boxes : StockFromBoxes[] = [];
    for(let i=0;i<boxNames.length; i++){
        //result = await indexerClient.lookupApplicationBoxByIDandName(appID,boxNames[i]).do();
        result = await axios.get("http://172.18.0.4:8980/v2/applications/1002/box&name=" + boxNames[i])
        boxes.push(new StockFromBoxes(result.data.name.toString(),result.data.value.toString(),result.data.value.toString())) //come faccio?
    }
    return boxes;
}

export function filterBoxes(stocks : StockFromBoxes[], requests : RequestClass[], isMyRequest : boolean){
    let risultato : StockToSend[] = [];
    for (var i = 0; i < requests.length; i++) {
        for (var j = 0; j < stocks.length; j++) {
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

