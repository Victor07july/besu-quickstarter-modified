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

# === VALORES PYTHON (do CSV primeira linha) ===
print("\n" + "="*60)
print("VALORES DO PYTHON (CarbonCreditNFT_e2.py)")
print("="*60)

# Constantes
MJ_kWh = 0.2778
gasoline_MJ = 29.5
etanol_MJ = 21.3
preco_tarifa = 0.774

# Dados da primeira linha
highway_distance = 1.807029  # highway (distance)
city_distance = 4.122286     # city (distance)
ethanol_percent = 0.0
road_gasoline = 11.3
road_ethanol = 9.5
city_gasoline = 10.3
city_ethanol = 8.0
behavior_cautious = 59.238095
behavior_normal = 9.904762
behavior_aggressive = 30.857143

# Cálculos Python
tanque_gasoline = 100 - ethanol_percent
convert_gasoline = (MJ_kWh * gasoline_MJ * preco_tarifa * (tanque_gasoline / 100.0))
convert_etanol = (MJ_kWh * etanol_MJ * preco_tarifa * (1 - (tanque_gasoline / 100.0)))

valores_estrada = ((convert_gasoline / road_gasoline) + (convert_etanol / road_ethanol if road_ethanol > 0 else 0)) * highway_distance
valores_cidade = ((convert_gasoline / city_gasoline) + (convert_etanol / city_ethanol if city_ethanol > 0 else 0)) * city_distance

prop_bonus = (behavior_cautious / 100.0) * 0.05 + (behavior_normal / 100.0) * 0.02 + (behavior_aggressive / 100.0) * 0.005

e2_python = prop_bonus * (valores_estrada + valores_cidade)

print(f"Tanque Gasoline: {tanque_gasoline}%")
print(f"Convert Gasoline: {convert_gasoline:.6f} R$/km")
print(f"Convert Etanol: {convert_etanol:.6f} R$/km")
print(f"Valores Estrada: R$ {valores_estrada:.6f}")
print(f"Valores Cidade: R$ {valores_cidade:.6f}")
print(f"Prop Bonus: {prop_bonus:.6f}")
print(f"E2 PYTHON: R$ {e2_python:.6f}")

# === VALORES SOLIDITY ===
print("\n" + "="*60)
print("VALORES DO SOLIDITY (simulateE2Calculation)")
print("="*60)

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

print(f"\nParâmetros enviados ao contrato (valores * 1e6):")
for key, value in params.items():
    print(f"   {key}: {value}")

# Chamar simulação
result = contract.functions.simulateE2Calculation(tuple(params.values())).call()

# Resultado é uma tupla: CalculationResult
# (tanqueGasoline, dtEstradaGasolina, dtEstradaEtanol, dfEstrada, 
#  dtCidadeGasolina, dtCidadeEtanol, dfCidade, propBonus, e2Final, totalDistance)

print(f"\nResultado do Solidity (valores brutos * 1e6):")
print(f"   tanqueGasoline: {result[0]}")
print(f"   dtEstradaGasolina: {result[1]}")
print(f"   dtEstradaEtanol: {result[2]}")
print(f"   dfEstrada: {result[3]}")
print(f"   dtCidadeGasolina: {result[4]}")
print(f"   dtCidadeEtanol: {result[5]}")
print(f"   dfCidade: {result[6]}")
print(f"   propBonus: {result[7]}")
print(f"   e2Final: {result[8]}")
print(f"   totalDistance: {result[9]}")

print(f"\nResultado do Solidity (valores reais / 1e6):")
print(f"   tanqueGasoline: {result[0] / 1e6:.2f}%")
print(f"   dtEstradaGasolina: R$ {result[1] / 1e6:.6f}")
print(f"   dtEstradaEtanol: R$ {result[2] / 1e6:.6f}")
print(f"   dfEstrada: R$ {result[3] / 1e6:.6f}")
print(f"   dtCidadeGasolina: R$ {result[4] / 1e6:.6f}")
print(f"   dtCidadeEtanol: R$ {result[5] / 1e6:.6f}")
print(f"   dfCidade: R$ {result[6] / 1e6:.6f}")
print(f"   propBonus: {result[7] / 1e6:.6f}")
print(f"   E2 SOLIDITY: R$ {result[8] / 1e6:.6f}")
print(f"   totalDistance: {result[9] / 1e6:.2f} km")

# === COMPARAÇÃO ===
print("\n" + "="*60)
print("COMPARAÇÃO")
print("="*60)
print(f"E2 Python:   R$ {e2_python:.6f}")
print(f"E2 Solidity: R$ {result[8] / 1e6:.6f}")
print(f"Diferença:   R$ {abs(e2_python - (result[8] / 1e6)):.6f}")
print(f"Erro %:      {abs(e2_python - (result[8] / 1e6)) / e2_python * 100:.2f}%")
