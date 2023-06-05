from algosdk.abi import ABIType

from beaker import client, localnet

import app


def main() -> None:
    # Create a codec from the python sdk
    order_codec = ABIType.from_string(str(app.Stock().type_spec()))

    acct = localnet.get_accounts().pop()

    # Create an Application client containing both an algod client and my app
    app_client = client.ApplicationClient(
        localnet.get_algod_client(), app.app, signer=acct.signer,app_id=21
    )

    # Since we're using local state, opt in
    app_client.opt_in()

    # Passing in a dict as an argument that should take a tuple
    # according to the type spec
    stock_number = "4a"
    app_client.call(app.add_stock, uuid=stock_number,creator="Matteo",owner="Matteo")

    print(
        "Added"
    )

    app_client.call(app.change_owner, uuid=stock_number,new_owner="Gigi")
    print(
        "Changed"
    )

    result = app_client.call(app.get_stock_by_uuid,uuid=stock_number)
    abi_decoded = order_codec.decode(result.raw_value)
    print(
        abi_decoded
    )
    
if __name__ == "__main__":
    main()
