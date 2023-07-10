from algosdk import account, mnemonic


def read_key(path):
    try:
        with open(path) as file:
            mnemonic_key = file.read()
            return mnemonic_key
    except FileNotFoundError:
        print("Il file specificato non esiste.")


def get_account_data(path):
   key = read_key(path)
   pk = mnemonic.to_private_key(key)
   addr = account.address_from_private_key(pk)
   return addr,pk
