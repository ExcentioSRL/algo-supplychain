from beaker import *
from beaker.lib.storage import BoxMapping
from pyteal import *


class Stock(abi.NamedTuple):
    owner: abi.Field[abi.Address] 
    creator: abi.Field[abi.Address]  

class State:
    def __init__(self,record_type: type[abi.BaseType]) -> None:
        self.stocks = BoxMapping(abi.String,record_type)

app = (Application("StockDapp", state=State(record_type=Stock))).apply(unconditional_opt_in_approval, initialize_local_state=True)


@app.external 
def add_stock(uuid: abi.String, creator: abi.Address) -> Expr:
    return Seq(
        Assert(Not(app.state.stocks[uuid.get()].exists())),
        (new_stock := Stock()).set(creator,creator), #sets both creator and owner to the same address
        app.state.stocks[uuid.get()].set(new_stock),
    )

@app.external
def delete_stock(uuid: abi.String) -> Expr:
    return Seq(
        Assert(app.state.stocks[uuid.get()].exists()),
        Pop(app.state.stocks[uuid.get()].delete())
    )

@app.external
def change_owner(uuid: abi.String,new_owner:abi.Address) -> Expr:
    return Seq(
        Assert(app.state.stocks[uuid.get()].exists()),
        (stock := Stock()).decode(app.state.stocks[uuid.get()].get()),
        (creator := abi.Address()).set(stock.creator),
        (owner := abi.Address()).set(stock.owner),
        owner.set(new_owner),
        stock.set(owner,creator),
        app.state.stocks[uuid.get()].set(stock)
    )

@app.delete(bare=True, authorize=Authorize.only(Global.creator_address()))
def delete() -> Expr:
    return Approve()

@app.update(bare=True, authorize=Authorize.only(Global.creator_address()))
def update() -> Expr:
    return Approve()

if __name__ == "__main__":
    app.build().export("../artifacts")
