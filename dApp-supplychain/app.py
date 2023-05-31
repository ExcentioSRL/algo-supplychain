import beaker as bk
from beaker.lib.storage import (BoxMapping)
import pyteal as pt

#Crea uno stato che poi viene inserito in un box?

class StockClass(pt.abi.NamedTuple):
    id: pt.abi.Field[pt.abi.String]
    creator: pt.abi.Field[pt.abi.String]
    owner: pt.abi.Field[pt.abi.String]

class UserStocks(pt.abi.NamedTuple):
    user: pt.abi.Field[pt.abi.String] #Nome dell'azienda / PIVA
    stocks: pt.abi.Field[pt.abi.DynamicArray[StockClass]]
        
    def add_element(self,stock: StockClass,*,output: pt.abi.DynamicArray[StockClass]):
        return output.set([self.stocks,stock])

    # @bk.internal
    #def check_ownership(self,id: pt.abi.String,owner: pt.abi.String) ->pt.Expr:
      #  return pt.Seq(
       #     pt.Assert(self.stocks[id.get()].get() == owner.get())
        #)


users = BoxMapping(pt.abi.Address,UserStocks)

class State:
    mintFee = bk.GlobalStateValue(
        stack_type= pt.TealType.uint64,
        default=pt.Int(10000),
        descr="Price to create a stock"
    )
    minimumBalanceRequirement = bk.GlobalStateValue(
        stack_type=pt.TealType.uint64,
        default=pt.Int(0),
        descr="The price to have all those boxes"
    )

app = bk.Application("stocksApp",state=State())

@app.external
def get_fee(output: pt.abi.Uint64)-> pt.Expr:
    return output.set(app.state.mintFee)

@app.external
def get_balance_req(output: pt.abi.Uint64) ->pt.Expr:
    return output.set(app.state.minimumBalanceRequirement)

@app.external
def add_stock(
    payment:pt.abi.PaymentTransaction,
    id: pt.abi.String,
    creator: pt.abi.String,
    owner: pt.abi.String
    ) -> pt.Expr:
    return pt.Seq(
        #controlli necessari sui fondi, su chi è il ricevente
        pt.Assert(payment.get().receiver() == pt.Global.current_application_address()), 
        #pt.Assert(payment.get().amount() >= get_fee()),
        pt.Assert(users[payment.get().sender()].exists()), 
        
        #creo lo stock e prendo il singolo Box
        (stock := StockClass()).set(id,creator,owner),
        users[payment.get().sender()].store_into(single_user:= UserStocks()),
        #mi prendo i valori contenuti nel Box
        single_user.user.store_into(user_account := pt.abi.String()),
        single_user.stocks.store_into(stocks_array := pt.abi.make(pt.abi.DynamicArray[StockClass])),
        #stocks_array.set([stocks_array,stock]),
        #pt.Concat(stocks_array.decode(),stock.decode()),
        #aggiorno l'array
        (new_user:= UserStocks()).set(user_account,stocks_array),
        pt.BoxPut(payment.get().sender(),new_user.encode())
        
        )


@app.external
def getStock(
    user: pt.abi.Address,
    id: pt.abi.String,
    *,
    output: StockClass
    ) -> pt.Expr:
    return pt.Seq(
        box := pt.BoxGet(user.get()),
        pt.Assert(box.hasValue()),
        (single_user:= UserStocks()).set(box.value()),
    )


    #@bk.external
    #def update_owner(self,id:pt.abi.String,owner:pt.abi.String) -> pt.Expr:
        #return pt.Seq(
         #   self.check_ownership(id=id.get(),owner=owner.get()), #Assert?
            #aggiungere il check sull'ownership
            # 
          #  s := Stock().decode(app.state.stocks),
           # pt.App.box_replace(id.get(),)
        #)

#TO DO:
# - Quando crei un nuovo lotto, chiedi di inviare un balance per scrivere ->
#  1 Prima invio una transazione di pagamento 
#  2 Poi invio la  mia effettiva transazione di Write
#  1+2 Si potrebbe usare Atomic Transaction ?
# - Costo della creazione?
# - Controllo sull'esistenza di un lotto tra tutti i lotti esistenti ? 
# - Controllo sull'ownership di un lotto
# - Create/Deploy

if __name__ == "__main__":
    app.build().export("./artifacts")
