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
