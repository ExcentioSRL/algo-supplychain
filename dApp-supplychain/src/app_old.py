from beaker import *
from pyteal import *

class Stock(abi.NamedTuple):
    #uuid: abi.Field[abi.String]
    owner: abi.Field[abi.String]
    creator: abi.Field[abi.String]

class State:
    stocks = ReservedLocalStateValue(
        stack_type= TealType.bytes,
        max_keys=16,
        prefix=""
    )


app = (Application("StockDapp", state=State())).apply(unconditional_opt_in_approval, initialize_local_state=True)


@app.external
def add_stock(uuid: abi.String, creator: abi.String,owner: abi.String, *, output: Stock) -> Expr:
    return Seq(
        (new_stock := Stock()).set(owner,creator),
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
    return output.decode(app.state.stocks[uuid])

@app.external
def change_owner(uuid: abi.String,new_owner:abi.String) -> Expr:
    return Seq(
        Assert(app.state.stocks[uuid].exists()),
        (stock := Stock()).decode(app.state.stocks[uuid]),
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
