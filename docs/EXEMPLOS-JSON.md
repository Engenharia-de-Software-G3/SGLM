# Exemplos de Teste para API - Sistema de Locação

Base URL: `http://127.0.0.1:5001/slmg-es/us-central1/api`

## 📋 CLIENTES

### 1. Criar Cliente
**POST** `/clientes`
```json
{
  "cpf": "08832661489",
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
}
```

### 2. Criar Cliente Pessoa Jurídica (exemplo alternativo)
**POST** `/clientes`
```json
{
  "cnpj": "42591651000143",
  "dadosPessoais": {
    "nome": "Maria Oliveira Costa"
  },
  "endereco": {
    "cep": "04567890",
    "rua": "Avenida Paulista",
    "numero": "1000",
    "bairro": "Bela Vista",
    "cidade": "São Paulo",
    "estado": "SP"
  },
  "contato": {
    "email": "maria.costa@empresa.com",
    "telefone": "11912345678"
  }
}
```

### 3. Listar Clientes
**GET** `/clientes?limite=10&incluirSubcolecoes=true`

### 4. Listar Clientes com Filtros
**GET** `/clientes?limite=5&filtros={"status":"ativo"}&incluirSubcolecoes=false`

### 5. Buscar Cliente por CPF
**GET** `/clientes/08832661489?incluirSubcolecoes=true`

### 6. Buscar Clientes por Nome
**GET** `/clientes/buscar-nome?nome=João&limite=5`

### 7. Verificar Elegibilidade para Locação
**GET** `/clientes/08832661489/elegibilidade`

### 8. Atualizar Cliente
**PUT** `/clientes/08832661489`
```json
{
  "dadosPessoais": {
    "nome": "João Silva Santos Júnior"
  },
  "contato": {
    "telefone": "11999887766",
    "email": "joao.junior@newemail.com"
  },
  "endereco": {
    "numero": "456",
    "bairro": "Vila Nova"
  }
}
```

### 9. Alterar Status do Cliente
**PATCH** `/clientes/08832661489/status`
```json
{
  "status": "bloqueado"
}
```

### 10. Excluir Cliente (Soft Delete)
**DELETE** `/clientes/08832661489?exclusaoCompleta=false`

### 11. Excluir Cliente (Hard Delete)
**DELETE** `/clientes/08832661489?exclusaoCompleta=true`

---

## 🚗 VEÍCULOS

### 1. Criar Veículo
**POST** `/veiculos`
```json
{
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
  "observacoes": "Veículo em excelente estado, revisões em dia"
}
```

### 2. Criar Segundo Veículo (para testes)
**POST** `/veiculos`
```json
{
  "chassi": "9BWSU19F08B302159",
  "placa": "DEF5678",
  "modelo": "Corolla",
  "marca": "Toyota",
  "renavam": "10987654321",
  "numeroDocumento": "DOC789012",
  "anoFabricacao": 2019,
  "anoModelo": 2019,
  "quilometragem": 25000,
  "quilometragemNaCompra": 5000,
  "dataCompra": "2019-06-20",
  "local": "Loja XYZ",
  "nome": "Corolla GLI",
  "observacoes": "Carro popular, baixo consumo"
}
```

### 3. Criar Veículo Placa Mercosul
**POST** `/veiculos`
```json
{
  "chassi": "9BWSU19F08B302160",
  "placa": "BRA2E19",
  "modelo": "HB20",
  "marca": "Hyundai",
  "renavam": "11122334455",
  "anoFabricacao": 2022,
  "anoModelo": 2022,
  "quilometragem": 8000,
  "quilometragemNaCompra": 0,
  "dataCompra": "2022-03-10"
}
```

### 4. Listar Veículos
**GET** `/veiculos?limite=10&incluirEstatisticas=true`

### 5. Listar Veículos com Filtros
**GET** `/veiculos?filtros={"marca":"Honda","status":"disponivel"}&incluirEstatisticas=false`

### 6. Listar Apenas Veículos Disponíveis
**GET** `/veiculos/disponiveis?filtros={"marca":"Toyota"}`

### 7. Gerar Relatório da Frota
**GET** `/veiculos/relatorio`

### 8. Buscar Veículo por Chassi
**GET** `/veiculos/chassi/9BWSU19F08B302158`

### 9. Buscar Veículo por Placa
**GET** `/veiculos/placa/ABC1234`

### 10. Consultar Quilometragem
**GET** `/veiculos/9BWSU19F08B302158/quilometragem`

### 11. Atualizar Veículo (Geral)
**PUT** `/veiculos/9BWSU19F08B302158`
```json
{
  "local": "Garagem Central",
  "nome": "Civic EX Premium",
  "observacoes": "Veículo com kit multimídia instalado",
  "quilometragem": 16500
}
```

### 12. Atualizar Placa
**PATCH** `/veiculos/9BWSU19F08B302158/placa`
```json
{
  "placa": "ABC9999"
}
```

### 13. Atualizar Quilometragem
**PATCH** `/veiculos/9BWSU19F08B302158/quilometragem`
```json
{
  "quilometragem": 17000
}
```

### 14. Alterar Status
**PATCH** `/veiculos/9BWSU19F08B302158/status`
```json
{
  "status": "manutencao"
}
```

### 15. Registrar Venda
**POST** `/veiculos/9BWSU19F08B302159/venda`
```json
{
  "dataVenda": "2024-12-01",
  "observacoes": "Vendido para cliente particular, valor R$ 45.000"
}
```

### 16. Excluir Veículo (Soft Delete)
**DELETE** `/veiculos/9BWSU19F08B302160?exclusaoFisica=false`

### 17. Excluir Veículo (Hard Delete)
**DELETE** `/veiculos/9BWSU19F08B302160?exclusaoFisica=true`

---

## 📋 LOCAÇÕES

### 1. Criar Locação
**POST** `/locacoes`
```json
{
  "cpfLocatario": "08832661489",
  "placaVeiculo": "BRA2E19",
  "dataInicio": "15/12/2024",
  "dataFim": "22/12/2024",
  "valor": 350.00,
  "servicosAdicionaisIds": ["GPS", "CADEIRINHA"]
}
```

### 2. Criar Segunda Locação (Assumindo que eles foram adicionados)
**POST** `/locacoes`
```json
{
  "cpfLocatario": "12345678901",
  "placaVeiculo": "BRA2E19",
  "dataInicio": "01/01/2025",
  "dataFim": "07/01/2025",
  "valor": 420.00,
  "servicosAdicionaisIds": ["SEGURO_PREMIUM"]
}
```

### 3. Listar Locações
**GET** `/locacoes?limite=10`

### 4. Listar Locações com Filtros
**GET** `/locacoes?filtros={"status":"ativa"}&limite=5`

### 5. Buscar Locação por ID
**GET** `/locacoes/{ID_DA_LOCACAO}`
*Substitua {ID_DA_LOCACAO} pelo ID retornado na criação*

### 6. Histórico de Locações por Cliente
**GET** `/locacoes/cliente/12345678901`

### 7. Histórico de Locações por Veículo
**GET** `/locacoes/veiculo/9BWSU19F08B302158`

### 8. Atualizar Locação
**PUT** `/locacoes/{ID_DA_LOCACAO}`
```json
{
  "dataFim": "25/12/2024",
  "valor": 450.00,
  "servicosAdicionaisIds": ["GPS", "CADEIRINHA", "SEGURO_PREMIUM"]
}
```

### 9. Alterar Status da Locação
**PATCH** `/locacoes/{ID_DA_LOCACAO}/status`
```json
{
  "status": "concluida"
}
```

### 10. Cancelar Locação
**PATCH** `/locacoes/{ID_DA_LOCACAO}/status`
```json
{
  "status": "cancelada"
}
```

### 11. Excluir Locação
**DELETE** `/locacoes/{ID_DA_LOCACAO}`
