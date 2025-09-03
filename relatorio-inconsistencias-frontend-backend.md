# Relatório de Inconsistências - Frontend vs Backend (SGLM)

Foram identificadas **inconsistências críticas** entre o frontend e backend do projeto SGLM, especialmente no módulo de clientes. Os principais problemas incluem estruturas de dados incompatíveis, mapeamentos incorretos de dados e uso inadequado de endpoints.

---

## **INCONSISTÊNCIAS CRÍTICAS**

### 1. **MÓDULO CLIENTES - Problemas Graves**

#### **1.1 Estrutura de Dados Incompatível**

**Problema**: O frontend usa uma estrutura de dados completamente diferente do backend.

**Frontend** (`src/services/client/types.d.ts:1-13`):
```typescript
interface ClientData {
  id: number;           // ERRO: Backend usa string
  cpf: string;
  nomeCompleto: string; // ERRO: Backend espera dadosPessoais.nome
  email?: string;       // ERRO: Backend espera contato.email
  telefone?: string;    // ERRO: Backend espera contato.telefone
  endereco?: string;    // ERRO: Backend espera objeto estruturado
  rg?: string;         // ERRO: Backend espera documentos.cnh
}
```

**Backend** (`functions/cliente.js:36-40`):
```javascript
// Espera estrutura aninhada:
{
  cpf: "string",
  dadosPessoais: { nome, dataNascimento },
  endereco: { cep, rua, numero, bairro, cidade, estado },
  contato: { email, telefone },
  documentos: { cnh: { numero, categoria, dataValidade } }
}
```

#### **1.2 Função de Atualização Completamente Quebrada**

**Problema Crítico**: `updateClientFunction` (`src/services/client/functions.tsx:51-88`) envia dados incorretos.

```typescript
const send = {
  cpf: '',                    // ERRO: Sempre vazio!
  dadosPessoais: {
    nome: payload.nomeCompleto || '',
    dataNascimento: formatDateToServer(''), // ERRO: Sempre vazio!
  },
  endereco: {
    cep: payload.endereco || '',     // ERRO: endereco é string, não objeto
    rua: payload.endereco || '',     // ERRO: Todos os campos recebem o mesmo valor
    numero: payload.endereco || '',  // ERRO: Impossível funcionar
    bairro: payload.endereco || '',
    cidade: payload.endereco || '',
    estado: payload.endereco || '',
  },
  contato: {
    email: payload.email,
    telefone: payload.telefone,
  },
  documentos: {
    cnh: {
      numero: payload.rg || '',           // ERRO: RG no campo de CNH!
      categoria: payload.rg || '',        // ERRO: Completamente errado
      dataValidade: formatDateToServer(payload.rg || ''), // ERRO: Data inválida
      tipo: payload.rg || '',
    },
  },
};
```

#### **1.3 Uso Incorreto de Endpoint**

**Problema**: `getClientByCpf` (`src/services/client/functions.tsx:100-138`) usa endpoint genérico com filtros em vez do endpoint específico.

```typescript
// ATUAL - Ineficiente e complexo
const response = await api.get('/clientes', {
  params: { filtros: JSON.stringify({ cpf: cleanCpf }) }
});

// DEVERIA SER - Direto e simples
const response = await api.get(`/clientes/${cleanCpf}`);
```

### 2. **TIPOS DUPLICADOS E CONFLITANTES**

**Problema**: `types.d.ts` tem interfaces duplicadas com definições diferentes.

- `CreateClientInterface` definida 2x (linhas 15-26 e 59-95)
- `UpdateClientInterface` definida 2x (linhas 28-38 e 97-107) 
- `SingleClientResponse` definida 2x (linhas 40-52 e 109-140)
- `ListManyClientsResponse` definida 2x (linhas 54-57 e 142-145)

### 3. **INCONSISTÊNCIAS DE VALIDAÇÃO**

#### **3.1 Validação de CPF**
- **Backend**: Aceita CPF formatado, faz limpeza automática (`functions/cliente.js:43-47`)
- **Frontend**: Remove formatação antes de enviar (`src/services/client/functions.tsx:104`)
- **Inconsistência**: Duplicação de lógica de limpeza

#### **3.2 Campos Obrigatórios**
- **Backend**: CPF e dadosPessoais obrigatórios
- **Frontend**: Não reflete essas validações nos tipos

---

## **OUTROS MÓDULOS - Análise Rápida**

### **VEÍCULOS**
- Estrutura de dados parece mais alinhada
- Possíveis inconsistências menores em campos opcionais

### **LOCAÇÕES**  
- Formatos de data podem ser inconsistentes
- Backend espera DD/MM/YYYY, frontend pode enviar outros formatos

### **MANUTENÇÕES**
- Estrutura básica alinhada
- Validações parecem consistentes

---

## **SOLUÇÕES RECOMENDADAS**

### **PRIORIDADE MÁXIMA - Clientes**

1. **Corrigir `updateClientFunction`**:
   - Mapear corretamente campos do payload
   - Implementar conversão adequada de endereco string → objeto
   - Separar dados de RG de dados de CNH

2. **Unificar tipos TypeScript**:
   - Remover duplicações
   - Alinhar interfaces com estrutura do backend
   - Criar tipos específicos para request/response

3. **Usar endpoint correto**:
   - Alterar `getClientByCpf` para usar `/clientes/:cpf`

### **PRIORIDADE ALTA - Geral**

4. **Padronizar validações**:
   - Centralizar lógica de formatação/limpeza
   - Alinhar regras de validação entre front/back

5. **Documentar contratos**:
   - Criar documentação clara dos endpoints
   - Definir formato padrão de datas/números

---

## **IMPACTO**

- **Funcionalidade**: Atualização de clientes **NÃO FUNCIONA**
- **Performance**: Busca por CPF ineficiente
- **Manutenibilidade**: Código confuso e duplicado
- **Confiabilidade**: Dados inconsistentes entre front/back

---

## **DETALHES TÉCNICOS DA API BACKEND**

### **Endpoints Analisados**

#### **CLIENTES** (`/clientes`)
- `POST /clientes` - Criar cliente
- `GET /clientes` - Listar com paginação e filtros
- `GET /clientes/:cpf` - Buscar por CPF específico
- `PUT /clientes/:cpf` - Atualizar cliente
- `DELETE /clientes/:cpf` - Remover cliente

#### **VEÍCULOS** (`/veiculos`)
- `POST /veiculos` - Criar veículo
- `GET /veiculos` - Listar com paginação
- `GET /veiculos/:id` - Buscar por ID
- `PUT /veiculos/:id` - Atualizar veículo
- `DELETE /veiculos/:id` - Remover veículo

#### **LOCAÇÕES** (`/locacoes`)
- `POST /locacoes` - Criar locação
- `GET /locacoes` - Listar locações
- `GET /locacoes/:id` - Buscar por ID
- `PUT /locacoes/:id` - Atualizar locação
- `DELETE /locacoes/:id` - Remover locação

#### **MANUTENÇÕES** (`/manutencoes`)
- `POST /manutencoes` - Criar manutenção
- `GET /manutencoes` - Listar todas
- `GET /manutencoes/:veiculoId` - Por veículo
- `DELETE /manutencoes/:id` - Remover manutenção

#### **CONTRATOS** (`/contratos`)
- `POST /contratos` - Criar contrato
- `GET /contratos/:id` - Buscar por ID

#### **FORNECEDORES** (`/fornecedores`)
- `POST /fornecedores` - Criar fornecedor
- `GET /fornecedores` - **Não implementado**

#### **VISTORIAS** (`/vistorias`)
- `POST /vistorias` - Criar vistoria
- `GET /vistorias` - **Não implementado**

---

## **ESTRUTURA ESPERADA PELO BACKEND**

### **Cliente Completo**
```json
{
  "cpf": "12345678901",
  "dadosPessoais": {
    "nome": "João Silva",
    "dataNascimento": "1990-01-01"
  },
  "endereco": {
    "cep": "12345-678",
    "rua": "Rua das Flores",
    "numero": "123",
    "bairro": "Centro",
    "cidade": "São Paulo",
    "estado": "SP"
  },
  "contato": {
    "email": "joao@email.com",
    "telefone": "(11) 99999-9999"
  },
  "documentos": {
    "cnh": {
      "numero": "123456789",
      "categoria": "AB",
      "dataValidade": "2025-12-31",
      "tipo": "Digital"
    }
  },
  "dadosBancarios": {
    "banco": "001",
    "agencia": "1234",
    "conta": "12345-6"
  }
}
```

### **Veículo Completo**
```json
{
  "chassi": "ABC123DEF456789",
  "placa": "ABC-1234",
  "modelo": "Honda CG 160",
  "marca": "Honda",
  "cor": "Vermelha",
  "renavam": "123456789",
  "anoModelo": {
    "fabricacao": 2023,
    "modelo": 2024
  },
  "quilometragem": 1500
}
```

---

## **AÇÕES IMEDIATAS NECESSÁRIAS**

### **Crítico - Deve ser corrigido Urgentemente**
1. Função `updateClientFunction` não funciona
2. Tipos TypeScript duplicados causam confusão

### **Importante - Seria interessante corrigir**
3. Otimizar `getClientByCpf` para usar endpoint direto
4. Padronizar validações de CPF
5. Documentar contratos de API