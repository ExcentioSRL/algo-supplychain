import {Status,Stock, walletAddress} from "../types.js"
import { currentBoxes } from "../server.js";
import { fromBoxToStock, filterBoxes } from "./helper_boxes.js";
import { getRequestsByWallet } from "./helper_requests.js";
import { getNameFromAddress } from "./helper_users.js";

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
    })
    array.forEach(stock => {
        if (!set.has(stock.id)) {
            risultato.push(stock)
        }
    })
    return risultato;
}

export async function getStocksByOwner(ownerWallet: walletAddress): Promise<Stock[]> {
    const filteredBoxes = currentBoxes.filter(box => {
        return box.owner == ownerWallet
    })

    const allRequests = await getRequestsByWallet(ownerWallet)
    if(allRequests.length === 0){
        return []
    }else{
        let result = await Promise.all(filteredBoxes.map(box => fromBoxToStock(box, Status.owned))) //my stocks
        result = result.concat(await filterBoxes(filteredBoxes, allRequests[0], false)) //others requests on my stocks
        result = result.concat(await filterBoxes(currentBoxes, allRequests[1], true)) //my requests on others stocks
        return removeDuplicates(result)
    }
    
}

export function removeRequestsFromStocks(stocks: Stock[]) : Stock[]{
    let temporaryStocks: Stock[] = stocks.filter(stock => { return stock.status !== Status.requested })
    temporaryStocks = temporaryStocks.map(stock => changeRequestedbyToUnavailable(stock))
    return temporaryStocks
}

export function changeRequestedbyToUnavailable(stock : Stock) : Stock{
    if(stock.status === Status.requested_by){
        return new Stock(stock.id,stock.producer,Status.unavailable,stock.owner,undefined)
    }else{
        return stock
    }
}

export async function removeRequestedByStocksApproved(stocks: Stock[],walletAddress:walletAddress){

    const name = await getNameFromAddress(walletAddress)

    return stocks.filter(stock => {
        if (stock.status !== Status.requested_by) {
            return true;
        } else {
            if (stock.request?.isApproved === true && stock.request.oldOwner === name) {
                return false;
            } else {
                return true;
            }
        }
    })
}