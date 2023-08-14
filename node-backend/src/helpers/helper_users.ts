import { UserData, companyName, partitaIVA } from "../types.js"
import { UserModel } from "../database.js";

async function getUserData(data: string): Promise<UserData>{
    const userData: UserData | null = await UserModel.findOne({ $or: [{ nomeAzienda: data }, { walletAddress: data }, {partitaIVA: data}] })
    if(userData === undefined || userData === null){
        throw new Error("User data is missing");
    }
    return userData
}

export async function getCompanyName(data: string) : Promise<companyName>{
    const user : UserData = await getUserData(data)
    return user.nomeAzienda;
}

export async function getPIVA(data: string) : Promise<partitaIVA>{
    const user: UserData = await getUserData(data)
    return user.partitaIVA;
}
/*
export async function searchPIVAorName(data:string) : Promise<walletAddress[]>{
    let matches : Array<walletAddress> =[]
    const regexPattern = new RegExp(data,"i")
    const usersData : UserData[] = await UserModel.find({ nomeAzienda: regexPattern})
    if(usersData !== undefined){
        for (let i = 0; i < UserData.length; i++) {
            if (usersData[i].walletAddress !== undefined) {
                matches.push(usersData[i].walletAddress!)
            }

        }
    }
    return matches
}*/