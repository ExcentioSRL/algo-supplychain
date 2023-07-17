from algosdk import logic,transaction, v2client
from utils import get_account_data

if __name__ == "__main__":

    address,private_key = get_account_data("mnemonic_keys/mnemonic_key_account_prova.txt")
    algod_client = v2client.algod.AlgodClient("","https://testnet-api.algonode.cloud","")
    sp=algod_client.suggested_params()
    appID = 256007602
    #send funds to the contract
    send_funds_txn = transaction.ApplicationCallTxn(
        sender= address,
        sp = sp,
        index = appID,
        app_args= [
        #metodo,
        #id,
        address
        ],
        boxes = [list(appID,)]
    )

    signed_funds_txn = send_funds_txn.sign(private_key)
    fund_txid = algod_client.send_transaction(signed_funds_txn)
    fund_result = transaction.wait_for_confirmation(algod_client,fund_txid,4)
