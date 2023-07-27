import {Status,Box,Stock,RequestClass, walletAddress, StockRequest} from "../types.js"
import * as sdk from "algosdk"
import { getNameFromAddress, getNameFromPIVA } from "./helper_users.js";
import { currentBoxes } from "../server.js";

export async function fromBoxToStock(box: Box,status: Status, request?: RequestClass){
    const producer : string = await getNameFromAddress(box.producer)
    let owner : string;
    if(box.producer === box.owner){
        owner = producer
    }else{
        owner = await getNameFromAddress(box.owner)
    }
    
    if(status === Status.requested_by || status === Status.requested){
        const oldOwner: string = await getNameFromPIVA(request?.oldOwner!);
        const requester: string = await getNameFromPIVA(request?.requester!);
        return new Stock(box.id, producer, status, owner, new StockRequest(oldOwner, requester,request?.isApproved!))
    }else{
        return new Stock(box.id, producer, status, owner,undefined)
    }
}

export async function filterBoxes(boxes: Box[], requests: RequestClass[], areMyRequests: boolean) {
    let risultato: Stock[] = [];
    for (let i = 0; i < requests.length; i++) {
        for (let j = 0; j < boxes.length; j++) {
            if (requests[i].id == boxes[j].id) {
                let stock: Stock;
                if (areMyRequests === true) {
                    stock = await fromBoxToStock(boxes[j], Status.requested,requests[i]);
                } else {
                    stock = await fromBoxToStock(boxes[j], Status.requested_by,requests[i]);
                }
                risultato.push(stock);
            }
        }
    }
    return risultato;
}

export function decodeBoxData(data: Uint8Array){
    let stringTupleCodec = sdk.ABIType.from('(address,address)')
    let decodedData = stringTupleCodec.decode(data).toString()
    return decodedData.split(",")
}

export function decodeBoxName(data: Uint8Array){
    const decodedData = new TextDecoder().decode(data)
    return decodedData
}

export function encodeBoxName(id: string){
    const encodedData = new TextEncoder().encode(id)
    return encodedData
}

export async function searchBoxesByPartialID(data: string,walletAddress: walletAddress): Promise<Stock[]>{
    const fiteredBoxes: Box[] = currentBoxes.filter(box => { return box.id.includes(data) && box.owner !== walletAddress})
    const filteredStocks : Stock[] = await Promise.all(fiteredBoxes.map(box => fromBoxToStock(box,Status.owned)) )
    return filteredStocks
}