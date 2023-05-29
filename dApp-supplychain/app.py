import beaker as bk
from beaker.lib.storage import BoxMapping
import pyteal as pt

#Crea uno stato che poi viene inserito in un box?

class Stock(pt.abi.NamedTuple):
    #id: pt.abi.Field[pt.abi.String]
    creator: pt.abi.Field[pt.abi.String]
    owner: pt.abi.Field[pt.abi.String] #forse String?

#devi usare boxmapping    
class app(bk.Application):

    stocks= BoxMapping(pt.abi.String,Stock)

    @bk.internal
    def check_ownership(self,id: pt.abi.String,owner: pt.abi.String) ->pt.Expr:
        return pt.Seq(
            pt.Assert(self.stocks[id.get()].get() == owner.get())
        )

    @bk.external
    def add_stock(self,payment:pt.abi.PaymentTransaction ,id: pt.abi.String,creator: pt.abi.String, owner: pt.abi.String,*,output: Stock) -> pt.Expr:
        return pt.Seq(
            #controllo che riceva i fondi per creare il lotto
            pt.Assert(payment.get().receiver() == self.address),
            #controllo che quanto ho ricevuto sia abbastanza da soddisfare il Minimum Balance Requirement
            pt.Assert(payment.get().amount >= pt.Int(1)), #cambiare Int(1)
            #controllo che il lotto ancora non esista
            pt.Assert(pt.Not(self.stocks[id.get()].exists())),

            #crea un box
            output.set(creator.get(),owner.get()),
            pt.App.box_put(id.get(),output.encode()),
        )

    @bk.external
    def update_owner(self,id:pt.abi.String,owner:pt.abi.String) -> pt.Expr:
        return pt.Seq(
            self.check_ownership(id=id,owner=owner), #Assert?
            #aggiungere il check sull'ownership
            # 
            pt.App.box_replace(id.get(),)
            
        )

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
