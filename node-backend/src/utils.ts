import {Status,Box,Stock,UserData,RequestClass} from "./types.js"
import { RequestModel, UserModel } from "./database.js";
import * as sdk from "algosdk"
import { currentBoxes } from "./server.js";

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

export function removeDuplicates(array: Stock[]) {
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

export function parseBoxData(data: Uint8Array) {
    let stringTupleCodec = sdk.ABIType.from('(address,address)')
    let decodedData = stringTupleCodec.decode(data).toString()
    return decodedData.split(",")
}

export function parseBoxName(data: Uint8Array) {
    const decodedData = new TextDecoder().decode(data)
    return decodedData
}


export async function getStocksByOwner(ownerWallet: string): Promise<Stock[]> {
    const filteredBoxes = currentBoxes.filter(box => {
        return box.owner == ownerWallet
    })

    const allRequests = await getRequestsByWallet(ownerWallet)

    let result = await Promise.all(filteredBoxes.map(box => fromBoxToStock(box, Status.owned))) //my stocks
    result.concat(await filterBoxes(filteredBoxes, allRequests[0], false)) //others requests on my stocks
    result.concat(await filterBoxes(currentBoxes, allRequests[1], true)) //my requests on others stocks
    return removeDuplicates(result)
}

async function getRequestsByWallet(wallet: string): Promise<RequestClass[][]> {
    /*getting user Data */
    const userData: UserData[] = await UserModel.find({ walletAddress: wallet })
    if (userData[0].walletAddress === undefined) {
        throw new Error("No wallet associated with this account")
    }
    const userPIVA = userData[0].partitaIVA

    /*getting all users requests and separating them between his requests on others stocks and others requests on his stocks */
    const allRequests: RequestClass[] = await RequestModel.find({ oldOwner: userPIVA } || { requester: userPIVA });
    const othersRequests = allRequests.filter(request => { return request.oldOwner === userPIVA })
    const myRequests = allRequests.filter(request => { return request.requester === userPIVA })

    return [othersRequests, myRequests];

}