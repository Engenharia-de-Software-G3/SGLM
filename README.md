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

### Instalação

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