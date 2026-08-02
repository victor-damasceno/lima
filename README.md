# LIMA — Painel de Controle

Este site é dividido em vários arquivos (`components/`, `pages/`, `assets/`)
que são montados dinamicamente via JavaScript (`fetch`).

## ⚠️ Importante: não abra o `index.html` com duplo clique

Por segurança, todo navegador bloqueia `fetch()` de arquivos locais quando a
página é aberta direto do disco (endereço começando com `file:///...`).
Se você abrir assim, a tela fica em branco.

Para o site funcionar, ele precisa ser **servido por um servidor local**.
Escolha uma das opções abaixo (todas rodam na sua própria máquina, nenhum
arquivo sai do seu computador):

### Opção 1 — Python (mais simples, já vem instalado no Mac/Linux)
No terminal, dentro da pasta `sitelima`:
```bash
python3 -m http.server 8000
```
Depois abra no navegador: **http://localhost:8000**

### Opção 2 — VS Code (extensão Live Server)
1. Instale a extensão "Live Server" no VS Code.
2. Clique com o botão direito em `index.html` → "Open with Live Server".

### Opção 3 — Node.js
```bash
npx serve .
```
E abra o endereço que aparecer no terminal (geralmente http://localhost:3000).

## Estrutura de arquivos
```
sitelima/
├── index.html              → estrutura base, carrega tudo via JS
├── components/
│   ├── sidebar.html         → menu lateral
│   └── topbar.html          → barra superior
├── pages/
│   ├── dashboard.html
│   ├── processos.html
│   ├── documentos.html
│   ├── checklists.html
│   ├── pendencias.html
│   ├── relatorios.html
│   ├── mapa.html             → propositalmente vazio
│   └── configuracoes.html
└── assets/
    ├── css/style.css
    └── js/script.js          → carrega os componentes e controla a navegação
```
