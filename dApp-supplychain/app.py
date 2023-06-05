from beaker import *
from beaker.lib.storage import (BoxMapping)
from pyteal import *

class Stock(abi.NamedTuple):
    #uuid: abi.Field[abi.String]
    owner: abi.Field[abi.String]
    creator: abi.Field[abi.String]

class State:
    def __init__(self) -> None:
        self.stocks = BoxMapping(abi.String,abi.DynamicBytes)


app = (Application("StockDapp", state=State())).apply(unconditional_opt_in_approval, initialize_local_state=True)


@app.external
def add_stock(uuid: abi.String, creator: abi.String,owner: abi.String, *, output: Stock) -> Expr:
    return Seq(
        Assert(app.state.stocks[uuid].exists()),
        (new_stock := Stock()).set(owner,creator),
        #BoxPut(uuid.get(),new_stock.encode()), 
        app.state.stocks[uuid].set(new_stock.encode()),
        output.decode(new_stock.encode())
    )

def delete_stock(uuid: abi.String) -> Expr:
    return Seq(
        Assert(app.state.stocks[uuid].exists()),
        app.state.stocks[uuid].delete(),
    )

@app.external
def get_stock_by_uuid(uuid:abi.String, *, output: Stock) -> Expr:
    return output.decode(app.state.stocks[uuid].get())

@app.external
def change_owner(uuid: abi.String,new_owner:abi.String) -> Expr:
    return Seq(
        Assert(app.state.stocks[uuid].exists()),
        (stock := Stock()).decode(app.state.stocks[uuid].get()),
        (creator := abi.String()).set(stock.creator),
        (owner := abi.String()).set(stock.owner),
        owner.set(new_owner),
        stock.set(owner,creator),
        app.state.stocks[uuid].set(stock.encode())
        
    )

@app.delete(bare=True, authorize=Authorize.only(Global.creator_address()))
def delete() -> Expr:
    return Approve()

if __name__ == "__main__":
    app.build().export("./artifacts")
