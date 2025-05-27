import json
from web3 import Web3
from eth_account import Account
from web3.middleware import ExtraDataToPOAMiddleware


# === 1. Carregar chaves da conta e URL do nó ===
with open("keys.json") as f:
    keys = json.load(f)

rpc_url = keys['besu']['rpcnode']['url']
private_key = "0x60bbe10a196a4e71451c0f6e9ec9beab454c2a5ac0542aa5b8b733ff5719fec3"
account = Account.from_key(private_key)

# === 2. Conectar ao nó ===
w3 = Web3(Web3.HTTPProvider(rpc_url))
assert w3.is_connected(), "Erro: Não conectado ao nó Ethereum"
w3.middleware_onion.inject(ExtraDataToPOAMiddleware, layer=0)

# === 3. Carregar ABI e bytecode do contrato ===
with open("../contracts/CarbonCredit.json") as f:
    contract_json = json.load(f)
    abi = contract_json['contracts']['../contracts/CarbonCredit.sol']['CarbonCreditNFT']["abi"]
    bytecode = contract_json['contracts']['../contracts/CarbonCredit.sol']['CarbonCreditNFT']['evm']["bytecode"]['object']

# === 4. Criar contrato a partir do ABI e bytecode ===
CarbonCredit = w3.eth.contract(abi=abi, bytecode=bytecode)

# === 5. Construir transação de deploy ===
nonce = w3.eth.get_transaction_count(account.address)
transaction = CarbonCredit.constructor(12, 12, account.address).build_transaction({
    'from': account.address,
    'nonce': nonce,
    'gas': 2000000,
    'gasPrice': w3.eth.gas_price,
})

# === 6. Assinar e enviar a transação ===
signed_tx = w3.eth.account.sign_transaction(transaction, private_key)
#signed_tx = Account.sign_transaction(transaction, private_key)
#print(type(signed_tx), signed_tx)
tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
print("Enviando contrato... hash da transação:", tx_hash.hex())

# === 7. Aguardar confirmação e obter endereço do contrato ===
tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
contract_address = tx_receipt.contractAddress
print("Contrato implantado em:", contract_address)

# === 8. Interagir com o contrato ===
contract = w3.eth.contract(address=contract_address, abi=abi)

# contract.functions.registrarVeiculo(account.address, 1234, 1, 2841082).call()

print("Registrando veículo...")
# Obter nonce para a primeira transação
nonce_veiculo = w3.eth.get_transaction_count(account.address)
tx_veiculo = contract.functions.registrarVeiculo(account.address, 1234, 1, 2841082).build_transaction({
    'from': account.address,
    'nonce': nonce_veiculo,
    'gas': 200000,  # Aumentado para garantir gás suficiente
    'gasPrice': w3.eth.gas_price,
})

signed_tx_veiculo = w3.eth.account.sign_transaction(tx_veiculo, private_key)
tx_hash_veiculo = w3.eth.send_raw_transaction(signed_tx_veiculo.raw_transaction)
print("Hash da transação (registrarVeiculo):", tx_hash_veiculo.hex())

# Aguardar a confirmação da transação de registro do veículo
print("Aguardando confirmação da transação de registro do veículo...")
receipt_veiculo = w3.eth.wait_for_transaction_receipt(tx_hash_veiculo)
print(f"Transação confirmada: status = {receipt_veiculo.status}")

print("Registrando viagem...")
# Obter novo nonce para a segunda transação
nonce_viagem = w3.eth.get_transaction_count(account.address)
tx_viagem = contract.functions.registrarViagem(account.address, 1234, 30, 1000).build_transaction({
    'from': account.address,
    'nonce': nonce_viagem,
    'gas': 300000,  # Aumentado para garantir gás suficiente
    'gasPrice': w3.eth.gas_price,
})

signed_tx_viagem = w3.eth.account.sign_transaction(tx_viagem, private_key)
tx_hash_viagem = w3.eth.send_raw_transaction(signed_tx_viagem.raw_transaction)
print("Hash da transação (registrarViagem):", tx_hash_viagem.hex())

print("Verificando tokens disponíveis para saque...")
contract.functions.tokensDisponiveisParaSaque(account.address).transact()

# Esperar o recibo da transação
# receipt2 = w3.eth.wait_for_transaction_receipt(tx_hash2)

# Processar o evento para obter o tokenId
# events = contract.events.ViagemRegistrada().process_receipt(receipt2)
# if events:
#     token_id = events[0]['args']['tokenId']
#     print("Token ID retornado pela função registrarViagem:", token_id)
# else:
#     print("Evento ViagemRegistrada não encontrado nos logs da transação.")