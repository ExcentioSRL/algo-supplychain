from algosdk import logic,transaction, v2client
from utils import get_account_data,read_file

if __name__ == "__main__":

    address,private_key = get_account_data("mnemonic_keys/mnemonic_key_account_user.txt")
    appID = read_file("appID.txt")
    algod_client = v2client.algod.AlgodClient("","https://testnet-api.algonode.cloud","")

    sp=algod_client.suggested_params()
    amount = 1000000
    #send funds to the contract
    send_funds_txn = transaction.PaymentTxn(
        address,
        sp,
        logic.get_application_address(int(appID)),
        amount
    )

    signed_funds_txn = send_funds_txn.sign(private_key)
    fund_txid = algod_client.send_transaction(signed_funds_txn)
    fund_result = transaction.wait_for_confirmation(algod_client,fund_txid,4)
    print(f"Funded the app correctly with: {amount}")
