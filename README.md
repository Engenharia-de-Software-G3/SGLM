# SGLM - Sistema de Gestão de Locação de Motos

## 📋 Sobre o Projeto

O **SGLM** é uma aplicação desenvolvida com o objetivo de automatizar o processo de locação de motocicletas. A plataforma permite o cadastro e gerenciamento de clientes, veículos, contratos, manutenções, relatórios financeiros, entre outros recursos essenciais para uma operação organizada e eficiente.

## 🎯 Objetivos Principais

- Automatizar processos administrativos da locação de motos
- Centralizar dados de clientes, veículos e contratos
- Otimizar a gestão de manutenções, seguros e emplacamentos
- Facilitar o controle financeiro da empresa
- Fornecer relatórios gerenciais e operacionais

## 🛠 Tecnologias Utilizadas

- **Front-end**: Vite + React + TypeScript
- **Gerenciador de Pacotes**: npm
- **Back-end**: Firebase (Autenticação, Firestore)
- **Componentes UI**: Chackra UI (em alguns casos)

## 🔧 Configuração do Ambiente

### Pré-requisitos

- Node.js (versão LTS recomendada)
- npm
- Git

### Instalação (Front-end)

1. Clone o repositório

```bash
git clone https://github.com/Engenharia-de-Software-G3/SGLM.git
cd SGLM/frontend
```

2. Instale as dependências

```bash
npm install
```

3. Configure variáveis de ambiente (opcional, se houver)

```bash
cp .env.example .env
```

Preencha os dados conforme necessário no arquivo `.env`.

4. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

### Instalação (Back-end)

1. Clone o Repositório: Clone este repositório para o seu ambiente local:

```bash
git clone https://github.com/Engenharia-de-Software-G3/SGLM.git
cd SGLM
```

2. Instale as dependências

```bash
npm install
    cd functions
    npm install
    cd ..
```

3. Login no Firebase: Para interagir com o seu projeto Firebase (baixar configurações, implantar, usar emuladores), você precisa fazer login através da CLI do Firebase. 

```bash
firebase login
```
4. Associe o Projeto Local ao Projeto Firebase. Se você ainda não associou este diretório local ao seu projeto Firebase online, execute o seguinte comando na raiz do projeto (A CLI listará seus projetos Firebase. Selecione o projeto slmg-es (ou o ID correto do seu projeto) da lista)

```bash
firebase use --add
```

5. Configure o Ambiente de Cloud Functions. Se você ainda não inicializou o ambiente de Cloud Functions, siga as instruções, escolhendo JavaScript como linguagem e optando por instalar as dependências. Isso criará o diretório functions/ e arquivos de configuração. execute:

```bash
firebase init functions
```

6. Garanta que o pacote firebase-admin está instalado na **raiz** do projeto:

```bash
npm install firebase-admin --save # Na raiz do projeto
```

### Utilizando Firebase Emulators

Os Firebase Emulators permitem que você execute e teste seus serviços Firebase (Cloud Functions, Firestore, etc.) localmente, sem implantar na nuvem. Isso acelera o desenvolvimento e a depuração.

1. Inicialize os Emuladores: Se for a primeira vez que você usa os emuladores neste projeto, execute o seguinte comando na raiz do projeto e selecione os emuladores que deseja usar (no mínimo Functions e Firestore):

```bash
firebase init emulators
```

2. Inicie os Emuladores: Para iniciar os emuladores selecionados, execute na raiz do projeto:

```bash
firebase emulators:start
```

O terminal mostrará os URLs e portas onde cada emulador está rodando. Mantenha este terminal aberto enquanto você trabalha.

3. Teste suas APIs (Cloud Functions)

Com os emuladores rodando, suas Cloud Functions HTTP estarão acessíveis localmente. O URL base para suas funções será algo como http://localhost:<PORTA_FUNCTIONS>/<SEU_PROJECT_ID>/<SUA_REGIAO>/<NOME_DA_FUNCAO>.

- <PORTA_FUNCTIONS>: A porta que o emulador de Functions está usando (geralmente 5001)
- <SEU_PROJECT_ID>: O ID do seu projeto Firebase (no nosso caso: slmg-es).
- <SUA_REGIAO>: A região configurada para suas funções (ex: us-central1).
- <NOME_DA_FUNCAO>: O nome da função HTTP exportada no seu functions/index.js (ex: api se você exportou como export const api = ...)

Exemplo (usando POST para a rota de clientes):

- URL: http://localhost:5001/slmg-es/southamerica-east1/api/clientes

## 🌐 Estrutura do Projeto

```
SGLM/
├── src/
│   ├── components/       # Recursos do Design System Chackra UI (Não mexer)
│   ├── lib/              # Recursos do Design System Chackra UI (Não mexer)
│   ├── assets/           # Recursos estáticos da aplicação (imagens, ícones, fontes etc.)
│   ├── features/         # Funcionalidades ou módulos principais da aplicação, agrupando componentes, lógica e estilos específicos a cada feature
│   ├── routes/           # Definição das rotas e páginas da aplicação
│   ├── scripts/          # Scripts auxiliares e integrações externas (ex: Firebase, APIs, automações)
│   ├── shared/           # Recursos reutilizáveis e genéricos compartilhados entre as features
│   │   ├── @types/          # Declarações de tipos TypeScript compartilhados
│   │   ├── api/             # Configuração e chamadas a APIs (clientes HTTP, endpoints)
│   │   ├── components/      # Componentes React reutilizáveis, genéricos e independentes de features específicas
│   │   ├── hooks/           # Custom hooks reutilizáveis entre features
│   │   ├── middlewares/     # Middlewares para gerenciamento de estado, requisições ou outras funções transversais
│   │   ├── providers/       # Providers de contexto (ex: AuthProvider, ThemeProvider)
│   │   ├── queries/         # Lógicas e funções para consultas de dados (ex: React Query hooks)
│   │   ├── routes/          # Componentes ou utilitários para roteamento compartilhados
│   │   └── utils/           # Funções utilitárias genéricas
│   └── types/            # Tipagens globais e específicas que não pertencem a uma feature ou shared
└── .env                  # Variáveis de ambiente e configurações externas

```

## 📚 Documentação

- [Requisitos, Estimativas, Protótipos](https://docs.google.com/document/d/1Xex4aP1tCsKe45UkSGv53z8S6qXWfaMmSoEfx87UPuY/edit?tab=t.0)
- [Chackra UI](https://chakra-ui.com/docs/components/concepts/overview)

## 🤝 Como Contribuir

1. Crie uma branch com sua feature:

```bash
git checkout -b feature/NovaFuncionalidade
```

2. Faça commit das suas alterações:

```bash
git commit -m "feat: Adiciona nova funcionalidade"
```

3. Suba para o GitHub:

```bash
git push origin feature/NovaFuncionalidade
```

4. Abra um Pull Request

---

Desenvolvido pela equipe 3 da disciplina de Engenharia de Software 25.1 - Grupo G3.