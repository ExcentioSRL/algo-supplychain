enum Status {
    owned = "owned",
    requested = "requested",
    requested_by = "requested by"
}

export class StockToSend{
    id: string;
    producer: string;
    status: Status;
    requester?: string;

    constructor(id: string, producer: string, status: Status, requester?: string){
        this.id = id
        this.producer = producer
        this.status = status
        this.requester = requester
    }
}

export class StockFromBoxes {
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

    constructor(id:string,oldOwner: string, requester: string){
        this.id = id
        this.oldOwner = oldOwner
        this.requester = requester
    }
}

export function fromBoxesToStocks(stock : StockFromBoxes, isOwned : boolean, requester? : string){
    let status_stock: Status
    if(isOwned === true){
        status_stock = Status.owned
    }else{
        if(requester === undefined){
            status_stock = Status.requested
        }else{
            status_stock = Status.requested_by
        }
    }
    return new StockToSend(stock.id,stock.producer,status_stock,requester)
}
//two types of stocks: Stock from smart contract boxes and Stock to send to frontend
