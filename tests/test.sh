#!/bin/bash
# Exemplos cURL para testar a API do Sistema de Locação
# Base URL: http://127.0.0.1:5001/slmg-es/us-central1/api

BASE_URL="http://127.0.0.1:5001/slmg-es/us-central1/api"

echo "=== TESTANDO API DO SISTEMA DE LOCAÇÃO ==="

# ========================================
# CLIENTES
# ========================================

echo "‍ 1. CRIANDO CLIENTE..."
curl -X POST "$BASE_URL/clientes" \
  -H "Content-Type: application/json" \
  -d '{
    "cpf": "12345678901",
    "dadosPessoais": {
      "nome": "João Silva Santos",
      "dataNascimento": "1985-03-15"
    },
    "endereco": {
      "cep": "01234567",
      "rua": "Rua das Flores, 123",
      "numero": "123",
      "bairro": "Centro",
      "cidade": "São Paulo",
      "estado": "SP"
    },
    "contato": {
      "email": "joao.silva@email.com",
      "telefone": "11987654321"
    },
    "documentos": {
      "cnh": {
        "numero": "12345678901",
        "categoria": "AB",
        "dataValidade": "2025-12-31"
      }
    }
  }'

echo -e "\n\n 2. BUSCANDO CLIENTE CRIADO..."
curl -X GET "$BASE_URL/clientes/12345678901?incluirSubcolecoes=true"

echo -e "\n\n 3. VERIFICANDO ELEGIBILIDADE..."
curl -X GET "$BASE_URL/clientes/12345678901/elegibilidade"

echo -e "\n\n 4. LISTANDO CLIENTES..."
curl -X GET "$BASE_URL/clientes?limite=5&incluirSubcolecoes=false"

# ========================================
# VEÍCULOS
# ========================================

echo -e "\n\n 5. CRIANDO VEÍCULO..."
curl -X POST "$BASE_URL/veiculos" \
  -H "Content-Type: application/json" \
  -d '{
    "chassi": "9BWSU19F08B302158",
    "placa": "ABC1234",
    "modelo": "Civic",
    "marca": "Honda",
    "renavam": "12345678901",
    "numeroDocumento": "DOC123456",
    "anoFabricacao": 2020,
    "anoModelo": 2021,
    "quilometragem": 15000,
    "quilometragemNaCompra": 0,
    "dataCompra": "2020-01-15",
    "local": "Concessionária ABC",
    "nome": "Civic EX",
    "observacoes": "Veículo em excelente estado"
  }'

echo -e "\n\n 6. BUSCANDO VEÍCULO POR CHASSI..."
curl -X GET "$BASE_URL/veiculos/chassi/9BWSU19F08B302158"

echo -e "\n\n 7. CONSULTANDO QUILOMETRAGEM..."
curl -X GET "$BASE_URL/veiculos/9BWSU19F08B302158/quilometragem"

echo -e "\n\n 8. LISTANDO VEÍCULOS DISPONÍVEIS..."
curl -X GET "$BASE_URL/veiculos/disponiveis"

# ========================================
# LOCAÇÕES
# ========================================

echo -e "\n\n 9. CRIANDO LOCAÇÃO..."
LOCACAO_RESPONSE=$(curl -s -X POST "$BASE_URL/locacoes" \
  -H "Content-Type: application/json" \
  -d '{
    "cpfLocatario": "12345678901",
    "placaVeiculo": "ABC1234",
    "dataInicio": "15/12/2024",
    "dataFim": "22/12/2024",
    "valor": 350.00,
    "servicosAdicionaisIds": ["GPS", "CADEIRINHA"]
  }')

echo "$LOCACAO_RESPONSE"

# Extrair ID da locação da resposta (assumindo que o JSON contém o ID)
LOCACAO_ID=$(echo "$LOCACAO_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$LOCACAO_ID" ]; then
  echo -e "\n\n 10. BUSCANDO LOCAÇÃO CRIADA (ID: $LOCACAO_ID)..."
  curl -X GET "$BASE_URL/locacoes/$LOCACAO_ID"
  
  echo -e "\n\n 11. FINALIZANDO LOCAÇÃO..."
  curl -X PATCH "$BASE_URL/locacoes/$LOCACAO_ID/status" \
    -H "Content-Type: application/json" \
    -d '{"status": "concluida"}'
else
  echo -e "\n\n Não foi possível extrair o ID da locação"
fi

echo -e "\n\n 12. LISTANDO TODAS AS LOCAÇÕES..."
curl -X GET "$BASE_URL/locacoes?limite=10"

echo -e "\n\n 13. HISTÓRICO DE LOCAÇÕES DO CLIENTE..."
curl -X GET "$BASE_URL/locacoes/cliente/12345678901"

# ========================================
# ATUALIZAÇÕES
# ========================================

echo -e "\n\n 14. ATUALIZANDO QUILOMETRAGEM DO VEÍCULO..."
curl -X PATCH "$BASE_URL/veiculos/9BWSU19F08B302158/quilometragem" \
  -H "Content-Type: application/json" \
  -d '{"quilometragem": 16000}'

echo -e "\n\n 15. ATUALIZANDO DADOS DO CLIENTE..."
curl -X PUT "$BASE_URL/clientes/12345678901" \
  -H "Content-Type: application/json" \
  -d '{
    "contato": {
      "telefone": "11999887766"
    }
  }'

# ========================================
# RELATÓRIOS
# ========================================

echo -e "\n\n 16. GERANDO RELATÓRIO DA FROTA..."
curl -X GET "$BASE_URL/veiculos/relatorio"

echo -e "\n\n TESTES CONCLUÍDOS!"

# ========================================
# TESTES DE ERRO (OPCIONAIS)
# ========================================

echo -e "\n\n TESTES DE ERRO:"

echo -e "\n17. Tentando criar cliente com CPF duplicado..."
curl -X POST "$BASE_URL/clientes" \
  -H "Content-Type: application/json" \
  -d '{
    "cpf": "12345678901",
    "dadosPessoais": {"nome": "Outro Cliente"},
    "endereco": {"cep": "12345678", "rua": "Rua X", "numero": "1", "bairro": "B", "cidade": "C", "estado": "SP"},
    "contato": {"email": "outro@email.com"}
  }'

echo -e "\n\n18. Tentando buscar cliente inexistente..."
curl -X GET "$BASE_URL/clientes/99999999999"

echo -e "\n\n19. Tentando criar locação com dados inválidos..."
curl -X POST "$BASE_URL/locacoes" \
  -H "Content-Type: application/json" \
  -d '{
    "cpfLocatario": "99999999999",
    "placaVeiculo": "XXX9999",
    "dataInicio": "15/12/2024",
    "dataFim": "22/12/2024",
    "valor": 350.00
  }'

echo -e "\n\n SCRIPT DE TESTE FINALIZADO!"
echo "Para executar este script:"
echo "1. Salve como 'test_api.sh'"
echo "2. Execute: chmod +x test_api.sh"
echo "3. Execute: ./test_api.sh"