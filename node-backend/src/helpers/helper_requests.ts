import { RequestModel } from "../database.js";
import { RequestClass } from "../types.js";
import { getPIVAfromAddress } from "./helper_users.js";


export async function getRequestsByWallet(wallet: string): Promise<RequestClass[][]> {
    const userPIVA = await getPIVAfromAddress(wallet);
    /*getting all users requests and separating them between his requests on others stocks and others requests on his stocks */
    const allRequests: RequestClass[] = await RequestModel.find({ oldOwner: userPIVA } || { requester: userPIVA });
    const othersRequests = allRequests.filter(request => { return request.oldOwner === userPIVA })
    const myRequests = allRequests.filter(request => { return request.requester === userPIVA })

    return [othersRequests, myRequests];
}

export async function createRequest(request: RequestClass): Promise<string> {
    const id : string = request.id
    const oldOwner : string = request.oldOwner
    const requester : string = request.requester
    try{
        if(!checkRequest(request)){
            return Promise.reject("An invalid request was provided");
        }
        const result = await RequestModel.findOne({id});
        if(result !== null){
            return Promise.reject("The provided requests already exist");
        }else{
            const newRequest = new RequestModel({ id, oldOwner, requester});
            const response  = await newRequest.save();
            return Promise.resolve("Request deleted correctly");
        }
    }catch(error){
        return Promise.reject("Internal server error");
    } 
}

export async function deleteRequest(request: RequestClass) : Promise<string>{
    const id : string = request.id
    try{
        if(!checkRequest(request)){
            return Promise.reject("An invalid request was provided");
        }
        const result = await RequestModel.findOne({id});
        if(result === null){
            return Promise.reject("The provided requests doesn't exist");
        }else{
            await RequestModel.deleteOne({id});
            return Promise.resolve("Request deleted correctly");
        }
    }catch(error){
        return Promise.reject("Internal server error");
    }
}

function checkRequest(request: RequestClass) : boolean{
    let check : boolean = true
    if(request.id === undefined || request.id === null)
        check = false
    if(request.oldOwner === undefined || request.oldOwner === null)
        check=false
    if(request.requester === undefined || request.requester === null)
        check=false
    return check
}