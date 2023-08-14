import { RequestModel } from "../database.js";
import { StockRequest, companyName, partitaIVA, walletAddress } from "../types.js";
import { getPIVA } from "./helper_users.js";


export async function getRequestsByOldOwner(oldOwner: walletAddress): Promise<StockRequest[]>{
    const userPIVA : partitaIVA = await getPIVA(oldOwner)
    const requests: StockRequest[] = await RequestModel.find({ oldOwner: userPIVA })
    return requests
}


export async function getRequestsByRequester(requester: walletAddress): Promise<StockRequest[]>{
    const userPIVA: partitaIVA = await getPIVA(requester)
    const requests: StockRequest[] = await RequestModel.find({ requester: userPIVA })
    return requests
}


export async function createRequest(uuid: string,oldOwner: companyName, requester: partitaIVA): Promise<void>{
    try{
        if (!checkRequest(uuid,oldOwner,requester)){
            console.log("An invalid request was provided");
            return ;
        }
        const result = await RequestModel.find({ id: uuid });
        if(result[0] !== undefined){
            console.log("The provided requests already exist");
        }else{
            const oldOwnerPIVA: partitaIVA = await getPIVA(oldOwner)
            const newRequest = new RequestModel({ id: uuid,oldOwner: oldOwnerPIVA,requester: requester, isApproved: false});
            const response  = await newRequest.save();
            return ;
        }
    }catch(error){
        console.log("Create request has generated an error");
    } 
}

export async function approveRequest(id: string): Promise<void>{
    try{
        const result: StockRequest[] = await RequestModel.find({id: id});
        if(result[0] === undefined){
            console.log("The provided requests doesn't exist");
        }else{
            await RequestModel.findOneAndUpdate({id: id},{isApproved: true});
        }
    }catch(error){
        console.log("Internal server error " + error);
    }
}

export async function deleteRequest(id: string): Promise<void>{
    try{
        const result: StockRequest[] = await RequestModel.find({id:id})
        if(result[0] === undefined){
            console.log("The provided requests doesn't exist");
        }else{
            await RequestModel.deleteOne({id:id})
        }
    }catch(error){
        console.log("Internal server error " + error);
    }
}

function checkRequest(id: string,oldOwner: string,requester: string) : boolean{
    let check : boolean = true
    if(id === undefined || id === null)
        check = false
    if(oldOwner === undefined || oldOwner === null)
        check=false
    if(requester === undefined || requester === null)
        check=false
    return check
}