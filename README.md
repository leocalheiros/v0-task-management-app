## Documentação da Aplicação

### Visão Geral

Este é um app web para gestão de tarefas e controle de registros de tempo. Usuários podem criar, buscar, atualizar tarefas e adicionar registros de horas trabalhadas, tudo em uma interface moderna construída com React e TypeScript.

### Arquitetura

- **Frontend:** React + TypeScript
- **Backend:** Endpoints REST
- **Banco de Dados:** SQL (`tasks`, `time_records`)

#### Fluxo de Dados

1. Usuário interage com a interface (cria, busca, edita tarefas).
2. Ações disparam chamadas para o backend via API.
3. Backend processa e retorna dados.
4. Frontend atualiza a interface conforme resposta.

### Funcionalidades

- Listagem e busca de tarefas.
- Criação, atualização e exclusão de tarefas.
- Adição, edição e remoção de registros de tempo por tarefa.
- Feedback visual para ações (toast de sucesso/erro).
- Menu lateral com navegação.
- **Geração de relatório:** botão na interface que, ao ser clicado, gera um relatório personalizado para o usuário utilizando Chat GPT.

### Instalação e Execução

1. Clone o repositório:
   git clone https://github.com/leocalheiros/v0-task-management-app.git
   cd v0-task-management-app

2. Instale as dependências:
   npm install

3. Inicie a aplicação:
   npm run dev

4. Acesse no navegador:  
   `http://localhost:3000`

### Estrutura de Pastas

- `components/` — Componentes React reutilizáveis.
- `lib/api.ts` — Funções de acesso à API.
- `hooks/` — Hooks customizados.
- `pages/` ou `app/` — Entradas de página.
- `migrations/` — Inicialização do banco de dados.

### Dependências Principais

- React
- TypeScript
- Lucide-react (ícones)
- Tailwind CSS (ou similar)
- Bibliotecas de UI (ex: shadcn/ui)
### Endpoints do Backend

- **GET /tasks**  
  Lista todas as tarefas.

- **POST /tasks**  
  Cria uma nova tarefa.  
  Corpo: `{ title, description }`

- **GET /tasks/:id**  
  Detalha uma tarefa específica.

- **PUT /tasks/:id**  
  Atualiza uma tarefa existente.  
  Corpo: `{ title, description }`

- **DELETE /tasks/:id**  
  Remove uma tarefa.

- **GET /tasks/:id/time-records**  
  Lista registros de tempo de uma tarefa.

- **POST /tasks/:id/time-records**  
  Adiciona registro de tempo a uma tarefa.  
  Corpo: `{ duration, description }`

- **PUT /time-records/:id**  
  Atualiza um registro de tempo.

- **DELETE /time-records/:id**  
  Remove um registro de tempo.

### Relatórios com ChatGPT

A aplicação disponibiliza um botão específico para geração de relatórios. Ao utilizá-lo, o usuário obtém um relatório completo com informações detalhadas sobre as tarefas e os registros de tempo, incluindo a identificação dos colaboradores responsáveis por cada atividade e aqueles que ainda não iniciaram ou concluíram suas tarefas.

### Problemas de segurança encontrados

- A IA adicionou automaticamente dependências que apresentaram **vulnerabilidades médias e altas**, identificadas após análise.  
- A forma de implementação sugerida pela IA resultou em um **código com alto risco de manutenção**, devido à baixa padronização e acoplamento elevado.  