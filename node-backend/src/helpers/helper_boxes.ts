import {Status,Box,Stock,UserData,RequestClass, partitaIVA} from "../types.js"
import { UserModel } from "../database.js";
import * as sdk from "algosdk"
import { getNameFromAddress } from "./helper_users.js";

export async function fromBoxToStock(box: Box,status: Status, requesterPIVA?:partitaIVA){
    const producer : string = await getNameFromAddress(box.producer)
    let owner : string;
    if(box.producer === box.owner){
        owner = producer
    }else{
        owner = await getNameFromAddress(box.owner)
    }
    
    if(status === Status.requested_by){
        const requesterData: UserData[] = await UserModel.find({ partitaIVA: requesterPIVA })
        const requester = requesterData[0].nomeAzienda!
        return new Stock(box.id, producer, status, requester, owner)
    }else{
        return new Stock(box.id, producer, status, undefined, owner)
    }
}

export async function filterBoxes(boxes: Box[], requests: RequestClass[], areMyRequests: boolean) {
    let risultato: Stock[] = [];
    for (let i = 0; i < requests.length; i++) {
        for (let j = 0; j < boxes.length; j++) {
            if (requests[i].id == boxes[j].id) {
                let stock: Stock;
                if (areMyRequests === true) {
                    stock = await fromBoxToStock(boxes[j], Status.requested);
                } else {
                    stock = await fromBoxToStock(boxes[j], Status.requested_by, requests[i].requester);
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