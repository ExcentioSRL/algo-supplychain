import base64
from algosdk import transaction,mnemonic,account
from algokit_utils import get_algod_client,get_localnet_default_account
from beaker import localnet

def read_key():
    try:
        with open("mnemonic_key.txt") as file:
            mnemonic_key = file.read()
            return mnemonic_key
    except FileNotFoundError:
        print("Il file specificato non esiste.")


#def get_account_data():
#    key = read_key()
#    pk = mnemonic.to_private_key(key)
#    addr = account.address_from_private_key(pk)
#    return addr,pk

if __name__== "__main__":
    #address,private_key = get_account_data()

    accs = localnet.get_accounts()
    dapp_account = accs.pop()

    with open("../artifacts/approval.teal") as f:
        approval_program = f.read()
    with open("../artifacts/clear.teal") as f:
        clear_program = f.read()
    
    local_schema = transaction.StateSchema(num_uints=1, num_byte_slices=1)
    global_schema = transaction.StateSchema(num_uints=1, num_byte_slices=1)

    algod_client = localnet.get_algod_client()
    
    
    approval_result = algod_client.compile(approval_program)
    approval_binary = base64.b64decode(approval_result["result"])
    clear_result = algod_client.compile(clear_program)
    clear_binary = base64.b64decode(clear_result["result"])

    sp=algod_client.suggested_params()

    app_create_txn = transaction.ApplicationCreateTxn(
        dapp_account.address,
        sp,
        transaction.OnComplete.NoOpOC,
        approval_program=approval_binary,
        clear_program=clear_binary,
        global_schema=global_schema,
        local_schema=local_schema,
    )

    signed_create_txn = app_create_txn.sign(dapp_account.private_key)
    txid = algod_client.send_transaction(signed_create_txn)
    result = transaction.wait_for_confirmation(algod_client,txid,4)
    app_id = result["application-index"]
    print(f"Created app with id: {app_id}")
