import beaker as bk
from beaker.lib.storage import (BoxMapping)
import pyteal as pt
import typing as ty

class StockClass(pt.abi.NamedTuple):
    id: pt.abi.Field[pt.abi.String]
    creator: pt.abi.Field[pt.abi.String]

#questo è un alias
stocks = pt.abi.DynamicArray[StockClass]

class State:
    def __init__(self):
        self.users = BoxMapping(pt.abi.Address,stocks)


app = bk.Application("stocksApp",state=State())

@app.external
def add_stock(owner: pt.abi.Address,id:pt.abi.String,creator:pt.abi.String):
    """
    mylist = [stock]
    mylist.append(stock)
    mylist = mylist.append(array)
    """
    
   
    return pt.Seq(
        pt.Assert(owner.get() == pt.Global.current_application_address()),
        (stock:= StockClass()).set(id,creator),
        pt.If(app.state.users[owner].exists()).Then(
            app.state.users[owner].store_into(array := stocks),
            array.set(array + [stock]),
            app.state.users[owner].set(array)
        ).Else(
          app.state.users[owner].set([stock])
        )
    )

def remove_stock(owner:pt.abi.Address,id:pt.abi.String):
    return pt.Seq(
        pt.Assert(app.state.users[owner].exists()),
        #todo: ottenere e rimuovere l'elemento dalla BoxList
    )
@app.external
def modify_ownership(new_owner: pt.abi.Address,old_owner: pt.abi.Address,id_stock: pt.abi.String):
    return pt.Seq(
        pt.Assert(app.state.users[new_owner].exists())
    )

@app.external
def get_boxes_by_owner(owner: pt.abi.Address):
    return pt.Seq(
        pt.Assert(app.state.users[owner].exists()),
        app.state.users[owner].get()
    )


#Forse devo tenere traccia di quanti box ha un owner con un altro array?


if __name__ == "__main__":
    app.build().export("./artifacts")
