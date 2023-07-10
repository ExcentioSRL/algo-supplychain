from beaker import *
from beaker.consts import BOX_BYTE_MIN_BALANCE, BOX_FLAT_MIN_BALANCE
from beaker.lib.storage import BoxMapping
from pyteal import *


class Stock(abi.NamedTuple):
    owner: abi.Field[abi.Address] 
    creator: abi.Field[abi.Address]  

class State:
    def __init__(self,record_type: type[abi.BaseType]) -> None:
        self.stocks = BoxMapping(abi.Uint64,record_type)
        self.minimum_cost = Int(
            BOX_FLAT_MIN_BALANCE + 
            (abi.size_of(record_type) * BOX_BYTE_MIN_BALANCE + abi.size_of(abi.Uint64)* BOX_BYTE_MIN_BALANCE))

app = (Application("StockDapp", state=State(record_type=Stock))).apply(unconditional_opt_in_approval, initialize_local_state=True)


@app.external #payment: abi.PaymentTransaction,
def add_stock(uuid: abi.Uint64, creator: abi.Address) -> Expr:
    return Seq(
        #Assert(payment.get().receiver() == Global.current_application_address()),
        #Assert(payment.get().amount() == app.state.minimum_cost),
        Assert(Not(app.state.stocks[uuid].exists())),
        (new_stock := Stock()).set(creator,creator), #sets both creator and owner to the same address
        app.state.stocks[uuid].set(new_stock),
    )

def delete_stock(uuid: abi.Uint64) -> Expr:
    return Seq(
        Assert(app.state.stocks[uuid].exists()),
        app.state.stocks[uuid].delete(),
    )

@app.external
def get_stock_by_uuid(uuid:abi.Uint64, *, output: Stock) -> Expr:
    return output.decode(app.state.stocks[uuid].get())

@app.external
def change_owner(uuid: abi.Uint64,new_owner:abi.Address) -> Expr:
    return Seq(
        #come controllo che questa funzione possa essere invocata solo se possiedo il lotto?
        #chiedere una transazione, come alla creazione, per mantere il minimum balance e restituire i fondi al creatore?
        Assert(app.state.stocks[uuid].exists()),
        (stock := Stock()).decode(app.state.stocks[uuid].get()),
        (creator := abi.Address()).set(stock.creator),
        (owner := abi.Address()).set(stock.owner),
        owner.set(new_owner),
        stock.set(owner,creator),
        app.state.stocks[uuid].set(stock)
        
    )

@app.delete(bare=True, authorize=Authorize.only(Global.creator_address()))
def delete() -> Expr:
    return Approve()

if __name__ == "__main__":
    app.build().export("../artifacts")
