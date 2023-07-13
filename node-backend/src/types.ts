import { UserModel } from "./database.js";

enum Status {
    owned = "owned",
    requested = "requested",
    requested_by = "requested by"
}

export class StockToSend{
    id: number;
    producer: string;
    status: Status;
    requester?: string;

    constructor(id: number, producer: string, status: Status, requester?: string){
        this.id = id
        this.producer = producer
        this.status = status
        this.requester = requester
    }
}

export class UserData{
    email?: string | undefined;
    password?: string | undefined;
    nomeAzienda?: string | undefined;
    partitaIVA?: string | undefined;
    walletAddress?: string | undefined;

    constructor(email?: string, password?: string, nomeAzienda?: string, partitaIVA?:string, walletAddress? : string){
        this.email = email
        this.password = password
        this.nomeAzienda = nomeAzienda
        this.partitaIVA = partitaIVA
        this.walletAddress = walletAddress
    }

}

export class StockFromBoxes{
    id: number ;
    producer: string ;
    owner: string;

    constructor(id: number, producer: string, owner: string){
        this.id = id
        this.producer = producer
        this.owner = owner
    }

}

export class RequestClass{
    id: number;
    oldOwner: string;
    requester: string;

    constructor(id: number,oldOwner: string, requester: string){
        this.id = id
        this.oldOwner = oldOwner
        this.requester = requester
    }
}

export async function fromBoxesToStocks(stock : StockFromBoxes, isOwned : boolean, requesterWallet? : string){
    let status_stock: Status
    let requester : string | undefined;
    if(isOwned === true){
        status_stock = Status.owned
    }else{
        if (requesterWallet === undefined){
            status_stock = Status.requested
        }else{
            status_stock = Status.requested_by
            /*
            let user1Data: UserData[] = UserModel.find({ walletAddress: requesterWallet }).then(response => {
                user1Data = response
            })
            requester = user1Data[0].nomeAzienda */
        }
    }
    let user2Data: UserData[] = []; 
    user2Data = await UserModel.find({ walletAddress: stock.producer })
    const producer = user2Data[0].nomeAzienda
    console.log("producer: " + producer)
    return new StockToSend(stock.id, producer!,status_stock,requester)
}
//two types of stocks: Stock from smart contract boxes and Stock to send to frontend
