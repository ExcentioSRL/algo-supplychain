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
    owner?: string;

    constructor(id: number, producer: string, status: Status, requester?: string, owner?:string){
        this.id = id
        this.producer = producer
        this.status = status
        this.requester = requester
        this.owner = owner
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

export async function fromBoxesToStocks(stock : StockFromBoxes, isOwned : boolean, requesterPIVA? : string){
    let status_stock: Status
    let requester : string | undefined;
    if(isOwned === true){
        status_stock = Status.owned
    }else{
        if (requesterPIVA === undefined){
            status_stock = Status.requested
        }else{
            status_stock = Status.requested_by
            
            let user1Data: UserData[] = await UserModel.find({ partitaIVA: requesterPIVA })
            requester = user1Data !== undefined ? user1Data[0].nomeAzienda : undefined
            console.log("Requester: " + requester)
        }
    }

    const user2Data: UserData[] = await UserModel.find({ walletAddress: stock.producer })
    const producer = user2Data[0].nomeAzienda

    let user3Data: UserData[] = user2Data;
    if(stock.owner !== stock.producer){
        user3Data = await UserModel.find({walletAddress: stock.owner})
    }
    const owner = user3Data[0].nomeAzienda
    
    return new StockToSend(stock.id, producer!, status_stock, requester,owner)
}
//two types of stocks: Stock from smart contract boxes and Stock to send to frontend
export function rimuoviDuplicati(array : StockToSend[]) {
    const set = new Set();
    let risultato: StockToSend[] = [];
    const comodo : StockToSend[] = [];
    risultato = array.filter(stock => 
        {
            if(Status.requested_by === stock.status){
                set.add(stock.id)
                return true
            }else{
                return false;
            }
        }
        )
    array.forEach(stock => {
        if (!set.has(stock.id)) {
            risultato.push(stock)
        }
    })
    /*array.forEach((oggetto) => {
        if (!idMap.has(oggetto.id)) {
            idMap.set(oggetto.id,oggetto);
            risultato.push(oggetto);
        } else {
            const duplicato = idMap.get(oggetto.id);
            if (oggetto.status === Status.requested_by) {
                duplicato!.status = Status.requested_by;
            }
        }
    });*/

    return risultato;
}