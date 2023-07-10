from algosdk.abi import ABIType
from algosdk.encoding import decode_address
from algosdk.transaction import PaymentTxn
from algosdk.atomic_transaction_composer import TransactionWithSigner
from beaker import client, localnet

import app


def main() -> None:
    # Create a codec from the python sdk
    order_codec = ABIType.from_string(str(app.Stock().type_spec()))

    acct = localnet.get_accounts().pop()
    acct2 = localnet.get_accounts().pop()
    # Create an Application client containing both an algod client and my app
    app_client = client.ApplicationClient(
        localnet.get_algod_client(), app.app, signer=acct.signer
    )
    app_client.create()

    # Passing in a dict as an argument that should take a tuple
    # according to the type spec
    
    
    """
    sp = app_client.get_suggested_params()
    sp.flat_fee = True
    sp.fee=2000
    pay= PaymentTxn(
            acct2.address,
            sp,
            app_client.app_addr,
            app.app.state.minimum_cost.value
        )
    """
    stock_number = 3
    
    app_client.call(
        app.add_stock,
        #payment=TransactionWithSigner(pay,acct.signer),
        uuid=stock_number,creator=decode_address(acct.address),owner=decode_address(acct.address),
        boxes=[(app_client.app_id,stock_number)]
        )

    print(
        "Added"
    )

    app_client.call(
        app.change_owner, 
        uuid=stock_number,new_owner=decode_address(acct2.address),
        boxes=[(app_client.app_id,stock_number)]
        )
    print(
        "Changed"
    )

    result = app_client.call(
        app.get_stock_by_uuid,
        uuid=stock_number,
        boxes=[(app_client.app_id,stock_number)]
        )
    abi_decoded = order_codec.decode(result.raw_value)
    print(
        abi_decoded
    )
    
if __name__ == "__main__":
    main()
