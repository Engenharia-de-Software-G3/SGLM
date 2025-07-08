# Changelog

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

-   Erro `ReferenceError: module is not defined in ES module scope` ao usar `require()` e `module.exports` em arquivos `.js` dentro do diretório `functions/`, devido à configuração `"type": "module"` no `package.json` raiz.
    -   **Correção:** Refatoração dos arquivos `functions/index.js`, `functions/cliente.js` e `functions/veiculo.js` para usar a sintaxe de módulos ES (`import`/`export`).
-   Erro `ReferenceError: exports is not defined in ES module scope` em `functions/index.js` causado pela exportação da Cloud Function principal usando `exports.api = ...` em um arquivo tratado como módulo ES.
    -   **Correção:** Mudança da exportação da Cloud Function principal em `functions/index.js` para usar a sintaxe ESM `export const api = ...;`.
-   Erro `TypeError: db.collection is not a function` ao interagir com o Firestore a partir das funções.
    -   **Causa:** A instância `db` usada nos arquivos `firestore*` não era a instância correta do Firestore obtida do Firebase Admin SDK.
    -   **Correção:** Centralização da inicialização do Firebase Admin SDK e obtenção da instância do Firestore (`db`) no arquivo `firebaseConfig.js`. Adaptação dos arquivos em `src/scripts/firestore/` para importar a instância `db` do Admin SDK a partir de `firebaseConfig.js` e usar os métodos correspondentes do Admin SDK.
-   Erro `Error [ERR_PACKAGE_PATH_NOT_EXPORTED]: Package subpath './admin' is not defined by "exports"` ao importar `admin` do pacote `firebase` em vez de `firebase-admin`.
    -   **Correção:** Mudança da importação para `import admin from 'firebase-admin';`.
-   Erro `Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'firebase-admin'` ao importar `firebase-admin` do `firebaseConfig.js`.
    -   **Causa:** O pacote `firebase-admin` não estava instalado na raiz do projeto.
    -   **Correção:** Instalação do pacote `firebase-admin` na raiz do projeto usando `npm install firebase-admin --save`.
-   Aviso `Warning: Module typeless package.json` ao tratar arquivos `.js` em `functions/` como módulos ES automaticamente.
    -   **Correção:** Adição da linha `"type": "module"` ao arquivo `functions/package.json` para definir explicitamente o tipo de módulo para os arquivos `.js` dentro desse diretório.

### Alterado

-   Atualização da documentação (Docstrings) de `functions/index.js` e `functions/cliente.js` para refletir as mudanças na inicialização do Admin SDK e na sintaxe de módulos.
-   Ajuste dos caminhos de importação em vários arquivos (`functions/*.js`, `src/scripts/firestore/*.js`) para usar caminhos relativos corretos e a sintaxe `import`.
