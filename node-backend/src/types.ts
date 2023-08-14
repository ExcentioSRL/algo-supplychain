export type partitaIVA = string
export type walletAddress = string
export type companyName = string
//created types to remove ambiguity


export enum Status {
    owned = "owned",
    requested = "requested",
    requested_by = "requested by",
    unavailable = "unavailable"
}

export class Stock{
    id: string;
    producer: companyName;
    status: Status;
    owner: companyName;
    request?: StockRequest;

    constructor(id: string, producer: companyName, status: Status, owner: companyName, request?: StockRequest){
        this.id = id
        this.producer = producer
        this.status = status
        this.owner = owner
        this.request = request
    }
}

export class UserData{
    email: string;
    password: string;
    nomeAzienda: companyName;
    partitaIVA: partitaIVA;
    walletAddress: walletAddress;

    constructor(email: string, password: string, nomeAzienda: companyName, partitaIVA: partitaIVA, walletAddress: walletAddress){
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

export class StockRequest{
    requester: partitaIVA;
    isApproved: boolean;

    id?: string;
    oldOwner?: partitaIVA;

    constructor(requester: partitaIVA, isApproved: boolean, id?: string, oldOwner?: partitaIVA){
        this.id = id
        this.oldOwner = oldOwner
        this.requester = requester
        this.isApproved = isApproved
    }
}

export class StockHistory{
    id: string;
    historyNames: Array<companyName>
    historyWallets: Array<walletAddress>
    
    constructor(id: string, historyNames: Array<companyName>, historyWallets: Array<walletAddress>){
        this.id = id;
        this.historyNames = historyNames;
        this.historyWallets = historyWallets;
    }
}