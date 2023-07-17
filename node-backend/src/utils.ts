import {Status,Box,Stock,UserData,RequestClass} from "./types.js"
import { UserModel } from "./database.js";
import * as sdk from "algosdk"

export async function fromBoxToStock(box: Box,status: Status, requesterPIVA?:string){
    const producer = await getNameFromAddress(box.producer)
    const owner = await getNameFromAddress(box.owner)
    if(status === Status.requested_by){
        const requesterData: UserData[] = await UserModel.find({ partitaIVA: requesterPIVA })
        const requester = requesterData[0].nomeAzienda!
        return new Stock(box.id, producer, status, requester, owner)
    }else{
        return new Stock(box.id, producer, status, undefined, owner)
    }
}

async function getNameFromAddress(walletAddress : string){
    const userData : UserData[] = await UserModel.find({ walletAddress: walletAddress })
    const owner : string = userData[0].nomeAzienda!
    return owner
}

export function rimuoviDuplicati(array: Stock[]) {
    const set = new Set();
    let risultato: Stock[] = [];
    risultato = array.filter(stock => {
        if (Status.requested_by === stock.status) {
            set.add(stock.id)
            return true
        } else {
            return false;
        }
    }
    )
    array.forEach(stock => {
        if (!set.has(stock.id)) {
            risultato.push(stock)
        }
    })
    return risultato;
}


export async function filterBoxes(stocks: Box[], requests: RequestClass[], isMyRequest: boolean) {
    let risultato: Stock[] = [];
    for (let i = 0; i < requests.length; i++) {
        for (let j = 0; j < stocks.length; j++) {
            if (requests[i].id == stocks[j].id) {
                let stock: Stock;
                if (isMyRequest === true) {
                    stock = await fromBoxToStock(stocks[j], Status.requested);
                } else {
                    stock = await fromBoxToStock(stocks[j], Status.requested_by, requests[i].requester);
                }
                risultato.push(stock);
            }
        }
    }
    return risultato;
}

export function parseBoxData(data: Uint8Array) {
    let stringTupleCodec = sdk.ABIType.from('(address,address)')
    let decodedData = stringTupleCodec.decode(data).toString()
    return decodedData.split(",")
}

export function parseBoxName(data: Uint8Array) {
    const decodedData = new TextDecoder().decode(data)
    return decodedData
}
