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
    requester?: string;
    owner?: string;

    constructor(id: string, producer: string, status: Status, requester?: string, owner?:string){
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

export class Box{
    id: string;
    producer: string;
    owner: string;

    constructor(id: string, producer: string, owner: string){
        this.id = id
        this.producer = producer
        this.owner = owner
    }

}

export class RequestClass{
    id: string;
    oldOwner: string;
    requester: string;

    constructor(id: string,oldOwner: string, requester: string){
        this.id = id
        this.oldOwner = oldOwner
        this.requester = requester
    }
}

