export type partitaIVA = string
export type walletAddress = string
//created types to remove ambiguity

export enum Status {
    owned = "owned",
    requested = "requested",
    requested_by = "requested by",
    unavailable = "unavailable"
}

export class Stock{
    id: string;
    producer: string;
    status: Status;
    owner: string;
    request?: StockRequest;

    constructor(id: string, producer: string, status: Status, owner: string, request?: StockRequest){
        this.id = id
        this.producer = producer
        this.status = status
        this.owner = owner
        this.request = request
    }
}

export class StockRequest{
    oldOwner: string; //nome azienda
    requester: string; //nome azienda
    isApproved: boolean;

    constructor(oldOwner: string,requester: string, isApproved: boolean){
        this.oldOwner = oldOwner;
        this.requester = requester;
        this.isApproved = isApproved;
    }
}

export class UserData{
    email?: string | undefined;
    password?: string | undefined;
    nomeAzienda?: string | undefined;
    partitaIVA?: partitaIVA | undefined;
    walletAddress?: walletAddress | undefined;

    constructor(email?: string, password?: string, nomeAzienda?: string, partitaIVA?: partitaIVA, walletAddress?: walletAddress){
        this.email = email
        this.password = password
        this.nomeAzienda = nomeAzienda
        this.partitaIVA = partitaIVA
        this.walletAddress = walletAddress
    }
}

export class Box{
    id: string;
    producer: walletAddress;
    owner: walletAddress;

    constructor(id: string, producer: walletAddress, owner: walletAddress){
        this.id = id
        this.producer = producer
        this.owner = owner
    }

}

export class RequestClass{
    id: string;
    oldOwner: partitaIVA;
    requester: partitaIVA;
    isApproved: boolean;

    constructor(id: string,oldOwner: string, requester: string,isApproved: boolean){
        this.id = id
        this.oldOwner = oldOwner
        this.requester = requester
        this.isApproved = isApproved
    }
}

export class StockHistory{
    id: string;
    historyNames : Array<string>
    historyWallets: Array<string>

    constructor(id:string,historyNames: Array<string>, historyWallets : Array<string>){
        this.id = id;
        this.historyNames = historyNames;
        this.historyWallets = historyWallets;
    }
}