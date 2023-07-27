import { RequestModel } from "../database.js";
import { RequestClass, partitaIVA } from "../types.js";
import { getPIVAfromAddress, getPIVAfromName } from "./helper_users.js";


export async function getRequestsByWallet(wallet: string): Promise<RequestClass[][]> {
    const userPIVA = await getPIVAfromAddress(wallet);
    if(userPIVA === ""){
        return []
    }else{
        const allRequests: RequestClass[] = await RequestModel.find({ $or: [{ oldOwner: userPIVA }, { requester: userPIVA }] });
        const othersRequests: RequestClass[] = allRequests.filter(request => { return request.oldOwner === userPIVA })
        const myRequests = allRequests.filter(request => { return request.requester === userPIVA })
        return [othersRequests, myRequests];
    }
    /*getting all users requests and separating them between his requests on others stocks and others requests on his stocks */
    
    
}

export async function createRequest(uuid: string,oldOwner: string, requester: partitaIVA){
    try{
        if (!checkRequest(uuid,oldOwner,requester)){
            console.log("An invalid request was provided");
            return ;
        }
        const result = await RequestModel.find({ id: uuid });
        if(result[0] !== undefined){
            console.log("The provided requests already exist");
        }else{
            const oldOwnerPIVA: partitaIVA = await getPIVAfromName(oldOwner)
            const newRequest = new RequestModel({ id: uuid,oldOwner: oldOwnerPIVA,requester: requester, isApproved: false});
            const response  = await newRequest.save();
            return ;
        }
    }catch(error){
        console.log("Internal server error");
    } 
}

export async function approveRequest(id: string){
    try{
        const result : RequestClass[] = await RequestModel.find({id: id});
        if(result[0] === undefined){
            console.log("The provided requests doesn't exist");
        }else{
            await RequestModel.findOneAndUpdate({id: id},{isApproved: true});
        }
    }catch(error){
        console.log("Internal server error " + error);
    }
}

export async function deleteRequest(id: string){
    try{
        const result : RequestClass[] = await RequestModel.find({id:id})
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