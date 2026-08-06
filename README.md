# LIMA — Painel de Controle

Painel web para acompanhamento de processos de licenciamento ambiental (LP, LI, LO), documentos, checklists, pendências e relatórios. É um front-end estático, sem back-end ou banco de dados: os componentes (`sidebar`, `topbar` e cada página) são montados dinamicamente no navegador via `fetch`, e toda a interatividade (filtros, modais, toasts, progresso de checklist etc.) é simulada em JavaScript puro, sem persistência de dados — ao recarregar a página, tudo volta ao estado inicial.

## Páginas

| Página | Descrição |
|---|---|
| **Dashboard** | Visão geral com indicadores (processos ativos, em conformidade, aguardando análise, pendências), andamento dos processos e próximos prazos. |
| **Processos** | Listagem de processos com busca e filtro por status. |
| **Documentos** | Repositório de documentos, com opção de adicionar novos (nome, categoria e tipo de arquivo) e baixar existentes. |
| **Checklists** | Checklists por processo, com marcação de itens concluídos e cálculo automático do percentual de progresso. |
| **Pendências** | Lista de pendências em aberto. |
| **Relatórios** | Indicadores em formato de gráfico e relatórios para download. |
| **Configurações** | Preferências do usuário, incluindo modo escuro. |

## Tecnologias utilizadas

- **HTML5** semântico, dividido em componentes reutilizáveis
- **CSS3** puro (`assets/css/style.css`), com suporte a modo escuro
- **JavaScript vanilla** (`assets/js/script.js`), sem frameworks ou dependências externas
- Ícones em **SVG inline**

Não há build step, bundler ou dependências de terceiros — é só abrir (via servidor local) e usar.

## Estrutura do projeto

```
lima/
├── index.html                  # Casca da página; carrega tudo via JS
├── components/
│   ├── sidebar.html            # Menu lateral de navegação
│   └── topbar.html             # Barra superior (busca, notificações, avatar)
├── pages/
│   ├── dashboard.html
│   ├── processos.html
│   ├── documentos.html
│   ├── checklists.html
│   ├── pendencias.html
│   ├── relatorios.html
│   └── configuracoes.html
└── assets/
    ├── css/style.css           # Estilos globais
    ├── js/script.js            # Carregamento dos componentes e toda a interatividade
    └── img/logo-lima.svg
```

## Como executar

⚠️ **Não abra o `index.html` com duplo clique.** Por segurança, os navegadores bloqueiam `fetch()` de arquivos locais quando a página é aberta diretamente do disco (`file:///...`), e a tela ficará em branco. O site precisa ser servido por um **servidor local** — escolha uma das opções abaixo (tudo roda na sua máquina, nenhum arquivo é enviado para fora):

### Opção 1 — Python (já vem instalado no Mac/Linux)
```bash
python3 -m http.server 8000
```
Depois acesse: **http://localhost:8000**

### Opção 2 — VS Code (extensão Live Server)
1. Instale a extensão **Live Server**.
2. Clique com o botão direito em `index.html` → **Open with Live Server**.

### Opção 3 — Node.js
```bash
npx serve .
```
Acesse o endereço exibido no terminal (geralmente http://localhost:3000).

## Observações

- Todos os dados exibidos (processos, documentos, prazos, pendências) são **fictícios e estáticos**, definidos diretamente no HTML de cada página — não há integração com API ou banco de dados.
- Ações como "adicionar documento", "marcar item do checklist" e alternar configurações alteram apenas o estado da página em memória (via DOM), sem persistência entre sessões.
- Este projeto é um protótipo/demo de interface; para uso em produção seria necessário adicionar um back-end real, autenticação e persistência de dados.
