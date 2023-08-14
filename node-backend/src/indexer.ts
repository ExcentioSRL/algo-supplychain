import pkg from 'algosdk';
import dotenv from 'dotenv';
import { Box } from './types.js';
import { decodeBoxName, encodeBoxName, getDecodedBox } from './helpers/helper_boxes.js';

dotenv.config()
let indexerClient: any;
let appID = parseInt(process.env.APP_ID!);

function createIndexerClient(){
    return new pkg.Indexer('', 'https://testnet-idx.algonode.cloud', '')
}

/* Done once on start */
export async function getBoxesNames() : Promise<Array<string>>{
    if(indexerClient === undefined){
        indexerClient = createIndexerClient();
    }

    let names = await indexerClient.searchForApplicationBoxes(appID).do();
    return names.boxes.map((box: pkg.indexerModels.BoxDescriptor) => decodeBoxName(box.name));
}

/* Done multiple times whenever a box is created / modified */
export async function getBox(id: string) : Promise<Box> {
    if (indexerClient === undefined) {
        indexerClient = createIndexerClient();
    }
    
    const result : pkg.indexerModels.Box = await indexerClient.lookupApplicationBoxByIDandName(appID, encodeBoxName(id)).do();
    return getDecodedBox(result)
}

/* Done multiple times whenever a QR-Code is generated*/
export async function getOwnersAddressHistory(boxID: string): Promise<Array<pkg.Address>>{
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

