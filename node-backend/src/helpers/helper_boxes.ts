import {Status,Box,Stock, walletAddress, StockRequest} from "../types.js"
import * as sdk from "algosdk"
import { currentBoxes } from "../server.js";
import { getCompanyName } from "./helper_users.js";
import { getBox, getBoxesNames } from "../indexer.js";

export async function fromBoxToStock(box: Box,status: Status, request?: StockRequest): Promise<Stock>{
    const producer : string = await getCompanyName(box.producer)
    const owner : string = box.owner === box.producer ? producer : await getCompanyName(box.owner)
    
    if(status === Status.requested_by || status === Status.requested){
        const requester: string = await getCompanyName(request?.requester!);
        return new Stock(box.id, producer, status, owner, new StockRequest(requester, request?.isApproved!))
    }else{
        return new Stock(box.id, producer, status, owner,undefined)
    }
}

export async function associateBoxesWithRequests(boxes: Box[], requests: StockRequest[], status: Status.requested | Status.requested_by): Promise<Array<Stock>>{
    let risultato: Stock[] = [];
    for (let i = 0; i < requests.length; i++) {
        for (let j = 0; j < boxes.length; j++) {
            if (requests[i].id == boxes[j].id) {
                risultato.push(await fromBoxToStock(boxes[j], status, requests[i]));
            }
        }
    }
    return risultato;
}

export function getDecodedBox(data: sdk.indexerModels.Box): Box{
    const addresses = decodeBoxValue(data.value)
    return new Box(decodeBoxName(data.name), addresses[1], addresses[0]);   
}

function decodeBoxValue(data: Uint8Array) : Array<string>{
    let stringTupleCodec = sdk.ABIType.from('(address,address)')
    let decodedData = stringTupleCodec.decode(data).toString()
    return decodedData.split(",")
}

export function decodeBoxName(data: Uint8Array) : string{
    const decodedData = new TextDecoder().decode(data)
    return decodedData
}

export function encodeBoxName(id: string) : Uint8Array{
    const encodedData = new TextEncoder().encode(id)
    return encodedData
}

export async function searchBoxesByPartialID(data: string,walletAddress: walletAddress): Promise<Array<Stock>>{
    const fiteredBoxes: Box[] = currentBoxes.filter(box => { return box.id.includes(data) && box.owner !== walletAddress})
    const filteredStocks : Stock[] = await Promise.all(fiteredBoxes.map(box => fromBoxToStock(box,Status.owned)) )
    return filteredStocks
}

export async function getAllBoxes(): Promise<Array<Box>> {
    let boxNames: string[] = await getBoxesNames();
    let boxes: Box[] = [];
    for (let i = 0; i < boxNames.length; i++) {
        boxes.push(await getBox(boxNames[i]));
    }
    return boxes;
}

export async function updateBox(id: string): Promise<Box> {
    removeBox(id)
    const newBox: Box = await getBox(id)
    return newBox
}

export function removeBox(id: string){
    const idx = currentBoxes.findIndex(box => { return box.id === id })
    if(idx === -1){
        throw new Error("Box not found")
    }
    currentBoxes.splice(idx,1)[0]
}