from algosdk import account, mnemonic

def write_file(path,appID):
    try:
        with open(path,"+w") as file:
            file.write(str(appID))
            data = file.read()
            return data
    except FileNotFoundError:
        print("Il file specificato non esiste.")

def clear_file(path):
    try:
        with open(path,"+w") as file:
            file.truncate(0)
            data = file.read()
            return data
    except FileNotFoundError:
        print("Il file specificato non esiste.")

def read_file(path):
    try:
        with open(path) as file:
            data = file.read()
            return data
    except FileNotFoundError:
        print("Il file specificato non esiste.")


def get_account_data(path):
   key = read_file(path)
   pk = mnemonic.to_private_key(key)
   addr = account.address_from_private_key(pk)
   return addr,pk
