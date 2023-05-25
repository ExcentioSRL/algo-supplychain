import beaker as bk
from beaker.lib.storage import BoxMapping
import pyteal as pt

#Crea uno stato che poi viene inserito in un box?

class Stock(pt.abi.NamedTuple):
    #id: pt.abi.Field[pt.abi.String]
    creator: pt.abi.Field[pt.abi.String]
    owner: pt.abi.Field[pt.abi.Address] #forse String?

#devi usare boxmapping
class MappingStock:
    stocks= BoxMapping(pt.abi.Address,Stock)

app = bk.Application("StockRegistration",state=MappingStock)

@app.internal
def check_ownership(id: pt.abi.String) ->pt.Expr:
    return pt.Seq(
        app.state.stocks[id.get()].get()
    )

@app.internal
def check_existence(id: pt.abi.String) ->pt.Expr:
    return 

@app.external
def add_stock(payment:pt.abi.PaymentTransaction ,id: pt.abi.String,creator: pt.abi.String, owner: pt.abi.String,*,output: Stock) -> pt.Expr:
    return pt.Seq(
        
        #deve ricevere fondi
        #aggiungere il check sull'esistenza
        output.set(creator.get(),owner.get()), #Non so se serve il .get()
        pt.App.box_put(id.get(),output.encode()),
    )

@app.external
def update_owner(id:pt.abi.String,owner:pt.abi.String) -> pt.Expr:
    return pt.Seq(
        #aggiungere il check sull'ownership
        # 
        pt.App.box_replace(pt.Txn.sender(),)
        
    )


#TO DO:
# - Quando crei un nuovo lotto, chiedi di inviare un balance per scrivere ->
#  - Prima invio una transazione di pagamento
#  - Poi invio la  mia effettiva transazione di Write
#  - Si potrebbe usare Atomic Transaction ?
# - Controllo sull'esistenza di un lotto tra tutti i lotti esistenti ? 
# - Controllo sull'ownership di un lotto
# - Create/Deploy

if __name__ == "__main__":
    app.build().export("./artifacts")
