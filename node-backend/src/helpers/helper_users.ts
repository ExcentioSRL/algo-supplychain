import { UserData,walletAddress,partitaIVA } from "../types.js"
import { UserModel } from "../database.js";


export async function getNameFromAddress(walletAddress: walletAddress){
    const userData : UserData[] = await UserModel.find({ walletAddress: walletAddress })
    const owner : string = userData[0].nomeAzienda!
    return owner
}

export async function getPIVAfromAddress(walletAddress: walletAddress){
    const userData: UserData[] = await UserModel.find({ walletAddress: walletAddress })
    if (userData[0].walletAddress === undefined) {
        throw new Error("No wallet associated with this account")
    }
    const partitaIVA : partitaIVA = userData[0].partitaIVA!
    return partitaIVA
}

export async function getPIVAfromName(name: string){
    const userData: UserData[] = await UserModel.find({ nomeAzienda: name })
    const owner: partitaIVA = userData[0].nomeAzienda!
    return owner
}