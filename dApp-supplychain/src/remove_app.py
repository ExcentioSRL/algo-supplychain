from algosdk import transaction, v2client
from utils import get_account_data,read_file,clear_file

if __name__== "__main__":
    address,private_key = get_account_data("mnemonic_keys/mnemonic_key_deploy_account.txt")
    appID = read_file("appID.txt")

    algod_client = v2client.algod.AlgodClient("","https://testnet-api.algonode.cloud","")
    sp=algod_client.suggested_params()

    app_delete_txn = transaction.ApplicationDeleteTxn(
        address,
        sp,
        appID #appID già aggiornato
    )

    signed_delete_txn = app_delete_txn.sign(private_key)
    txid = algod_client.send_transaction(signed_delete_txn)
    result = transaction.wait_for_confirmation(algod_client,txid,4)
    clear_file("appID.txt")
