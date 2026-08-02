// ---------- carregamento dos componentes (sidebar, topbar e páginas) ----------
async function loadInto(elementId, filePath) {
  const response = await fetch(filePath);
  if (!response.ok) throw new Error('Falha ao carregar ' + filePath + ' (HTTP ' + response.status + ')');
  const html = await response.text();
  document.getElementById(elementId).innerHTML = html;
}

async function loadPagesInto(elementId, filePaths) {
  const htmls = await Promise.all(filePaths.map(async (fp) => {
    const response = await fetch(fp);
    if (!response.ok) throw new Error('Falha ao carregar ' + fp + ' (HTTP ' + response.status + ')');
    return response.text();
  }));
  document.getElementById(elementId).innerHTML = htmls.join('\n');
}

const PAGE_FILES = [
  'pages/dashboard.html',
  'pages/processos.html',
  'pages/documentos.html',
  'pages/checklists.html',
  'pages/pendencias.html',
  'pages/relatorios.html',
  'pages/mapa.html',
  'pages/configuracoes.html'
];

async function init() {
  try {
    await Promise.all([
      loadInto('sidebar-container', 'components/sidebar.html'),
      loadInto('topbar-container', 'components/topbar.html'),
      loadPagesInto('content-container', PAGE_FILES)
    ]);
    attachEvents();
  } catch (err) {
    console.error(err);
    document.getElementById('content-container').innerHTML =
      '<div style="padding:24px;color:#c0392b;font-family:sans-serif;">' +
      'Não foi possível carregar o site. Isso normalmente acontece quando o arquivo é aberto ' +
      'diretamente (duplo clique) em vez de servido por um servidor local. ' +
      'Veja o README.md para instruções.<br><br><code>' + err.message + '</code></div>';
  }
}

// ---------- utilidades: toast ----------
function showToast(message) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 250);
  }, 2800);
}

// ---------- utilidades: modal ----------
function openModal(titleText, fieldsHtml, onConfirm) {
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'activeModalOverlay';
  overlay.innerHTML =
    '<div class="modal-box">' +
      '<div class="modal-title">' + titleText + '</div>' +
      '<div id="modalFields">' + fieldsHtml + '</div>' +
      '<div class="modal-actions">' +
        '<button class="btn-full" id="modalCancelBtn">Cancelar</button>' +
        '<button class="btn-primary" id="modalConfirmBtn">Salvar</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(overlay);

  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  document.getElementById('modalCancelBtn').addEventListener('click', closeModal);
  document.getElementById('modalConfirmBtn').addEventListener('click', () => {
    const result = onConfirm(overlay);
    if (result !== false) closeModal();
  });

  const firstInput = overlay.querySelector('input, select');
  if (firstInput) firstInput.focus();
}

function closeModal() {
  const overlay = document.getElementById('activeModalOverlay');
  if (overlay) overlay.remove();
}

// ---------- navegação entre páginas ----------
const PAGE_TITLES = {
  dashboard: 'Painel de Controle',
  processos: 'Processos',
  documentos: 'Documentos',
  checklists: 'Checklists',
  pendencias: 'Pendências',
  relatorios: 'Relatórios',
  mapa: 'Mapa',
  configuracoes: 'Configurações'
};

function navigateTo(target) {
  document.querySelectorAll('.nav-item[data-page]').forEach(n => n.classList.remove('active'));
  const navItem = document.querySelector('.nav-item[data-page="' + target + '"]');
  if (navItem) navItem.classList.add('active');

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const targetPage = document.getElementById('page-' + target);
  if (targetPage) targetPage.classList.add('active');

  const pageTitle = document.getElementById('pageTitle');
  if (pageTitle) pageTitle.textContent = PAGE_TITLES[target] || '';

  document.querySelectorAll('.dropdown-panel.open').forEach(d => d.classList.remove('open'));
  const contentEl = document.getElementById('content-container');
  if (contentEl && typeof contentEl.scrollIntoView === 'function') {
    contentEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ---------- eventos gerais ----------
function attachEvents() {
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', () => navigateTo(item.getAttribute('data-page')));
  });

  attachDashboardEvents();
  attachProcessosEvents();
  attachDocumentosEvents();
  attachChecklistsEvents();
  attachRelatoriosEvents();
  attachConfiguracoesEvents();
  attachTopbarEvents();
  attachSidebarFooterEvents();

  // fecha dropdowns ao clicar fora
  document.addEventListener('click', (e) => {
    document.querySelectorAll('.dropdown-panel.open').forEach(panel => {
      if (!panel.parentElement.contains(e.target)) panel.classList.remove('open');
    });
  });
}

// ---------- Dashboard ----------
function attachDashboardEvents() {
  const dash = document.getElementById('page-dashboard');
  if (!dash) return;

  const buttons = dash.querySelectorAll('.btn-full');
  if (buttons[0]) buttons[0].addEventListener('click', () => navigateTo('processos'));
  if (buttons[1]) buttons[1].addEventListener('click', () => navigateTo('pendencias'));

  const mapLink = dash.querySelector('.map-link');
  if (mapLink) mapLink.addEventListener('click', () => navigateTo('mapa'));
}

// ---------- Processos ----------
function turnPlaceholderIntoInput(container, selector) {
  const box = container.querySelector(selector);
  if (!box) return null;
  let input = box.querySelector('input');
  if (input) return input;
  const span = box.querySelector('span');
  input = document.createElement('input');
  input.type = 'text';
  input.placeholder = span ? span.textContent : 'Buscar...';
  if (span) span.replaceWith(input);
  else box.appendChild(input);
  return input;
}

function attachProcessosEvents() {
  const page = document.getElementById('page-processos');
  if (!page) return;

  const searchInput = turnPlaceholderIntoInput(page, '.filter-search');
  const pills = page.querySelectorAll('.filter-pill');

  function applyFilters() {
    const term = (searchInput ? searchInput.value : '').trim().toLowerCase();
    const activePill = page.querySelector('.filter-pill.active');
    const statusFilter = activePill ? activePill.textContent.trim() : 'Todos';

    page.querySelectorAll('tbody tr').forEach(row => {
      const statusEl = row.querySelector('.status-pill');
      const status = statusEl ? statusEl.textContent.trim() : '';
      const matchesStatus = statusFilter === 'Todos' || status === statusFilter;
      const matchesText = !term || row.textContent.toLowerCase().includes(term);
      row.style.display = (matchesStatus && matchesText) ? '' : 'none';
    });
  }

  if (searchInput) searchInput.addEventListener('input', applyFilters);

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      applyFilters();
    });
  });

  const newBtn = page.querySelector('.btn-primary');
  if (newBtn) {
    newBtn.addEventListener('click', () => {
      openModal('Novo processo', `
        <div class="modal-field"><label>Número do processo</label><input type="text" id="npNumero" placeholder="2024.006"></div>
        <div class="modal-field"><label>Descrição</label><input type="text" id="npDesc" placeholder="Ex: Lavra a céu aberto"></div>
        <div class="modal-field"><label>Localização</label><input type="text" id="npLocal" placeholder="Pará — ..."></div>
        <div class="modal-field"><label>Tipo</label>
          <select id="npTipo"><option>LP</option><option>LI</option><option>LO</option></select>
        </div>
      `, () => {
        const numero = document.getElementById('npNumero').value.trim() || '2024.0XX';
        const desc = document.getElementById('npDesc').value.trim() || 'Novo processo';
        const local = document.getElementById('npLocal').value.trim() || '—';
        const tipo = document.getElementById('npTipo').value;

        const tbody = page.querySelector('tbody');
        const tr = document.createElement('tr');

        const tdNumero = document.createElement('td');
        tdNumero.className = 'proc-id';
        tdNumero.textContent = numero;

        const tdDesc = document.createElement('td');
        tdDesc.className = 'proc-desc';
        tdDesc.textContent = desc;

        const tdLocal = document.createElement('td');
        tdLocal.textContent = local;

        const tdTipo = document.createElement('td');
        const tagSpan = document.createElement('span');
        tagSpan.className = 'tag';
        tagSpan.textContent = tipo;
        if (tipo !== 'LP') {
          tagSpan.style.background = 'var(--blue-bg)';
          tagSpan.style.color = 'var(--blue)';
        }
        tdTipo.appendChild(tagSpan);

        const tdStatus = document.createElement('td');
        tdStatus.innerHTML = '<span class="status-pill" style="color:var(--blue);"><span class="status-dot" style="background:var(--blue);"></span>Em análise</span>';

        const tdPct = document.createElement('td');
        tdPct.textContent = '0%';

        tr.append(tdNumero, tdDesc, tdLocal, tdTipo, tdStatus, tdPct);
        tbody.appendChild(tr);

        applyFilters();
        showToast('Processo ' + numero + ' adicionado');
      });
    });
  }

  applyFilters();
}

// ---------- Documentos ----------
function bindDownload(btn) {
  btn.addEventListener('click', () => {
    const row = btn.closest('.doc-row, .rel-doc-row');
    const nameEl = row ? row.querySelector('.doc-name') : null;
    const name = nameEl ? nameEl.textContent : 'arquivo';
    showToast('Download iniciado: ' + name);
  });
}

function attachDocumentosEvents() {
  const page = document.getElementById('page-documentos');
  if (!page) return;

  const searchInput = turnPlaceholderIntoInput(page, '.doc-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const term = searchInput.value.trim().toLowerCase();
      page.querySelectorAll('.doc-row').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(term) ? '' : 'none';
      });
    });
  }

  const addBtn = page.querySelector('.btn-primary');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      openModal('Adicionar documento', `
        <div class="modal-field"><label>Nome do documento</label><input type="text" id="docNome" placeholder="Ex: Relatório de Monitoramento"></div>
        <div class="modal-field"><label>Categoria</label>
          <select id="docCategoria"><option>Estudos Ambientais</option><option>Certidões</option><option>Planos</option><option>Relatórios</option><option>Laudos</option></select>
        </div>
        <div class="modal-field"><label>Tipo de arquivo</label>
          <select id="docTipo"><option>PDF</option><option>DOCX</option></select>
        </div>
      `, () => {
        const nome = document.getElementById('docNome').value.trim() || 'Novo documento';
        const categoria = document.getElementById('docCategoria').value;
        const tipo = document.getElementById('docTipo').value;

        const list = page.querySelector('.card');
        const row = document.createElement('div');
        row.className = 'doc-row';

        const icon = document.createElement('div');
        icon.className = 'doc-icon' + (tipo === 'DOCX' ? ' docx' : '');
        icon.textContent = tipo;

        const info = document.createElement('div');
        const nameDiv = document.createElement('div');
        nameDiv.className = 'doc-name';
        nameDiv.textContent = nome;
        const metaDiv = document.createElement('div');
        metaDiv.className = 'doc-meta';
        metaDiv.textContent = categoria + ' · ' + new Date().toLocaleDateString('pt-BR');
        info.append(nameDiv, metaDiv);

        const dl = document.createElement('div');
        dl.className = 'doc-dl';
        dl.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
        bindDownload(dl);

        row.append(icon, info, dl);
        list.appendChild(row);
        showToast('Documento "' + nome + '" adicionado');
      });
    });
  }

  page.querySelectorAll('.doc-dl').forEach(btn => bindDownload(btn));
}

// ---------- Checklists ----------
function updateChecklistProgress(card) {
  const items = card.querySelectorAll('.check-item');
  const done = card.querySelectorAll('.check-item.done').length;
  const total = items.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const pctEl = card.querySelector('.checklist-pct');
  const fillEl = card.querySelector('.checklist-progress-fill');
  const subEl = card.querySelector('.checklist-sub');

  if (pctEl) pctEl.textContent = pct + '%';
  if (fillEl) fillEl.style.width = pct + '%';
  if (subEl) {
    const prefix = subEl.textContent.split('·')[0].trim();
    subEl.textContent = prefix + ' · ' + done + '/' + total + ' itens concluídos';
  }
}

function attachChecklistsEvents() {
  document.querySelectorAll('.checklist-card').forEach(card => {
    card.querySelectorAll('.check-item').forEach(item => {
      item.addEventListener('click', () => {
        item.classList.toggle('done');
        const checkbox = item.querySelector('.checkbox');
        if (item.classList.contains('done')) {
          checkbox.classList.add('done');
          checkbox.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
        } else {
          checkbox.classList.remove('done');
          checkbox.innerHTML = '';
        }
        updateChecklistProgress(card);
      });
    });
  });
}

// ---------- Relatórios ----------
function attachRelatoriosEvents() {
  const page = document.getElementById('page-relatorios');
  if (!page) return;
  page.querySelectorAll('.btn-outline').forEach(btn => bindDownload(btn));
}

// ---------- Configurações ----------
function attachConfiguracoesEvents() {
  const page = document.getElementById('page-configuracoes');
  if (!page) return;

  const rows = page.querySelectorAll('.settings-row');
  const kinds = ['email', 'sistema', 'darkmode'];

  rows.forEach((row, i) => {
    const toggle = row.querySelector('.toggle');
    if (!toggle) return;

    const activate = () => {
      toggle.classList.toggle('on');
      const isOn = toggle.classList.contains('on');
      if (kinds[i] === 'darkmode') {
        document.body.classList.toggle('dark-mode', isOn);
        showToast('Modo escuro ' + (isOn ? 'ativado' : 'desativado'));
      } else {
        const label = row.querySelector('.settings-label').textContent;
        showToast(label + (isOn ? ' ativado' : ' desativado'));
      }
    };

    toggle.addEventListener('click', (e) => { e.stopPropagation(); activate(); });
    row.addEventListener('click', activate);
  });
}

// ---------- Sidebar (rodapé) ----------
function attachSidebarFooterEvents() {
  const help = document.querySelector('.help-link');
  if (help) {
    help.addEventListener('click', () => showToast('Central de ajuda: suporte@lima.com.br'));
  }
}

// ---------- Topbar (busca, notificações, avatar) ----------
function makeDropdown(triggerEl, panelHtml) {
  const wrap = document.createElement('div');
  wrap.className = 'dropdown-wrap';
  triggerEl.replaceWith(wrap);
  wrap.appendChild(triggerEl);

  const panel = document.createElement('div');
  panel.className = 'dropdown-panel';
  panel.innerHTML = panelHtml;
  wrap.appendChild(panel);

  triggerEl.addEventListener('click', (e) => {
    e.stopPropagation();
    document.querySelectorAll('.dropdown-panel.open').forEach(p => { if (p !== panel) p.classList.remove('open'); });
    panel.classList.toggle('open');
  });

  return panel;
}

function attachTopbarEvents() {
  const topbar = document.querySelector('.topbar');
  if (!topbar) return;

  // busca no topo
  const searchInput = turnPlaceholderIntoInput(topbar, '.search-box');
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const term = searchInput.value.trim();
      if (!term) return;

      const activePage = document.querySelector('.page.active');
      if (activePage && activePage.id === 'page-processos') {
        const pSearch = activePage.querySelector('.filter-search input');
        if (pSearch) {
          pSearch.value = term;
          pSearch.dispatchEvent(new Event('input'));
          showToast('Buscando processos por "' + term + '"');
          return;
        }
      }
      if (activePage && activePage.id === 'page-documentos') {
        const dSearch = activePage.querySelector('.doc-search input');
        if (dSearch) {
          dSearch.value = term;
          dSearch.dispatchEvent(new Event('input'));
          showToast('Buscando documentos por "' + term + '"');
          return;
        }
      }
      showToast('Abra "Processos" ou "Documentos" para buscar por "' + term + '"');
    });
  }

  // notificações
  const bell = topbar.querySelector('.icon-btn');
  if (bell) {
    const panel = makeDropdown(bell, `
      <div class="dropdown-header">Notificações</div>
      <div class="notif-item"><div class="notif-title">Entrega de complementação</div><div class="notif-sub">Processo 2024.001 · prazo 20/05</div></div>
      <div class="notif-item"><div class="notif-title">Renovação de certidão</div><div class="notif-sub">Processo 2024.002 · prazo 28/05</div></div>
      <div class="dropdown-divider"></div>
      <div class="dropdown-item" id="verTodasPendencias">Ver todas as pendências</div>
    `);
    panel.querySelector('#verTodasPendencias').addEventListener('click', () => navigateTo('pendencias'));
  }

  // avatar
  const avatar = topbar.querySelector('.avatar');
  if (avatar) {
    const panel = makeDropdown(avatar, `
      <div class="dropdown-header">Minha conta</div>
      <div class="dropdown-item" id="avatarConfig">Configurações</div>
      <div class="dropdown-divider"></div>
      <div class="dropdown-item" id="avatarSair">Sair</div>
    `);
    panel.querySelector('#avatarConfig').addEventListener('click', () => navigateTo('configuracoes'));
    panel.querySelector('#avatarSair').addEventListener('click', () => showToast('Sessão encerrada (demonstração)'));
  }
}

init();
