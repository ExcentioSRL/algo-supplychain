import {Status,Stock} from "../types.js"
import { currentBoxes } from "../server.js";
import { fromBoxToStock, filterBoxes } from "./helper_boxes.js";
import { getRequestsByWallet } from "./helper_requests.js";

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

