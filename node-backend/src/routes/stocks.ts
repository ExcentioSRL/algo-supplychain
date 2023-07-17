import { currentBoxes } from "../server.js";
import { filterBoxes, fromBoxToStock, rimuoviDuplicati } from "../utils.js";
import { RequestClass, Status,Stock, UserData } from "../types.js";
import { UserModel, RequestModel } from "../database.js";

export async function getStocksByOwner(ownerWallet: string) : Promise<Stock[]>{
    const filteredBoxes = currentBoxes.filter(box => {
        return box.owner == ownerWallet
    })

    const allRequests = await getRequestsByWallet(ownerWallet)

    let result = await Promise.all(filteredBoxes.map(box => fromBoxToStock(box, Status.owned))) //my stocks
    result.concat(await filterBoxes(filteredBoxes, allRequests[0], false)) //others requests on my stocks
    result.concat(await filterBoxes(currentBoxes, allRequests[1], true)) //my requests on others stocks
    return rimuoviDuplicati(result)
}

async function getRequestsByWallet(wallet: string) : Promise<RequestClass[][]>{
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

    return [othersRequests,myRequests];

}