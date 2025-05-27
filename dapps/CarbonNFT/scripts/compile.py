from solcx import compile_standard, install_solc
import json
import os

# Instala o compilador solc 0.8.0, se ainda não estiver instalado
install_solc('0.8.20')

# Caminho para o contrato
solidity_file = "../contracts/CarbonCredit.sol"
output_file = "../contracts/CarbonCredit.json"

# Ler o código do contrato
with open(solidity_file, "r") as f:
    source_code = f.read()

node_modules_path = os.path.abspath("../node_modules")

# Compilar
compiled = compile_standard({
    "language": "Solidity",
    "sources": {
        solidity_file: {
            "content": source_code
        }
    },
    "settings": {
        "outputSelection": {
            "*": {
                "*": ["abi", "evm.bytecode", "evm.sourceMap"]
            }
        },
    "remappings": [
        
            "@openzeppelin/=/home/icto/besu-quickstarter-modified/dapps/carbonCredit/node_modules/@openzeppelin/"
        ]
    }
    
}, 
allow_paths=".,../node_modules",
solc_version="0.8.20")

# Salvar resultado no JSON
with open(output_file, "w") as f:
    json.dump(compiled, f, indent=2)

print(f"Contrato compilado com sucesso! ABI e bytecode salvos em {output_file}")
