# Changelog

## [0.1.0] - 05/08/2025

### Adicionado

#### Sistema de Validação e Formatação Centralizado
-   **Novo módulo `validators.js`** com sistema completo de validação e formatação.
    -   Validação completa de CPF com dígitos verificadores.
    -   Validação completa de CNPJ com dígitos verificadores.
    -   Validação de placas (formato antigo e Mercosul).
    -   Validação de datas com suporte a múltiplos formatos (DD/MM/YYYY, YYYY-MM-DD, ISO).
    -   Validação de email, telefone brasileiro e CEP.
    -   Formatadores para exibição de dados brasileiros (CPF, CNPJ, telefone, CEP, placa).
    -   Formatação de moeda, números e quilometragem.
    -   Sistema de limpeza de strings para busca (remoção de acentos).

#### Sistema de Tratamento de Erros
-   **Novo módulo `errorHandler.js`** com hierarquia de erros personalizada.
    -   Classe `BusinessError` para erros de regras de negócio.
    -   Classe `ValidationError` para erros de validação.
    -   Mapeamento automático de códigos de erro para status HTTP.
    -   Tratamento específico para erros do Firestore.
    -   Sistema de logs estruturados.

#### Constantes e Configurações
-   **Novo módulo `constants.js`** com centralização de constantes do sistema.
    -   Status válidos para clientes, veículos e locações.
    -   Nomes de coleções padronizados.
    -   Códigos de erro estruturados.
    -   Configurações de paginação e validação.

#### APIs Refatoradas - Clientes
-   Função `verificarElegibilidadeLocacao()` para validar aptidão para locação.
-   Função `alterarStatusCliente()` para gerenciar status independentemente.
-   Função `buscarClientesPorNome()` com busca flexível e tolerante a erros.
-   Suporte completo a subcoleções (endereços, contatos, documentos).
-   Soft delete com opção de exclusão física.
-   Validação de idade mínima (18 anos) e CNH válida.

#### APIs Refatoradas - Veículos
-   Função `listarVeiculosDisponiveis()` com filtros específicos.
-   Função `gerarRelatorioFrota()` com estatísticas completas.
-   Função `buscarPorPlaca()` para busca por placa.
-   Função `alterarStatusVeiculo()` com validações de negócio.
-   Função `atualizarVeiculo()` para atualizações gerais.
-   Sistema de cálculo de depreciação automática.
-   Controle de quilometragem progressiva (não permite diminuir).
-   Validação de chassi (17 caracteres alfanuméricos).

#### APIs Refatoradas - Locações
-   Sistema completo de validação de período e disponibilidade.
-   Controle automático de status de veículos.
-   Funções `historicoLocacoesCliente()` e `historicoLocacoesVeiculo()`.
-   Suporte a serviços adicionais.
-   Transações para garantir consistência de dados.
-   Validação de regras de negócio (cliente elegível, veículo disponível).

#### Rotas de API Modernizadas
-   Sistema de middleware padronizado para validação e tratamento de erros.
-   Códigos de status HTTP corretos (404 para "não encontrado", 409 para conflitos).
-   Respostas JSON padronizadas com formato `{ success, data/error, message }`.
-   **Novas rotas especializadas:**
    -   `GET /clientes/{cpf}/elegibilidade` - Verificar aptidão para locação.
    -   `PATCH /clientes/{cpf}/status` - Alterar status do cliente.
    -   `GET /clientes/buscar-nome` - Busca flexível por nome.
    -   `GET /veiculos/disponiveis` - Listar apenas veículos disponíveis.
    -   `GET /veiculos/relatorio` - Relatório completo da frota.
    -   `PATCH /veiculos/{chassi}/quilometragem` - Atualizar quilometragem.
    -   `PATCH /veiculos/{chassi}/status` - Alterar status do veículo.
    -   `POST /veiculos/{chassi}/venda` - Registrar venda.
    -   `GET /locacoes/cliente/{cpf}` - Histórico de locações do cliente.
    -   `GET /locacoes/veiculo/{chassi}` - Histórico de locações do veículo.
    -   `PATCH /locacoes/{id}/status` - Alterar status da locação.

#### Suite de Testes
-   **Testes automatizados com Jest** com 32+ testes cobrindo todos os cenários.
-   **Coleção Postman** com testes integrados e variáveis dinâmicas.
-   **Scripts cURL** para linha de comando.
-   **Testes de integração** validando fluxo completo.
-   **Testes de erro** para validação de edge cases.
-   **Dados únicos por execução** para evitar conflitos.
-   **Cleanup automático** de dados de teste.

### Corrigido

#### Problemas de Configuração do Firebase
-   **Configuração inconsistente** entre Firebase Client SDK e Admin SDK.
-   **Imports não utilizados** e configurações redundantes.
-   **Inicialização centralizada** do Firebase Admin SDK.

#### Tratamento de Erros nas Rotas
-   **Erro "Cannot read properties of undefined (reading 'success')"** nas rotas de criação.
-   **Status HTTP incorretos** (500 em vez de 404 para recursos não encontrados).
-   **Inconsistência no formato de resposta** entre diferentes endpoints.
-   **Falta de validação adequada** de dados de entrada.

#### Problemas de Validação
-   **Validação de CPF incompleta** (apenas formato, sem dígitos verificadores).
-   **Validação de placa inadequada** para formato Mercosul.
-   **Validação de datas limitada** a um único formato.
-   **Falta de sanitização** de dados de entrada.

#### Problemas de Concorrência nos Testes
-   **Conflitos entre execuções de teste** por uso de dados fixos.
-   **Estado compartilhado** causando falhas intermitentes.
-   **Dependências entre testes** não gerenciadas adequadamente.
-   **Cleanup inadequado** de dados de teste.

#### Inconsistências no Sistema de Dados
-   **Formatos de data inconsistentes** entre módulos.
-   **Falta de controle de transações** em operações críticas.
-   **Validações duplicadas** em diferentes módulos.
-   **Status de veículos não sincronizados** com locações.

### Alterado

#### Arquitetura do Sistema
-   **Migração para arquitetura em camadas** com separação clara de responsabilidades.
-   **Sistema de validação centralizado** substituindo validações espalhadas.
-   **Tratamento de erro unificado** em todos os módulos.
-   **Configuração centralizada** de constantes e padrões.

#### Estratégia de Banco de Dados
-   **Uso de transações** para operações que afetam múltiplas coleções.
-   **Validação antecipada** para falha rápida em dados inválidos.
-   **Operações paralelas** onde possível para melhor performance.
-   **Índices otimizados** para consultas frequentes.

#### Sistema de Testes
-   **Dados únicos por execução** usando timestamps.
-   **Pré-requisitos verificados** antes de cada teste.
-   **Estado controlado** entre testes relacionados.
-   **Timeout aumentado** para operações do Firestore.

#### Padrões de Código
-   **Nomenclatura consistente** de variáveis e funções.
-   **Documentação JSDoc aprimorada** com exemplos e tipos.
-   **Tratamento de erro padronizado** em todos os módulos.
-   **Logs estruturados** para melhor debugging.

### Documentação

-   **Exemplos práticos** com JSONs completos para teste de todos os endpoints.
-   **Exemplos cURL** para automação e scripts.
-   **Coleção Postman** com testes automatizados.
-   **Guia de instalação e configuração** passo a passo.
-   **Documentação completa** da API com códigos de status e formatos de resposta.
-   **Padrões de código** e melhores práticas documentadas.

---

## [0.0.0g] - 29/07/2025

### Adicionado

-   **Implementação da rota PUT para atualização de clientes (`functions/cliente.js`).**
    -   Adição da rota PUT `/:cpf` para atualização parcial de clientes.
    -   Criação da função `atualizarCliente` em `src/scripts/firestore/firestoreClientes.js` para manipular a lógica de atualização no Firestore.
    -   A função `atualizarCliente` suporta atualização de dados pessoais, endereço, contato e documentos (CNH) com `merge: true` em subcoleções.
    -   Tratamento de erros, incluindo cliente não encontrado.
-   **Implementação da rota DELETE para exclusão de clientes (`functions/cliente.js`).**
    -   Adição da rota DELETE `/:cpf` para remover um cliente.
    -   Criação da função `deletarCliente` em `src/scripts/firestore/firestoreClientes.js` para remover o documento principal do cliente e suas subcoleções.
    -   Tratamento de erros, incluindo cliente não encontrado.

### Documentação

-   Atualização das Docstrings JSDoc para as novas funções `atualizarCliente` e `deletarCliente` em `src/scripts/firestore/firestoreClientes.js`.
-   Atualização das Docstrings JSDoc para as novas rotas PUT e DELETE em `functions/cliente.js`.

### Melhorado

-   Tratamento de erros e respostas HTTP mais específicas para as operações PUT e DELETE de clientes (e.g., 404 para cliente não encontrado).

## [0.0.0f] - 25/07/2025

### Adicionado

-   Implementação do módulo de locação

## [0.0.0e] - 19/07/2025

### Adicionado

-   Implementação da API de Cloud Functions para histórico de manutenções.
    -   Criação do arquivo de roteamento `functions/manutencoes.js`.
    -   Definição da rota GET `/:veiculoId` no roteador de manutenções para listar o histórico de manutenções de um veículo específico.
    -   Integração da rota GET `/:veiculoId` com a função `listarManutencoes` do arquivo `src/scripts/firestore/firestoreManutencao.js`.
    -   Adição do roteador de manutenções ao aplicativo Express principal em `functions/index.js` sob o prefixo `/manutencoes`.
    -   Verificação explícita da existência do veículo solicitado na rota GET `/:veiculoId` antes de buscar as manutenções.
    -   Busca direta do documento do veículo pelo ID (placa sem hífen) no Firestore.
    -   Retorno de status 404 Not Found se o veículo não for encontrado.
-   Documentação inicial (Docstrings JSDoc) para o arquivo `functions/manutencoes.js`.

### Alterado

-   Atualização do arquivo `functions/index.js` para importar e usar o novo roteador de manutenções.

### Corrigido

-   Tratamento de caso onde um ID de veículo inexistente é fornecido na rota GET de histórico de manutenções, retornando status 404.
-   **Erro `TypeError: doc.data(...).dataCadastro.toDate is not a function` ao listar veículos.**
    -   **Causa:** Tentativa de chamar o método `.toDate()` em campos de data que estavam armazenados no Firestore como strings ISO 8601, em vez de objetos `Timestamp`.
    -   **Correção:** Modificação da função de listagem de veículos (`listarVeiculos` em `src/scripts/firestore/firestoreVeiculos.js`) para não tentar chamar `.toDate()` nesses campos, tratando-os como strings.

## [0.0.0d] - 19/07/2025

### Adicionado

-   Implementação do schema de vistoria
    -   Coleção principal `vistorias` com ID aleatório (UUID)

### Corrigido

-   Implementação completa do schema vistorias 
-   Melhoria no tratamento de erros e filtros do schema
-   Comentários de tipagem e documentação

### Alterado

-   Arquivo /scripts/firestore/firestoreVeiculos.js alterado:
    -   Adição da função listarQuilometragemVeiculo;
    -   Adição da função atualizarQuilometragemVeiculo.

## [0.0.0c] - 16/07/2025

### Implementado

- Histórico de Manutenção
  - Subcoleção `manutencoes` adicionada a `veiculos/{id}`.
  - Funções `adicionarManutencao` e `listarManutencoes` criadas em `firestoreManutencao.js`.
- Locações
  - Nova coleção `locacoes` no Firestore.
  - Funções `criarLocacao` e `listarLocacoes` criadas em `firestoreLocacoes.js`.
- Rota GET `/veiculos` com:
  - Paginação via cursor (`startAfter`)
  - Filtros por placa, status e marca
  - Rota GET `/veiculos`
  - Função `listarVeiculos`
- Formatação consistente de datas na resposta

### Melhorado
- Validação de parâmetros na listagem de veículos

## [0.0.0c] - 12/07/2025

### Adicionado

-   Implementação do schema de serviços adicionais
    -   Coleção principal `servicosAdicionais` com ID aleatório (UUID)

### Corrigido

-   Implementação completa do schema servicosAdicionais 
-   Melhoria no tratamento de erros e filtros do schema
-   Comentários de tipagem e documentação

## [0.0.0b] - 09/07/2025

### Adicionado

-   Implementação do schema de fornecedores
    -   Coleção principal `fornecedores` com ID aleatório (UUID)
    -   Subcoleções `servicos`, `contatos` e `enderecos`
    -   Validação de CNPJ único
-   Rota POST `/fornecedores` para cadastro
-   Rota GET `/fornecedores` para listagem paginada
-   Documentação JSDoc para todas as funções
-   Implementação da API de Cloud Functions para criação de fornecedores.
    -   Criação do arquivo de roteamento `functions/fornecedores.js`.
    -   Definição da rota POST `/` no roteador de fornecedores para criação de fornecedores.
    -   Integração da rota POST `/` com a função `criarFornecedor` do arquivo `src/scripts/firestore/firestoreFornecedores.js`.
    -   Adição do roteador de fornecedores ao aplicativo Express principal em `functions/index.js` sob o prefixo `/fornecedores`.
    -   Implementação básica da rota GET `/` como placeholder em `functions/fornecedores.js`.
    -   Exemplo de JSON para testar a rota POST de fornecedores via Postman.

### Corrigido

-   Implementação completa da rota GET /clientes com paginação e filtros
-   Melhoria no tratamento de erros

### Documentação

-   Adicionada documentação para os serviços de cliente em `firestoreClientes.js`
    -   Especificação detalhada de todos os parâmetros e tipos de retorno
    -   Documentação dos formatos exigidos (CPF, datas, telefones)
    -   Descrição dos filtros disponíveis para listagem (nome, tipo PF/PJ)
-   **Documentação inicial (Docstrings JSDoc) para o arquivo `functions/fornecedores.js`.**

### Alterado

-   **Atualização do arquivo `functions/index.js` para importar e usar o novo roteador de fornecedores.**

## [0.0.0a] - 08/07/2025

### Adicionado

-   Configuração inicial do ambiente de desenvolvimento para Cloud Functions do Firebase com Node.js e Express.
    -   Diretório `functions/` criado na raiz do projeto.
    -   Dependências `express` e `cors` instaladas no diretório `functions/`.
    -   Configuração básica do aplicativo Express no `functions/index.js`.
    -   Middleware para parsing de JSON e CORS adicionado ao Express.
-   Implementação inicial da rota POST para criação de clientes (`functions/cliente.js`).
    -   Definição da rota POST '/' no roteador de clientes.
    -   Recebimento e validação básica dos dados do cliente no corpo da requisição.
    -   Chamada à função `criarCliente` (do arquivo `src/scripts/firestore/firestoreClientes.js`) para interagir com o Firestore.
    -   Tratamento básico de sucesso e erro na resposta HTTP.
-   Implementação inicial da rota POST para criação de veículos (`functions/veiculo.js`).
    -   Criação do arquivo `functions/veiculo.js`.
    -   Definição da rota POST '/' no roteador de veículos.
    -   Recebimento e validação básica dos dados do veículo.
    -   Chamada à função `criarVeiculo` (do arquivo `src/scripts/firestore/firestoreVeiculos.js`) para interagir com o Firestore.
    -   Tratamento básico de sucesso e erro na resposta HTTP.
-   Integração dos roteadores de clientes e veículos no aplicativo Express principal (`functions/index.js`).
    -   Importação dos roteadores de `functions/cliente.js` e `functions/veiculo.js`.
    -   Uso do middleware `app.use()` com prefixos `/clientes` e `/veiculos` para direcionar requisições.
-   Configuração do Firebase Emulators Suite para testar Cloud Functions e Firestore localmente.
-   Documentação inicial (Docstrings) para `functions/index.js`, `functions/cliente.js` e `functions/veiculo.js` utilizando o formato JSDoc.
-   Exemplos de JSON para testar as rotas POST de clientes e veículos via Postman.

### Corrigido

-   Problemas de resolução de módulos (conflitos entre ESM e CommonJS) devido à configuração `"type": "module"` no `package.json` raiz e o uso misto de sintaxe `require`/`import`.
    -   Erro `ReferenceError: module is not defined in ES module scope` ao usar `module.exports` em arquivos tratados como ESM.
    -   Erro `ReferenceError: exports is not defined in ES module scope` ao usar `exports.api = ...` em arquivos tratados como ESM.
    -   Aviso `Warning: Module typeless package.json` ao tratar arquivos `.js` em `functions/` como módulos ES automaticamente sem um `package.json` local.
    -   **Correção:** Padronização para a sintaxe de módulos ES (`import`/`export`) nos arquivos `functions/index.js`, `functions/cliente.js` e `functions/veiculo.js`. Adição da linha `"type": "module"` ao arquivo `functions/package.json`.
-   Problema de acesso à instância do Firestore (`db`) e métodos do Admin SDK.
    -   Erro `TypeError: db.collection is not a function` ao tentar usar a instância incorreta do Firestore.
    -   **Causa:** A instância `db` usada nos arquivos `firestore*` não era a instância correta do Firestore obtida do Firebase Admin SDK, e a inicialização não estava centralizada ou acessível corretamente.
    -   **Correção:** Centralização da inicialização do Firebase Admin SDK e obtenção da instância do Firestore (`db`) no arquivo `firebaseConfig.js`. Adaptação dos arquivos em `src/scripts/firestore/` para importar a instância `db` do Admin SDK a partir de `firebaseConfig.js` e usar os métodos correspondentes do Admin SDK.
-   Problemas relacionados à importação e instalação do Firebase Admin SDK.
    -   Erro `Error [ERR_PACKAGE_PATH_NOT_EXPORTED]: Package subpath './admin' is not defined by "exports"` ao importar `admin` do pacote `firebase` (SDK do cliente) em vez de `firebase-admin` (Admin SDK).
    -   Erro `Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'firebase-admin' imported from ...\firebaseConfig.js` ao importar `firebase-admin` sem que o pacote estivesse instalado no local correto.
    -   **Correção:** Mudança da importação para `import admin from 'firebase-admin';`. Instalação do pacote `firebase-admin` na raiz do projeto usando `npm install firebase-admin --save`.

### Alterado

-   Atualização da documentação (Docstrings) de `functions/index.js` e `functions/cliente.js` para refletir as mudanças na inicialização do Admin SDK e na sintaxe de módulos.
-   Ajuste dos caminhos de importação em vários arquivos (`functions/*.js`, `src/scripts/firestore/*.js`) para usar caminhos relativos corretos e a sintaxe `import`.