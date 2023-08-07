import pkg from 'algosdk';
import dotenv from 'dotenv';
import { Box } from './types.js';
import { encodeBoxName, decodeBoxData,decodeBoxName } from './helpers/helper_boxes.js';
import { currentBoxes } from './server.js';



const {Indexer} = pkg
dotenv.config()
let indexerClient: any;
let appID = parseInt(process.env.APP_ID!);

function createIndexerClient(){
    return new pkg.Indexer('', 'https://testnet-idx.algonode.cloud', '')
}

/* Done once on start */
export async function getBoxesNames(){
    if(indexerClient === undefined){
        indexerClient = createIndexerClient();
    }

    let data = await indexerClient.searchForApplicationBoxes(appID).do();
    return data.boxes.map((box: { name: any; }) => box.name);
}

export async function getContentForAllBoxes(boxNames: Uint8Array[]){
    if(indexerClient === undefined){
        indexerClient = createIndexerClient();
    }

    let result;
    let boxes : Box[] = [];
    let addresses;
    for(let i=0;i<boxNames.length; i++){
        result = await indexerClient.lookupApplicationBoxByIDandName(appID,boxNames[i]).do();
        addresses = decodeBoxData(result.value);
        boxes.push(new Box(decodeBoxName(result.name),addresses[1],addresses[0]));
    }
    return boxes;
}

/* Done multiple times whenever a box is crated / modified */
export async function getContentForBox(id: string) {
    if (indexerClient === undefined) {
        indexerClient = createIndexerClient();
    }
    
    const result = await indexerClient.lookupApplicationBoxByIDandName(appID, encodeBoxName(id)).do();
    const addresses = decodeBoxData(result.value);
    return new Box(decodeBoxName(result.name), addresses[1], addresses[0]);
}

export async function updateBoxesWithChangedBox(id: string){
    if (indexerClient === undefined) {
        indexerClient = createIndexerClient();
    }
    
    const idx = currentBoxes.findIndex(box => {return box.id === id})
    if(idx === -1){
        console.log("Box not found")
    }else{
        currentBoxes.splice(idx, 1)
        const newBox : Box = await getContentForBox(id)
        currentBoxes.push(newBox)
    }
    
}

/* Done multiple times whenever a QR-Code is scanned*/
export async function getOwnersHistory(boxID: string) {
    if(indexerClient === undefined){
        indexerClient = createIndexerClient();
    }

    //getting all transactions with this box.id in the notes, since there is no way of searching for boxes in the transaction
    const result = await indexerClient.searchForTransactions().applicationID(appID).notePrefix(Buffer.from(boxID)).do();
    let names: Array<pkg.Address> = []
    for(let i=0; i<result.transactions.length;i++){
        names.push(result.transactions[i].sender)
    }
    return names;
}

