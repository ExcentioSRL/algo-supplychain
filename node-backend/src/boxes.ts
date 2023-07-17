import * as sdk from 'algosdk';
import dotenv from 'dotenv';
import { Box } from './types.js';
import { parseBoxData,parseBoxName } from './utils.js';
import { currentBoxes } from './server.js';

dotenv.config()

let indexerClient: sdk.Indexer;
let appID = parseInt(process.env.APP_ID!);



function createIndexerClient(){
    return new sdk.Indexer('', 'https://testnet-idx.algonode.cloud', '')
}

/* Done once */
export async function getBoxesNames(){
    if(indexerClient === undefined){
        indexerClient = createIndexerClient();
    }
    let data = await indexerClient.searchForApplicationBoxes(appID).do();
    return data.boxes.map((box: { name: any; }) => box.name);
}

export async function getContentForAllBoxes(boxNames: Uint8Array[]){
    let result;
    let boxes : Box[] = [];
    let addresses;
    for(let i=0;i<boxNames.length; i++){
        result = await indexerClient.lookupApplicationBoxByIDandName(appID,boxNames[i]).do();
        addresses = parseBoxData(result.value);
        boxes.push(new Box(parseBoxName(result.name),addresses[0],addresses[1]));
    }
    return boxes;
}

/*Done multiple times */
export async function getContentForBox(boxName: Uint8Array) {
    if (indexerClient === undefined) {
        indexerClient = createIndexerClient();
    }
    
    const result = await indexerClient.lookupApplicationBoxByIDandName(appID, boxName).do();
    const addresses = parseBoxData(result.value);
    
    return new Box(parseBoxName(result.name), addresses[0], addresses[1]);
}

export function updateBoxesWithNewBox(newBox: Box){
    if (indexerClient === undefined) {
        indexerClient = createIndexerClient();
    }

    const idx = currentBoxes.findIndex(box => {return box.id === newBox.id})
    currentBoxes.splice(idx,1,newBox)
}


