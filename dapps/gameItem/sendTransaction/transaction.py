# python3 -m venv venv
# source venv/bin/activate

from web3 import Web3
from eth_account import Account
import json

# Conectar ao nó Besu
web3 = Web3(Web3.HTTPProvider('http://localhost:8545'))

# Carregar ABI e endereço do contrato
with open('../artifacts/contracts/GameItem.sol/GameItem.json') as f:
    contract_json = json.load(f)
contract_address = "0x42699A7612A82f1d9C36148af9C77354759b210b"
contract_abi = contract_json['abi']

# Criar instância do contrato
contract = web3.eth.contract(address=contract_address, abi=contract_abi)

# Configurar conta para enviar transação
private_key = "0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63"
account = Account.from_key(private_key)

# Endereço do jogador que receberá o NFT
player_address = "0xf17f52151EbEF6C7334FAD080c5704D77216b732"  # Exemplo de endereço
token_uri = "https://game.example/item-id-8u5h2m.json"  # URI do metadata do token

# Preparar a chamada da função awardItem
nonce = web3.eth.get_transaction_count(account.address)
transaction = contract.functions.awardItem(
    player_address,
    token_uri
).build_transaction({
    'from': account.address,
    'gas': 2000000,
    'gasPrice': web3.eth.gas_price,
    'nonce': nonce,
})

# Assinar e enviar transação
signed_txn = web3.eth.account.sign_transaction(transaction, private_key)
tx_hash = web3.eth.send_raw_transaction(signed_txn.raw_transaction)

# Aguardar recibo da transação
receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
print(f"Transaction hash: {receipt['transactionHash'].hex()}")
print(f"Block number: {receipt['blockNumber']}")
print(f"Gas used: {receipt['gasUsed']}")

# Filtrar apenas o evento Transfer
transfer_events = [log for log in receipt['logs'] if len(log['topics']) == 4 and 
                  log['topics'][0].hex() == '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef']

if transfer_events:
    token_id = int(transfer_events[0]['topics'][3].hex(), 16)
    print(f"NFT criado com ID: {token_id}")
else:
    print("Erro: Evento Transfer não encontrado")

balance = contract.functions.balanceOf(player_address).call()
print(f"Quantidade de NFTs do jogador: {balance}")