import json
import csv
from web3 import Web3
from eth_account import Account

# === 1. Carregar chaves da conta e URL do nó ===
with open("keys.json") as f:
    keys = json.load(f)

rpc_url = keys['besu']['rpcnode']['url']
private_key = "0x60bbe10a196a4e71451c0f6e9ec9beab454c2a5ac0542aa5b8b733ff5719fec3"
account = Account.from_key(private_key)

# === 2. Conectar ao nó Besu ===
w3 = Web3(Web3.HTTPProvider(rpc_url))
assert w3.is_connected(), "Erro: Não conectado ao nó Ethereum"

print("✅ Conectado ao nó Besu")
print(f"👤 Conta: {account.address}")

# === 3. Carregar endereço do contrato E1 ===
try:
    with open("contract_address_E1.txt") as f:
        contract_address = f.read().strip()
    print(f"📄 Contrato E1: {contract_address}")
except FileNotFoundError:
    print("❌ Erro: Arquivo contract_address_E1.txt não encontrado")
    print("Execute o deploy primeiro: python3 2_deploy_E1.py")
    exit(1)

# === 4. Carregar ABI do contrato E1 ===
try:
    with open("../contracts/CarbonCreditNFT_E1.json") as f:
        contract_json = json.load(f)
        if 'abi' in contract_json:
            abi = contract_json['abi']
        elif 'contracts' in contract_json:
            contract_key = list(contract_json['contracts'].keys())[0]
            contract_name = 'CarbonCreditNFT_E1'
            abi = contract_json['contracts'][contract_key][contract_name]['abi']
        else:
            raise KeyError("Formato de ABI não reconhecido")
except FileNotFoundError:
    print("❌ Erro: Arquivo CarbonCreditNFT_E1.json não encontrado")
    exit(1)

# === 5. Criar instância do contrato ===
contract = w3.eth.contract(address=contract_address, abi=abi)

# === 6. Verificar se a conta está autorizada ===
is_authorized = contract.functions.authorized(account.address).call()
print(f"🔐 Conta autorizada: {is_authorized}")

if not is_authorized:
    print("⚠️ Conta não autorizada. Tentando autorizar...")
    tx_auth = contract.functions.setAuthorized(account.address, True).build_transaction({
        'from': account.address,
        'nonce': w3.eth.get_transaction_count(account.address),
        'gas': 100000,
        'gasPrice': w3.eth.gas_price,
    })
    signed_tx_auth = w3.eth.account.sign_transaction(tx_auth, private_key)
    tx_hash_auth = w3.eth.send_raw_transaction(signed_tx_auth.raw_transaction)
    w3.eth.wait_for_transaction_receipt(tx_hash_auth)
    print("✅ Conta autorizada com sucesso!")

# === 7. Ler apenas o primeiro registro do CSV ===
print("\n📊 Lendo primeiro registro do CSV para teste...")
csv_path = "data/dados_gas.csv"

EMISSAO_GASOLINA = 1.720  # kg CO2/L
EMISSAO_ETANOL = 1.510    # kg CO2/L
CARBON_PRICE_PER_TON = 450.0  # BRL por tonelada

try:
    with open(csv_path, 'r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        row = next(reader)  # Apenas primeira linha
    
    print(f"✅ Registro carregado")
    
except FileNotFoundError:
    print(f"❌ Erro: Arquivo {csv_path} não encontrado")
    exit(1)

# === 8. Arrays de eficiência (apenas primeiro valor) ===
city_gasoline = 10.3
road_gasoline = 11.3
city_ethanol = 0  # Veículo a gasolina puro
road_ethanol = 0

print(f"\n{'='*60}")
print("🧪 TESTE COM PRIMEIRO REGISTRO DO CSV")
print(f"{'='*60}")

print(f"\n📝 DADOS DO VEÍCULO:")
print(f"   VIN: {row['VIN']}")
print(f"   Modelo: {row['model']} ({row['brand']})")
print(f"   Total: {row['total_distance']} km")

# Ler valores
ethanol_percent = float(row['ethanol (%)'])
highway_distance = float(row['highway (distance)'])
city_distance = float(row['city (distance)'])
real_co2_emissions = float(row['co2_etanol_original_gas_1720_flex'])

print(f"\n📊 PARÂMETROS:")
print(f"   Highway: {highway_distance:.2f} km")
print(f"   City: {city_distance:.2f} km")
print(f"   Ethanol %: {ethanol_percent:.2f}%")
print(f"   Road Gasoline: {road_gasoline:.2f} km/L")
print(f"   City Gasoline: {city_gasoline:.2f} km/L")
print(f"   Real CO2: {real_co2_emissions:.2f} g")

# === CÁLCULO PYTHON ===
tanque_gasoline = 100 - ethanol_percent
p_gas = tanque_gasoline / 100.0
p_etanol = ethanol_percent / 100.0

# Emissões rodovia
parte_1_gas = highway_distance * (1/road_gasoline) * p_gas * EMISSAO_GASOLINA * 1000
parte_1_eta = highway_distance * (1/road_ethanol) * p_etanol * EMISSAO_ETANOL * 1000 if road_ethanol > 0 else 0
parte1_python = parte_1_gas + parte_1_eta

# Emissões cidade
parte_2_gas = city_distance * (1/city_gasoline) * p_gas * EMISSAO_GASOLINA * 1000
parte_2_eta = city_distance * (1/city_ethanol) * p_etanol * EMISSAO_ETANOL * 1000 if city_ethanol > 0 else 0
parte2_python = parte_2_gas + parte_2_eta

meta_co2_python = parte1_python + parte2_python
diff_python = max(0, meta_co2_python - real_co2_emissions)
e1_python = (diff_python * CARBON_PRICE_PER_TON) / 1_000_000.0

print(f"\n🧮 CÁLCULOS PYTHON:")
print(f"   Tanque Gasolina: {tanque_gasoline:.2f}%")
print(f"   Parte 1 (rodovia): {parte1_python:.2f} g CO2")
print(f"   Parte 2 (cidade): {parte2_python:.2f} g CO2")
print(f"   Meta CO2: {meta_co2_python:.2f} g")
print(f"   Emissões Reais: {real_co2_emissions:.2f} g")
print(f"   Diff (economia): {diff_python:.2f} g")
print(f"   💰 E1: R$ {e1_python:.6f}")

# === ENVIAR PARA SOLIDITY ===
params = {
    'highwayDistance': int(highway_distance * 1_000_000),
    'cityDistance': int(city_distance * 1_000_000),
    'ethanolPercent': int(ethanol_percent * 1_000_000),
    'roadGasoline': int(road_gasoline * 1_000_000),
    'roadEthanol': int(road_ethanol * 1_000_000) if road_ethanol > 0 else int(11.3 * 1_000_000),  # Fallback
    'cityGasoline': int(city_gasoline * 1_000_000),
    'cityEthanol': int(city_ethanol * 1_000_000) if city_ethanol > 0 else int(10.3 * 1_000_000),  # Fallback
    'realCO2Emissions': int(real_co2_emissions * 1_000_000),
    'carbonPricePerTon': int(CARBON_PRICE_PER_TON * 1_000_000)
}

print(f"\n🚀 Criando NFT E1 no contrato...")

tx = contract.functions.calculateAndMint(
    tuple(params.values()),
    account.address
).build_transaction({
    'from': account.address,
    'nonce': w3.eth.get_transaction_count(account.address),
    'gas': 500000,
    'gasPrice': w3.eth.gas_price,
})

signed_tx = w3.eth.account.sign_transaction(tx, private_key)
tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)

print(f"   ⏳ Aguardando confirmação... (tx: {tx_hash.hex()[:10]}...)")

receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

if receipt['status'] == 1:
    print(f"   ✅ NFT criado com sucesso!")
    
    # Buscar detalhes
    balance = contract.functions.balanceOf(account.address).call()
    token_id = contract.functions.tokenOfOwnerByIndex(account.address, balance - 1).call()
    
    print(f"   🎨 Token ID: {token_id}")
    
    details = contract.functions.getCalculationDetails(token_id).call()
    
    tanque_sol = details[0] / 1_000_000
    parte1_sol = details[1] / 1_000_000
    parte2_sol = details[2] / 1_000_000
    meta_co2_sol = details[3] / 1_000_000
    diff_sol = details[4] / 1_000_000
    e1_sol = details[5] / 1_000_000
    total_dist = details[6] / 1_000_000
    
    print(f"\n🔗 RESULTADOS SOLIDITY:")
    print(f"   Tanque Gasolina: {tanque_sol:.2f}%")
    print(f"   Parte 1 (rodovia): {parte1_sol:.2f} g CO2")
    print(f"   Parte 2 (cidade): {parte2_sol:.2f} g CO2")
    print(f"   Meta CO2: {meta_co2_sol:.2f} g")
    print(f"   Diff (economia): {diff_sol:.2f} g")
    print(f"   💰 E1: R$ {e1_sol:.6f}")
    print(f"   📏 Total Distance: {total_dist:.2f} km")
    
    print(f"\n{'='*60}")
    print("📊 COMPARAÇÃO PYTHON vs SOLIDITY")
    print(f"{'='*60}")
    
    print(f"\n{'Métrica':<20} {'Python':<15} {'Solidity':<15} {'Diff %':<10}")
    print(f"{'-'*60}")
    
    def compare(name, py_val, sol_val):
        diff = abs(py_val - sol_val) / py_val * 100 if py_val > 0 else 0
        print(f"{name:<20} {py_val:>14.2f} {sol_val:>14.2f} {diff:>9.4f}%")
    
    compare("Tanque Gasolina", tanque_gasoline, tanque_sol)
    compare("Parte 1 (g)", parte1_python, parte1_sol)
    compare("Parte 2 (g)", parte2_python, parte2_sol)
    compare("Meta CO2 (g)", meta_co2_python, meta_co2_sol)
    compare("Diff (g)", diff_python, diff_sol)
    compare("E1 (BRL)", e1_python, e1_sol)
    
    e1_diff = abs(e1_python - e1_sol) / e1_python * 100 if e1_python > 0 else 0
    
    print(f"\n{'='*60}")
    if e1_diff < 0.1:
        print("✅ RESULTADO: Excelente! Diferença < 0.1%")
    elif e1_diff < 1.0:
        print("✅ RESULTADO: Bom! Diferença < 1.0%")
    else:
        print("⚠️  RESULTADO: Atenção! Diferença > 1.0%")
    print(f"{'='*60}")
    
else:
    print(f"   ❌ Transação falhou")

print(f"\n🎉 Teste concluído!")
print(f"\n💡 Para processar todos os registros, execute: python3 4_send_data_E1.py")
