#!/usr/bin/env python3
"""
Script de teste para verificar se as colunas criadas estão corretas
Compara com o código Python original
"""

import csv

# Arrays do código Python original
city_gasoline_array = [10.3, 10.3, 10.3, 10.3, 12.15, 12.15, 12.15, 12.15, 12.6, 12.6, 12.6, 12.6, 11.8, 12.83, 12.83, 12.83, 12.83, 11.6, 11.6, 11.6, 11.6, 11.6, 11.6, 11.6, 11.6, 11.6, 11.6, 11.6, 11.6, 11.6, 11.6, 12.0, 12.0]
road_gasoline_array = [11.3, 11.3, 11.3, 11.3, 13.65, 13.65, 13.65, 13.65, 13.9, 13.9, 13.9, 13.9, 13.3, 14.44, 14.44, 14.44, 14.44, 14.1, 14.1, 14.1, 14.1, 14.1, 14.1, 14.1, 14.1, 14.1, 14.1, 14.1, 14.1, 14.1, 14.1, 14.4, 14.4]
city_ethanol_array  = [0, 0, 0, 0, 8.2, 8.2, 8.2, 8.2, 8.9, 8.9, 8.9, 8.9, 8.1, 9.11, 9.11, 9.11, 9.11, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8.3, 8.3]
road_ethanol_array  = [0, 0, 0, 0, 9.5, 9.5, 9.5, 9.5, 9.8, 9.8, 9.8, 9.8, 9.2, 10.26, 10.26, 10.26, 10.26, 9.8, 9.8, 9.8, 9.8, 9.8, 9.8, 9.8, 9.8, 9.8, 9.8, 9.8, 9.8, 9.8, 9.8, 10.0, 10.0]

# Ler CSV
csv_path = "data/dados_gas.csv"
with open(csv_path, 'r', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    data = list(reader)

print("="*70)
print("VERIFICAÇÃO DAS COLUNAS CRIADAS")
print("="*70)
print(f"\nTotal de registros no CSV: {len(data)}")
print(f"Total de eficiências no array: {len(city_gasoline_array)}")
print()

# Verificar cada registro
print("📋 Primeiros 10 registros:\n")
print(f"{'#':<4} {'Modelo':<20} {'City Gas':<10} {'Road Gas':<10} {'City Eth':<10} {'Road Eth':<10}")
print("-"*70)

for idx in range(min(10, len(data))):
    row = data[idx]
    modelo = f"{row['model']}"[:18]
    
    city_gas = city_gasoline_array[idx]
    road_gas = road_gasoline_array[idx]
    city_eth = city_ethanol_array[idx]
    road_eth = road_ethanol_array[idx]
    
    print(f"{idx+1:<4} {modelo:<20} {city_gas:<10.2f} {road_gas:<10.2f} {city_eth:<10.2f} {road_eth:<10.2f}")

print()
print("="*70)
print("MAPEAMENTO POR MARCA/MODELO")
print("="*70)
print()

# Agrupar por modelo
modelos = {}
for idx, row in enumerate(data):
    key = f"{row['brand']} {row['model']}"
    if key not in modelos:
        modelos[key] = {
            'city_gas': city_gasoline_array[idx],
            'road_gas': road_gasoline_array[idx],
            'city_eth': city_ethanol_array[idx],
            'road_eth': road_ethanol_array[idx],
            'count': 0
        }
    modelos[key]['count'] += 1

for modelo, efic in sorted(modelos.items()):
    print(f"🚗 {modelo}")
    print(f"   City Gasoline:  {efic['city_gas']:.2f} km/L")
    print(f"   Road Gasoline:  {efic['road_gas']:.2f} km/L")
    print(f"   City Ethanol:   {efic['city_eth']:.2f} km/L")
    print(f"   Road Ethanol:   {efic['road_eth']:.2f} km/L")
    print(f"   Registros:      {efic['count']}")
    print()

print("="*70)
print("✅ Verificação completa!")
print("="*70)
