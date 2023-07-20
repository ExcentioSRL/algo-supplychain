import { RequestModel } from "../database.js";
import { RequestClass, partitaIVA } from "../types.js";
import { getPIVAfromAddress, getPIVAfromName } from "./helper_users.js";


export async function getRequestsByWallet(wallet: string): Promise<RequestClass[][]> {
    const userPIVA = await getPIVAfromAddress(wallet);
    /*getting all users requests and separating them between his requests on others stocks and others requests on his stocks */
    const allRequests: RequestClass[] = await RequestModel.find({$or: [{ oldOwner: userPIVA } , { requester: userPIVA }]});
    const othersRequests : RequestClass[] = allRequests.filter(request => { return request.oldOwner === userPIVA })
    const myRequests = allRequests.filter(request => { return request.requester === userPIVA })
    console.log("othersRequests: " + othersRequests.length)
    console.log("myRequests: " + myRequests.length)
    return [othersRequests, myRequests];
}

export async function createRequest(uuid: string,oldOwner: string, requester: partitaIVA){
    try{
        if (!checkRequest(uuid,oldOwner,requester)){
            console.log("An invalid request was provided");
            return ;
        }
        const result = await RequestModel.find({ id: uuid });
        console.log("RESULT: " + result[0])
        if(result[0] !== undefined){
            console.log("The provided requests already exist");
        }else{
            const oldOwnerPIVA: partitaIVA = await getPIVAfromName(oldOwner)
            const newRequest = new RequestModel({ id: uuid,oldOwner: oldOwnerPIVA,requester: requester});
            const response  = await newRequest.save();
            return ;
        }
    }catch(error){
        console.log("Internal server error");
    } 
}

export async function deleteRequest(id: string) : Promise<string>{
    try{
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