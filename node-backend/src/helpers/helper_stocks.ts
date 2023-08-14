import {Status,Stock, walletAddress} from "../types.js"
import { currentBoxes } from "../server.js";
import { fromBoxToStock, associateBoxesWithRequests } from "./helper_boxes.js";
import { getCompanyName } from "./helper_users.js";
import { getRequestsByOldOwner, getRequestsByRequester } from "./helper_requests.js"

function removeDuplicates(array: Stock[]) : Array<Stock>{
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

export async function getStocksByOwner(ownerWallet: walletAddress): Promise<Array<Stock>> {
    const filteredBoxes = currentBoxes.filter(box => {
        return box.owner == ownerWallet
    })

    let result = await Promise.all(filteredBoxes.map(box => fromBoxToStock(box, Status.owned)))
    result = result.concat(await associateBoxesWithRequests(filteredBoxes, await getRequestsByOldOwner(ownerWallet), Status.requested_by)) 
    result = result.concat(await associateBoxesWithRequests(currentBoxes, await getRequestsByRequester(ownerWallet), Status.requested)) 
    result = removeDuplicates(result)
    return removeApprovedRequestedByStocks(result,ownerWallet)
}

export function removeRequestsFromStocks(stocks: Stock[]) : Array<Stock>{
    const temporaryStocks: Stock[] = stocks.map(stock => changeRequestsToUnavailable(stock))
    return temporaryStocks
}

export function changeRequestsToUnavailable(stock : Stock) : Stock{
    if(stock.status === Status.requested_by || stock.status === Status.requested){
        return new Stock(stock.id,stock.producer,Status.unavailable,stock.owner,undefined)
    }else{
        return stock
    }
}
/**
 * 
 * @param stocks 
 * @param walletAddress 
 * @returns Removes all stocks that got an approved request for a specific user (the user is the old owner)
 */
async function removeApprovedRequestedByStocks(stocks: Stock[],walletAddress:walletAddress) : Promise<Array<Stock>>{
    const name = await getCompanyName(walletAddress)

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