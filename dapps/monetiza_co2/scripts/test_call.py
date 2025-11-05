import json
from web3 import Web3
from eth_account import Account

# Carregar configurações
with open("keys.json") as f:
    keys = json.load(f)

rpc_url = keys['besu']['rpcnode']['url']
private_key = "0x60bbe10a196a4e71451c0f6e9ec9beab454c2a5ac0542aa5b8b733ff5719fec3"
account = Account.from_key(private_key)

# Conectar
w3 = Web3(Web3.HTTPProvider(rpc_url))
print(f"✅ Conectado: {w3.is_connected()}")

# Carregar contrato
with open("contract_address.txt") as f:
    contract_address = f.read().strip()

with open("../contracts/CarbonCreditNFT_E2.json") as f:
    contract_json = json.load(f)
    abi = contract_json['contracts']['../contracts/CarbonCreditNFT_E2.sol']['CarbonCreditNFT_E2Calculator']["abi"]

contract = w3.eth.contract(address=contract_address, abi=abi)

# Dados de teste do primeiro registro
highway_distance = 2.9646577097800636
city_distance = 2.9646577097800636
ethanol_percent = 0.0
road_gasoline = 11.3
road_ethanol = 9.5
city_gasoline = 10.3
city_ethanol = 8.0
behavior_cautious = 67.0
behavior_normal = 22.0
behavior_aggressive = 11.0

params = {
    'highwayDistance': int(highway_distance * 1_000_000),
    'cityDistance': int(city_distance * 1_000_000),
    'ethanolPercent': int(ethanol_percent * 1_000_000),
    'roadGasoline': int(road_gasoline * 1_000_000),
    'roadEthanol': int(road_ethanol * 1_000_000),
    'cityGasoline': int(city_gasoline * 1_000_000),
    'cityEthanol': int(city_ethanol * 1_000_000),
    'precoGasolina': 0,
    'precoEtanol': 0,
    'behaviorCautious': int(behavior_cautious * 1_000_000),
    'behaviorNormal': int(behavior_normal * 1_000_000),
    'behaviorAggressive': int(behavior_aggressive * 1_000_000)
}

print(f"\n📊 Parâmetros de teste:")
for key, value in params.items():
    print(f"   {key}: {value}")

# Tentar chamar simulateE2Calculation (não gasta gas, apenas simula)
try:
    print(f"\n🔍 Tentando simular cálculo...")
    result = contract.functions.simulateE2Calculation(tuple(params.values())).call()
    print(f"✅ Simulação funcionou!")
    print(f"   Resultado: {result}")
    print(f"   E2 (em R$): {result / 1_000_000:.6f}")
except Exception as e:
    print(f"❌ Erro na simulação: {str(e)}")
    import traceback
    traceback.print_exc()

# Tentar estimar gas para a transação real
try:
    print(f"\n⛽ Estimando gas para transação real...")
    gas_estimate = contract.functions.calculateE2AndTokenize(
        tuple(params.values()),
        account.address
    ).estimate_gas({'from': account.address})
    print(f"✅ Gas estimado: {gas_estimate}")
except Exception as e:
    print(f"❌ Erro ao estimar gas: {str(e)}")
    import traceback
    traceback.print_exc()
