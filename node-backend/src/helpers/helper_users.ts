import { UserData } from "../types.js"
import { UserModel } from "../database.js";


export async function getNameFromAddress(walletAddress : string){
    const userData : UserData[] = await UserModel.find({ walletAddress: walletAddress })
    const owner : string = userData[0].nomeAzienda!
    return owner
}

export async function getPIVAfromAddress(walletAddress : string){
    const userData: UserData[] = await UserModel.find({ walletAddress: walletAddress })
    if (userData[0].walletAddress === undefined) {
        throw new Error("No wallet associated with this account")
    }
    return userData[0].partitaIVA
}