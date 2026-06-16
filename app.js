// GDEM STOCK — App Logic (app.js)
const $ = id => document.getElementById(id);
const fmt = (n) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
const fmtDate = (d) => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR');

function showToast(msg, type = '') {
  const t = $('toast');
  t.textContent = msg;
  t.className = 'toast show ' + type;
  setTimeout(() => { t.className = 'toast'; }, 2800);
}

function statusPill(s) {
  const map = {
    'disponível':   ['green',  'Disponível'],
    'indisponível': ['red',    'Indisponível'],
    'danificado':   ['yellow', 'Danificado'],
    'finalizado':   ['green',  'Finalizado'],
    'pendente':     ['yellow', 'Pendente'],
    'cancelado':    ['red',    'Cancelado'],
    'entrada':      ['green',  'Entrada'],
    'saída':        ['red',    'Saída'],
    'devolução':    ['yellow', 'Devolução'],
  };
  const [cls, lbl] = map[s] || ['blue', s];
  return `<span class="pill pill-${cls}">${lbl}</span>`;
}

function getProdutoNome(id) {
  const p = DB.produtos.find(x => x.id === id);
  return p ? p.nome_produto : '—';
}

function getClienteNome(id) {
  const c = DB.clientes.find(x => x.id === id);
  return c ? c.nome : '—';
}

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    const page = item.dataset.page;
    navigateTo(page);
    if (window.innerWidth <= 820) {
      $('sidebar').classList.remove('open');
    }
  });
});

function navigateTo(page) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === page));
  document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === 'page-' + page));
  $('pageTitle').textContent = { dashboard: 'Dashboard', produtos: 'Produtos', clientes: 'Clientes', pedidos: 'Pedidos', movimentacoes: 'Movimentações', relatorios: 'Relatórios' }[page] || page;

  if (page === 'produtos') renderProdutos();
  if (page === 'clientes') renderClientes();
  if (page === 'pedidos') renderPedidos();
  if (page === 'movimentacoes') renderMovimentacoes();
  if (page === 'relatorios') renderRelatorios();
}

$('menuToggle').addEventListener('click', () => {
  $('sidebar').classList.toggle('open');
});

$('currentDate').textContent = new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

// ---- DASHBOARD ----
function renderDashboard() {
  $('kpi-produtos').textContent = DB.produtos.length;
  $('kpi-clientes').textContent = DB.clientes.length;
  $('kpi-pedidos').textContent = DB.pedidos.filter(p => p.status_pedido === 'pendente').length;
  const lowStock = DB.produtos.filter(p => p.quantidade_estoque <= 3);
  $('kpi-alertas').textContent = lowStock.length;
  $('alertCount').textContent = lowStock.length;

  const tbody = $('low-stock-table');
  tbody.innerHTML = lowStock.length === 0
    ? `<tr><td colspan="4" class="empty-state"><div class="empty-state-icon">✓</div><p>Nenhum alerta de estoque</p></td></tr>`
    : lowStock.map(p => `
      <tr>
        <td>${p.nome_produto}</td>
        <td>${p.categoria}</td>
        <td><span style="font-family:var(--font-mono);font-size:13px;color:${p.quantidade_estoque === 0 ? 'var(--red)' : 'var(--yellow)'}">${p.quantidade_estoque}</span></td>
        <td>${statusPill(p.status)}</td>
      </tr>`).join('');

  const list = $('activity-list');
  const recent = [...DB.movimentacoes].reverse().slice(0, 6);
  const dotMap = { entrada: 'dot-green', saída: 'dot-red', devolução: 'dot-yellow' };
  list.innerHTML = recent.map(m => `
    <li>
      <span class="activity-dot ${dotMap[m.tipo_movimentacao] || 'dot-blue'}"></span>
      <div>
        <div class="activity-text"><strong>${getProdutoNome(m.id_produto)}</strong> — ${m.tipo_movimentacao} de ${m.quantidade} un.</div>
        <div class="activity-time">${fmtDate(m.data_movimentacao)} · ${m.observacao}</div>
      </div>
    </li>`).join('');

  const alertList = $('alertList');
  alertList.innerHTML = lowStock.map(p => `
    <li>
      <span class="alert-icon-dot"></span>
      <span><strong>${p.nome_produto}</strong> — ${p.quantidade_estoque} un. restante${p.quantidade_estoque !== 1 ? 's' : ''}</span>
    </li>`).join('') || '<li>Sem alertas no momento.</li>';
}

// PRODUTOS
let produtoEditId = null;

function renderProdutos(filter = '', categoria = '', statusF = '') {
  let list = DB.produtos.filter(p => {
    const matchName = p.nome_produto.toLowerCase().includes(filter.toLowerCase());
    const matchCat = !categoria || p.categoria === categoria;
    const matchSt = !statusF || p.status === statusF;
    return matchName && matchCat && matchSt;
  });

  const tbody = $('produtos-tbody');
  tbody.innerHTML = list.length === 0
    ? `<tr><td colspan="7"><div class="empty-state"><div class="empty-state-icon">◧</div><p>Nenhum produto encontrado</p></div></td></tr>`
    : list.map(p => `
      <tr>
        <td><span style="font-family:var(--font-mono);color:var(--white-dim)">#${p.id}</span></td>
        <td><strong>${p.nome_produto}</strong><br><span style="font-size:11px;color:var(--white-dim)">${p.descricao}</span></td>
        <td>${p.categoria}</td>
        <td style="font-family:var(--font-mono)">${fmt(p.preco)}</td>
        <td style="font-family:var(--font-mono);color:${p.quantidade_estoque === 0 ? 'var(--red)' : p.quantidade_estoque <= 3 ? 'var(--yellow)' : 'var(--green)'}">${p.quantidade_estoque}</td>
        <td>${statusPill(p.status)}</td>
        <td><div class="actions">
          <button class="btn-icon" onclick="editProduto(${p.id})">✏ Editar</button>
          <button class="btn-icon delete" onclick="deleteProduto(${p.id})">✕ Excluir</button>
        </div></td>
      </tr>`).join('');
}

$('filterProdutos').addEventListener('input', applyFilters);
$('filterCategoria').addEventListener('change', applyFilters);
$('filterStatus').addEventListener('change', applyFilters);

function applyFilters() {
  renderProdutos($('filterProdutos').value, $('filterCategoria').value, $('filterStatus').value);
}

$('btnNovoProduto').addEventListener('click', () => openProdutoModal());

function openProdutoModal(id = null) {
  produtoEditId = id;
  const p = id ? DB.produtos.find(x => x.id === id) : null;
  $('modalTitle').textContent = id ? 'Editar Produto' : 'Novo Produto';
  $('modalBody').innerHTML = `
    <div class="form-group"><label>Nome do Produto</label>
      <input id="f-nome" type="text" placeholder="Ex: Notebook Dell" value="${p ? p.nome_produto : ''}" /></div>
    <div class="form-group"><label>Descrição</label>
      <input id="f-desc" type="text" placeholder="Descrição breve" value="${p ? p.descricao : ''}" /></div>
    <div class="form-row">
      <div class="form-group"><label>Categoria</label>
        <select id="f-cat">
          ${['Eletrônicos','Alimentação','Vestuário','Higiene','Papelaria'].map(c =>
            `<option${p && p.categoria === c ? ' selected' : ''}>${c}</option>`).join('')}
        </select></div>
      <div class="form-group"><label>Preço (R$)</label>
        <input id="f-preco" type="number" step="0.01" min="0" value="${p ? p.preco : ''}" /></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Quantidade em Estoque</label>
        <input id="f-qtd" type="number" min="0" value="${p ? p.quantidade_estoque : ''}" /></div>
      <div class="form-group"><label>Status</label>
        <select id="f-status">
          ${['disponível','indisponível','danificado'].map(s =>
            `<option${p && p.status === s ? ' selected' : ''}>${s}</option>`).join('')}
        </select></div>
    </div>`;
  openModal(() => saveProduto());
}

function saveProduto() {
  const nome  = $('f-nome').value.trim();
  const desc  = $('f-desc').value.trim();
  const cat   = $('f-cat').value;
  const preco = parseFloat($('f-preco').value);
  const qtd   = parseInt($('f-qtd').value);
  const st    = $('f-status').value;

  if (!nome || isNaN(preco) || isNaN(qtd)) { showToast('Preencha todos os campos obrigatórios', 'error'); return; }

  if (produtoEditId) {
    const p = DB.produtos.find(x => x.id === produtoEditId);
    Object.assign(p, { nome_produto: nome, descricao: desc, categoria: cat, preco, quantidade_estoque: qtd, status: st });
    showToast('Produto atualizado com sucesso', 'success');
  } else {
    DB.produtos.push({ id: DB._nextId.produtos++, nome_produto: nome, descricao: desc, categoria: cat, preco, quantidade_estoque: qtd, status: st, data_cadastro: new Date().toISOString().split('T')[0] });
    showToast('Produto cadastrado com sucesso', 'success');
  }

  closeModal();
  renderProdutos();
  renderDashboard();
}

function editProduto(id) { openProdutoModal(id); }

function deleteProduto(id) {
  DB.produtos = DB.produtos.filter(x => x.id !== id);
  showToast('Produto excluído', 'success');
  renderProdutos();
  renderDashboard();
}

// CLIENTES
let clienteEditId = null;

function renderClientes() {
  const tbody = $('clientes-tbody');
  tbody.innerHTML = DB.clientes.length === 0
    ? `<tr><td colspan="6"><div class="empty-state"><div class="empty-state-icon">◉</div><p>Nenhum cliente cadastrado</p></div></td></tr>`
    : DB.clientes.map(c => `
      <tr>
        <td><span style="font-family:var(--font-mono);color:var(--white-dim)">#${c.id}</span></td>
        <td><strong>${c.nome}</strong></td>
        <td style="font-family:var(--font-mono);font-size:12px">${c.cpf_cnpj}</td>
        <td>${c.telefone}</td>
        <td style="font-size:12px">${c.email}</td>
        <td><div class="actions">
          <button class="btn-icon" onclick="editCliente(${c.id})">✏ Editar</button>
          <button class="btn-icon delete" onclick="deleteCliente(${c.id})">✕ Excluir</button>
        </div></td>
      </tr>`).join('');
}

$('btnNovoCliente').addEventListener('click', () => openClienteModal());

function openClienteModal(id = null) {
  clienteEditId = id;
  const c = id ? DB.clientes.find(x => x.id === id) : null;
  $('modalTitle').textContent = id ? 'Editar Cliente' : 'Novo Cliente';
  $('modalBody').innerHTML = `
    <div class="form-group"><label>Nome Completo / Razão Social</label>
      <input id="c-nome" type="text" placeholder="Ex: João Silva" value="${c ? c.nome : ''}" /></div>
    <div class="form-row">
      <div class="form-group"><label>CPF / CNPJ</label>
        <input id="c-doc" type="text" placeholder="000.000.000-00" value="${c ? c.cpf_cnpj : ''}" /></div>
      <div class="form-group"><label>Telefone</label>
        <input id="c-tel" type="text" placeholder="(61) 9xxxx-xxxx" value="${c ? c.telefone : ''}" /></div>
    </div>
    <div class="form-group"><label>E-mail</label>
      <input id="c-email" type="email" placeholder="email@exemplo.com" value="${c ? c.email : ''}" /></div>
    <div class="form-group"><label>Endereço</label>
      <input id="c-end" type="text" placeholder="Rua, número, bairro" value="${c ? c.endereco : ''}" /></div>`;
  openModal(() => saveCliente());
}

function saveCliente() {
  const nome  = $('c-nome').value.trim();
  const doc   = $('c-doc').value.trim();
  const tel   = $('c-tel').value.trim();
  const email = $('c-email').value.trim();
  const end   = $('c-end').value.trim();

  if (!nome || !doc) { showToast('Nome e CPF/CNPJ são obrigatórios', 'error'); return; }

  if (clienteEditId) {
    const c = DB.clientes.find(x => x.id === clienteEditId);
    Object.assign(c, { nome, cpf_cnpj: doc, telefone: tel, email, endereco: end });
    showToast('Cliente atualizado', 'success');
  } else {
    DB.clientes.push({ id: DB._nextId.clientes++, nome, cpf_cnpj: doc, telefone: tel, email, endereco: end, data_cadastro: new Date().toISOString().split('T')[0] });
    showToast('Cliente cadastrado', 'success');
  }
  closeModal();
  renderClientes();
  renderDashboard();
}

function editCliente(id) { openClienteModal(id); }
function deleteCliente(id) {
  DB.clientes = DB.clientes.filter(x => x.id !== id);
  showToast('Cliente excluído', 'success');
  renderClientes();
  renderDashboard();
}

// ---- PEDIDOS ----
function renderPedidos() {
  const tbody = $('pedidos-tbody');
  tbody.innerHTML = DB.pedidos.length === 0
    ? `<tr><td colspan="7"><div class="empty-state"><div class="empty-state-icon">◫</div><p>Nenhum pedido</p></div></td></tr>`
    : DB.pedidos.map(p => `
      <tr>
        <td><span style="font-family:var(--font-mono);color:var(--white-dim)">#${p.id}</span></td>
        <td>${getClienteNome(p.id_cliente)}</td>
        <td style="font-family:var(--font-mono);font-size:12px">${fmtDate(p.data_pedido)}</td>
        <td style="font-family:var(--font-mono);color:var(--green)">${fmt(p.valor_total)}</td>
        <td style="font-size:12px">${p.forma_pagamento}</td>
        <td>${statusPill(p.status_pedido)}</td>
        <td><div class="actions">
          <button class="btn-icon" onclick="cancelarPedido(${p.id})">✕ Cancelar</button>
        </div></td>
      </tr>`).join('');
}

$('btnNovoPedido').addEventListener('click', () => openPedidoModal());

function openPedidoModal() {
  $('modalTitle').textContent = 'Novo Pedido';
  const clienteOptions = DB.clientes.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
  const produtoOptions = DB.produtos.filter(p => p.status === 'disponível' && p.quantidade_estoque > 0)
    .map(p => `<option value="${p.id}">${p.nome_produto} — ${fmt(p.preco)} (${p.quantidade_estoque} un.)</option>`).join('');
  $('modalBody').innerHTML = `
    <div class="form-group"><label>Cliente</label>
      <select id="p-cli">${clienteOptions}</select></div>
    <div class="form-group"><label>Produto</label>
      <select id="p-prod">${produtoOptions}</select></div>
    <div class="form-row">
      <div class="form-group"><label>Quantidade</label>
        <input id="p-qtd" type="number" min="1" value="1" /></div>
      <div class="form-group"><label>Forma de Pagamento</label>
        <select id="p-pag">
          <option>PIX</option><option>Cartão de Crédito</option><option>Cartão de Débito</option><option>Boleto</option><option>Dinheiro</option>
        </select></div>
    </div>`;
  openModal(() => savePedido());
}

function savePedido() {
  const idCli = parseInt($('p-cli').value);
  const idProd = parseInt($('p-prod').value);
  const qtd = parseInt($('p-qtd').value);
  const pag = $('p-pag').value;
  const prod = DB.produtos.find(x => x.id === idProd);

  if (!prod) { showToast('Produto inválido', 'error'); return; }
  if (qtd <= 0 || qtd > prod.quantidade_estoque) { showToast(`Estoque insuficiente (${prod.quantidade_estoque} disponíveis)`, 'error'); return; }

  const total = prod.preco * qtd;
  const pedido = { id: DB._nextId.pedidos++, id_cliente: idCli, id_usuario: 1, data_pedido: new Date().toISOString().split('T')[0], valor_total: total, forma_pagamento: pag, status_pedido: 'finalizado' };
  DB.pedidos.push(pedido);

  prod.quantidade_estoque -= qtd;
  if (prod.quantidade_estoque === 0) prod.status = 'indisponível';

  DB.movimentacoes.push({ id: DB._nextId.movimentacoes++, id_produto: idProd, tipo_movimentacao: 'saída', quantidade: qtd, data_movimentacao: pedido.data_pedido, observacao: `Venda pedido #${pedido.id}` });

  showToast(`Pedido #${pedido.id} criado — ${fmt(total)}`, 'success');
  closeModal();
  renderPedidos();
  renderDashboard();
}

function cancelarPedido(id) {
  const p = DB.pedidos.find(x => x.id === id);
  if (p && p.status_pedido !== 'cancelado') {
    p.status_pedido = 'cancelado';
    showToast(`Pedido #${id} cancelado`, 'success');
    renderPedidos();
  }
}

// MOVIMENTAÇÕES
function renderMovimentacoes() {
  const tbody = $('movimentacoes-tbody');
  const sorted = [...DB.movimentacoes].reverse();
  tbody.innerHTML = sorted.length === 0
    ? `<tr><td colspan="6"><div class="empty-state"><div class="empty-state-icon">⟳</div><p>Sem movimentações</p></div></td></tr>`
    : sorted.map(m => `
      <tr>
        <td><span style="font-family:var(--font-mono);color:var(--white-dim)">#${m.id}</span></td>
        <td>${getProdutoNome(m.id_produto)}</td>
        <td>${statusPill(m.tipo_movimentacao)}</td>
        <td style="font-family:var(--font-mono)">${m.quantidade}</td>
        <td style="font-family:var(--font-mono);font-size:12px">${fmtDate(m.data_movimentacao)}</td>
        <td style="font-size:12px;color:var(--white-dim)">${m.observacao}</td>
      </tr>`).join('');
}

$('btnNovaMovimentacao').addEventListener('click', () => openMovModal());

function openMovModal() {
  $('modalTitle').textContent = 'Registrar Entrada';
  const opts = DB.produtos.map(p => `<option value="${p.id}">${p.nome_produto}</option>`).join('');
  $('modalBody').innerHTML = `
    <div class="form-group"><label>Produto</label>
      <select id="m-prod">${opts}</select></div>
    <div class="form-row">
      <div class="form-group"><label>Tipo</label>
        <select id="m-tipo">
          <option value="entrada">Entrada</option>
          <option value="saída">Saída</option>
          <option value="devolução">Devolução</option>
        </select></div>
      <div class="form-group"><label>Quantidade</label>
        <input id="m-qtd" type="number" min="1" value="1" /></div>
    </div>
    <div class="form-group"><label>Observação</label>
      <input id="m-obs" type="text" placeholder="Ex: Compra fornecedor X" /></div>`;
  openModal(() => saveMov());
}

function saveMov() {
  const idProd = parseInt($('m-prod').value);
  const tipo = $('m-tipo').value;
  const qtd = parseInt($('m-qtd').value);
  const obs = $('m-obs').value.trim();
  const prod = DB.produtos.find(x => x.id === idProd);

  if (!prod || isNaN(qtd) || qtd <= 0) { showToast('Preencha os campos corretamente', 'error'); return; }
  if (tipo === 'saída' && qtd > prod.quantidade_estoque) { showToast('Estoque insuficiente', 'error'); return; }

  if (tipo === 'entrada' || tipo === 'devolução') prod.quantidade_estoque += qtd;
  else prod.quantidade_estoque -= qtd;

  if (prod.quantidade_estoque > 0 && prod.status === 'indisponível') prod.status = 'disponível';

  DB.movimentacoes.push({ id: DB._nextId.movimentacoes++, id_produto: idProd, tipo_movimentacao: tipo, quantidade: qtd, data_movimentacao: new Date().toISOString().split('T')[0], observacao: obs || '—' });

  showToast('Movimentação registrada', 'success');
  closeModal();
  renderMovimentacoes();
  renderDashboard();
}

// RELATÓRIOS
function renderRelatorios() {
  const vendas = {};
  DB.movimentacoes.filter(m => m.tipo_movimentacao === 'saída').forEach(m => {
    vendas[m.id_produto] = (vendas[m.id_produto] || 0) + m.quantidade;
  });
  const top = Object.entries(vendas).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxV = top[0] ? top[0][1] : 1;
  $('rank-list').innerHTML = top.map(([id, qty], i) => `
    <li>
      <span class="rank-pos">${i + 1}</span>
      <div class="rank-bar-wrap">
        <div class="rank-name">${getProdutoNome(parseInt(id))}</div>
        <div class="rank-bar-bg"><div class="rank-bar-fill" style="width:${(qty/maxV*100).toFixed(0)}%"></div></div>
      </div>
      <span class="rank-qty">${qty} un.</span>
    </li>`).join('') || '<li style="padding:18px;color:var(--white-dim);font-size:12px">Sem dados de vendas.</li>';

  const prods = DB.produtos.slice(0, 6);
  const maxQ = Math.max(...prods.map(p => p.quantidade_estoque), 1);
  $('estoque-bars').innerHTML = prods.map(p => {
    const pct = (p.quantidade_estoque / maxQ * 100).toFixed(0);
    const cls = p.quantidade_estoque === 0 ? 'bar-out' : p.quantidade_estoque <= 3 ? 'bar-low' : 'bar-ok';
    return `<div class="estoque-item">
      <div class="estoque-label"><span>${p.nome_produto.slice(0, 20)}</span><span>${p.quantidade_estoque}</span></div>
      <div class="estoque-bar-bg"><div class="estoque-bar-fill ${cls}" style="width:${pct}%"></div></div>
    </div>`;
  }).join('');

  const counts = { finalizado: 0, pendente: 0, cancelado: 0 };
  DB.pedidos.forEach(p => { if (counts[p.status_pedido] !== undefined) counts[p.status_pedido]++; });
  const statusColors = { finalizado: 'var(--green)', pendente: 'var(--yellow)', cancelado: 'var(--red)' };
  $('status-chart').innerHTML = Object.entries(counts).map(([s, n]) => `
    <div class="status-row">
      <span class="status-dot" style="background:${statusColors[s]}"></span>
      <span class="status-label">${s}</span>
      <span class="status-count" style="color:${statusColors[s]}">${n}</span>
    </div>`).join('');
}

let _saveCallback = null;

function openModal(saveCallback) {
  _saveCallback = saveCallback;
  $('modalOverlay').classList.add('open');
}

function closeModal() {
  $('modalOverlay').classList.remove('open');
  _saveCallback = null;
}

$('modalClose').addEventListener('click', closeModal);
$('modalCancel').addEventListener('click', closeModal);
$('modalOverlay').addEventListener('click', e => { if (e.target === $('modalOverlay')) closeModal(); });
$('modalSave').addEventListener('click', () => { if (_saveCallback) _saveCallback(); });

// ---- ALERT PANEL ----
$('alertBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  $('alertPanel').classList.toggle('open');
});

document.addEventListener('click', () => $('alertPanel').classList.remove('open'));

$('globalSearch').addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const q = e.target.value.trim();
    if (!q) return;
    navigateTo('produtos');
    $('filterProdutos').value = q;
    renderProdutos(q);
  }
});

// Modo Claro / Escuro
const THEME_KEY = 'gdem-theme';

function applyTheme(theme) {
  const isLight = theme === 'light';
  document.body.classList.toggle('theme-light', isLight);
  $('themeToggle').textContent = isLight ? '☀️' : '🌙';
}

function toggleTheme() {
  const isLight = document.body.classList.contains('theme-light');
  const next = isLight ? 'dark' : 'light';
  applyTheme(next);
  localStorage.setItem(THEME_KEY, next);
}

$('themeToggle').addEventListener('click', toggleTheme);

applyTheme(localStorage.getItem(THEME_KEY) || 'dark');

renderDashboard();

// ============================================
// GDEM STOCK — Módulo de Usuários (com bloqueio Admin)
// ============================================
(function () {
  const ADMIN_SENHA = 'GDEM';
  let adminAutenticado = false;

  if (!DB.usuarios) {
    DB.usuarios = [
      { id: 1, nome: 'Marcos Leal', email: 'marcos@gdemstock.com', cargo: 'admin', data_cadastro: '2026-01-01' },
    ];
    DB._nextId.usuarios = 2;
  }

  const usuariosNav = document.getElementById('navUsuarios');

  const sec = document.createElement('section');
  sec.className = 'page';
  sec.id = 'page-usuarios';
  sec.innerHTML = `
    <div class="page-header">
      <h1>Gestão de <span class="accent">Usuários</span></h1>
      <button class="btn-primary" id="btnNovoUsuario">+ Novo Usuário</button>
    </div>
    <div class="card">
      <table class="data-table">
        <thead>
          <tr><th>ID</th><th>Nome</th><th>E-mail</th><th>Cargo</th><th>Cadastro</th><th>Ações</th></tr>
        </thead>
        <tbody id="usuarios-tbody"></tbody>
      </table>
    </div>`;
  document.getElementById('main').appendChild(sec);

  const loginOverlay = document.createElement('div');
  loginOverlay.className = 'modal-overlay';
  loginOverlay.id = 'adminLoginOverlay';
  loginOverlay.innerHTML = `
    <div class="modal" id="adminLoginModal" style="width:380px">
      <div class="modal-header">
        <span>Acesso Restrito</span>
        <button class="modal-close" id="adminLoginClose">✕</button>
      </div>
      <div class="modal-body" style="align-items:center;text-align:center">
        <div class="admin-lock">🔒</div>
        <p style="font-size:13px;color:var(--white-dim);line-height:1.5">
          Área exclusiva para administradores.<br>Informe a senha para continuar.
        </p>
        <div class="form-group" style="width:100%">
          <label>Senha de Administrador</label>
          <input id="adminSenhaInput" type="password" placeholder="••••••••" autocomplete="off" />
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="adminLoginCancel">Cancelar</button>
        <button class="btn-primary" id="adminLoginEntrar">Desbloquear</button>
      </div>
    </div>`;
  document.body.appendChild(loginOverlay);

  usuariosNav.addEventListener('click', e => {
    e.preventDefault();
    if (adminAutenticado) {
      irParaUsuarios();
    } else {
      abrirLoginAdmin();
    }
    if (window.innerWidth <= 820) document.getElementById('sidebar').classList.remove('open');
  });

  function irParaUsuarios() {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === 'usuarios'));
    document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === 'page-usuarios'));
    document.getElementById('pageTitle').textContent = 'Usuários';
    renderUsuarios();
  }

  function abrirLoginAdmin() {
    loginOverlay.classList.add('open');
    const input = document.getElementById('adminSenhaInput');
    input.value = '';
    setTimeout(() => input.focus(), 50);
  }
  function fecharLoginAdmin() {
    loginOverlay.classList.remove('open');
  }
  function validarSenha() {
    const senha = document.getElementById('adminSenhaInput').value;
    if (senha === ADMIN_SENHA) {
      adminAutenticado = true;
      fecharLoginAdmin();
      showToast('Acesso liberado', 'success');
      irParaUsuarios();
    } else {
      const modal = document.getElementById('adminLoginModal');
      modal.classList.remove('shake'); void modal.offsetWidth; modal.classList.add('shake');
      showToast('Senha incorreta', 'error');
    }
  }
  document.getElementById('adminLoginEntrar').addEventListener('click', validarSenha);
  document.getElementById('adminLoginClose').addEventListener('click', fecharLoginAdmin);
  document.getElementById('adminLoginCancel').addEventListener('click', fecharLoginAdmin);
  loginOverlay.addEventListener('click', e => { if (e.target === loginOverlay) fecharLoginAdmin(); });
  document.getElementById('adminSenhaInput').addEventListener('keydown', e => { if (e.key === 'Enter') validarSenha(); });

  let usuarioEditId = null;

  function renderUsuarios() {
    const tbody = document.getElementById('usuarios-tbody');
    tbody.innerHTML = DB.usuarios.length === 0
      ? `<tr><td colspan="6"><div class="empty-state"><div class="empty-state-icon">◍</div><p>Nenhum usuário cadastrado</p></div></td></tr>`
      : DB.usuarios.map(u => `
        <tr>
          <td><span style="font-family:var(--font-mono);color:var(--white-dim)">#${u.id}</span></td>
          <td><strong>${u.nome}</strong></td>
          <td style="font-size:12px">${u.email}</td>
          <td>${cargoPill(u.cargo)}</td>
          <td style="font-family:var(--font-mono);font-size:12px">${fmtDate(u.data_cadastro)}</td>
          <td><div class="actions">
            <button class="btn-icon" onclick="editUsuario(${u.id})">✏ Editar</button>
            <button class="btn-icon delete" onclick="deleteUsuario(${u.id})">✕ Excluir</button>
          </div></td>
        </tr>`).join('');
  }

  function cargoPill(c) {
    const map = { admin: 'blue', gerente: 'green', operador: 'yellow' };
    return `<span class="pill pill-${map[c] || 'blue'}">${c}</span>`;
  }

  function openUsuarioModal(id = null) {
    usuarioEditId = id;
    const u = id ? DB.usuarios.find(x => x.id === id) : null;
    document.getElementById('modalTitle').textContent = id ? 'Editar Usuário' : 'Novo Usuário';
    document.getElementById('modalBody').innerHTML = `
      <div class="form-group"><label>Nome Completo</label>
        <input id="u-nome" type="text" placeholder="Ex: João Silva" value="${u ? u.nome : ''}" /></div>
      <div class="form-group"><label>E-mail</label>
        <input id="u-email" type="email" placeholder="email@exemplo.com" value="${u ? u.email : ''}" /></div>
      <div class="form-row">
        <div class="form-group"><label>Cargo</label>
          <select id="u-cargo">
            ${['admin','gerente','operador'].map(c => `<option${u && u.cargo === c ? ' selected' : ''}>${c}</option>`).join('')}
          </select></div>
        <div class="form-group"><label>Senha</label>
          <input id="u-senha" type="password" placeholder="${id ? 'Em branco = manter' : 'Defina uma senha'}" /></div>
      </div>`;
    openModal(() => saveUsuario());
  }

  function saveUsuario() {
    const nome  = document.getElementById('u-nome').value.trim();
    const email = document.getElementById('u-email').value.trim();
    const cargo = document.getElementById('u-cargo').value;
    const senha = document.getElementById('u-senha').value;

    if (!nome || !email) { showToast('Nome e e-mail são obrigatórios', 'error'); return; }

    if (usuarioEditId) {
      const u = DB.usuarios.find(x => x.id === usuarioEditId);
      Object.assign(u, { nome, email, cargo });
      if (senha) u.senha = senha;
      showToast('Usuário atualizado', 'success');
    } else {
      DB.usuarios.push({ id: DB._nextId.usuarios++, nome, email, cargo, senha, data_cadastro: new Date().toISOString().split('T')[0] });
      showToast('Usuário cadastrado', 'success');
    }
    closeModal();
    renderUsuarios();
  }

  document.getElementById('btnNovoUsuario').addEventListener('click', () => openUsuarioModal());

  window.editUsuario = id => openUsuarioModal(id);
  window.deleteUsuario = id => {
    DB.usuarios = DB.usuarios.filter(x => x.id !== id);
    showToast('Usuário excluído', 'success');
    renderUsuarios();
  };
})();

// ============================================
// GDEM STOCK — Login com Níveis de Acesso
// ============================================
(function () {
  const loginScreen = document.getElementById('loginScreen');
  const loginBtn    = document.getElementById('loginBtn');

  function fazerLogin() {
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const senha = document.getElementById('loginSenha').value;

    const user = DB.usuarios.find(u => u.email.toLowerCase() === email && u.senha === senha);

    if (!user) {
      showToast('E-mail ou senha incorretos', 'error');
      return;
    }

    const avatar = document.querySelector('.user-avatar');
    const nameEl = document.querySelector('.user-name');
    const roleEl = document.querySelector('.user-role');
    if (avatar) avatar.textContent = user.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    if (nameEl) nameEl.textContent = user.nome;
    if (roleEl) roleEl.textContent = user.cargo;

    const navUsuarios = document.getElementById('navUsuarios');
    if (navUsuarios) {
      navUsuarios.style.display = (user.cargo === 'admin') ? '' : 'none';
    }

    loginScreen.classList.add('hidden');
    showToast('Bem-vindo, ' + user.nome.split(' ')[0] + '!', 'success');
    navigateTo('dashboard');
  }

  loginBtn.addEventListener('click', fazerLogin);
  document.getElementById('loginSenha').addEventListener('keydown', e => { if (e.key === 'Enter') fazerLogin(); });
  document.getElementById('loginEmail').addEventListener('keydown', e => { if (e.key === 'Enter') fazerLogin(); });

  window.getUsuarioLogado = (() => {
    let usuarioLogado = null;
    const _fazerLogin = fazerLogin;
    return () => usuarioLogado;
  })();

  // Expose internally
  window.getUsuarioLogado = function() {
    const avatar = document.querySelector('.user-avatar');
    if (!avatar || avatar.textContent === 'ML') return null;
    return DB.usuarios.find(u => {
      const initials = u.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
      return initials === avatar.textContent;
    }) || null;
  };
})();

// ============================================
// GDEM STOCK — Menu do Usuário (Trocar / Sair)
// ============================================
(function () {
  const badge = document.querySelector('.user-badge');
  if (!badge) return;

  badge.classList.add('user-badge-clickable');
  const caret = document.createElement('span');
  caret.className = 'user-caret';
  caret.textContent = '⌃';
  badge.appendChild(caret);

  const menu = document.createElement('div');
  menu.className = 'user-menu';
  menu.id = 'userMenu';
  menu.innerHTML = `
    <button class="user-menu-item" id="umTrocar"><span>⇄</span> Trocar de usuário</button>
    <button class="user-menu-item danger" id="umSair"><span>⏻</span> Sair</button>
  `;
  badge.parentElement.appendChild(menu);

  function abrirMenu() { menu.classList.add('open'); badge.classList.add('active'); }
  function fecharMenu() { menu.classList.remove('open'); badge.classList.remove('active'); }
  function toggleMenu(e) {
    e.stopPropagation();
    menu.classList.contains('open') ? fecharMenu() : abrirMenu();
  }

  badge.addEventListener('click', toggleMenu);

  document.addEventListener('click', e => { if (!menu.contains(e.target) && !badge.contains(e.target)) fecharMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') fecharMenu(); });

  function voltarParaLogin() {
    fecharMenu();
    const loginScreen = document.getElementById('loginScreen');
    if (loginScreen) {
      const email = document.getElementById('loginEmail');
      const senha = document.getElementById('loginSenha');
      if (email) email.value = '';
      if (senha) senha.value = '';
      loginScreen.classList.remove('hidden');
      if (email) setTimeout(() => email.focus(), 50);
    }
  }

  document.getElementById('umTrocar').addEventListener('click', () => {
    voltarParaLogin();
    showToast('Selecione outro usuário', 'success');
  });
  document.getElementById('umSair').addEventListener('click', () => {
    voltarParaLogin();
    showToast('Você saiu do sistema', 'success');
  });
})();

// ============================================
// GDEM STOCK — Buscas Inteligentes
// ============================================
(function () {
  const pageClientes = document.getElementById('page-clientes');
  const headerClientes = pageClientes.querySelector('.page-header');
  const filtroCli = document.createElement('div');
  filtroCli.className = 'filter-bar';
  filtroCli.innerHTML = `
    <input type="text" id="filterClientes" class="filter-input"
           placeholder="Buscar por nome, CPF/CNPJ, e-mail ou telefone..." />`;
  headerClientes.insertAdjacentElement('afterend', filtroCli);

  window.renderClientes = function () {
    const termo = (document.getElementById('filterClientes')?.value || '').toLowerCase().trim();
    const tbody = document.getElementById('clientes-tbody');

    const list = DB.clientes.filter(c =>
      c.nome.toLowerCase().includes(termo) ||
      (c.cpf_cnpj || '').toLowerCase().includes(termo) ||
      (c.email || '').toLowerCase().includes(termo) ||
      (c.telefone || '').toLowerCase().includes(termo)
    );

    tbody.innerHTML = list.length === 0
      ? `<tr><td colspan="6"><div class="empty-state"><div class="empty-state-icon">◉</div><p>Nenhum cliente encontrado</p></div></td></tr>`
      : list.map(c => `
        <tr>
          <td><span style="font-family:var(--font-mono);color:var(--white-dim)">#${c.id}</span></td>
          <td><strong>${c.nome}</strong></td>
          <td style="font-family:var(--font-mono);font-size:12px">${c.cpf_cnpj}</td>
          <td>${c.telefone}</td>
          <td style="font-size:12px">${c.email}</td>
          <td><div class="actions">
            <button class="btn-icon" onclick="editCliente(${c.id})">✏ Editar</button>
            <button class="btn-icon delete" onclick="deleteCliente(${c.id})">✕ Excluir</button>
          </div></td>
        </tr>`).join('');
  };

  document.getElementById('filterClientes').addEventListener('input', () => renderClientes());

  const searchInput = document.getElementById('globalSearch');
  const searchWrap = searchInput.closest('.search-wrap');

  const dropdown = document.createElement('div');
  dropdown.className = 'global-results';
  dropdown.id = 'globalResults';
  searchWrap.appendChild(dropdown);

  function isAdmin() {
    const u = (typeof getUsuarioLogado === 'function') ? getUsuarioLogado() : null;
    return u && u.cargo === 'admin';
  }

  function buscarGlobal(termo) {
    termo = termo.toLowerCase().trim();
    if (!termo) { dropdown.classList.remove('open'); dropdown.innerHTML = ''; return; }

    const produtos = DB.produtos.filter(p =>
      p.nome_produto.toLowerCase().includes(termo) ||
      (p.categoria || '').toLowerCase().includes(termo)
    ).slice(0, 5);

    const clientes = DB.clientes.filter(c =>
      c.nome.toLowerCase().includes(termo) ||
      (c.cpf_cnpj || '').toLowerCase().includes(termo) ||
      (c.email || '').toLowerCase().includes(termo)
    ).slice(0, 5);

    const usuarios = isAdmin()
      ? (DB.usuarios || []).filter(u =>
          u.nome.toLowerCase().includes(termo) ||
          (u.email || '').toLowerCase().includes(termo) ||
          (u.cargo || '').toLowerCase().includes(termo)
        ).slice(0, 5)
      : [];

    let html = '';

    if (produtos.length) {
      html += `<div class="gr-group"><div class="gr-title">Produtos</div>` +
        produtos.map(p => `
          <a class="gr-item" href="#" onclick="navigateTo('produtos');return false;">
            <span class="gr-icon">◧</span>
            <span class="gr-main"><strong>${p.nome_produto}</strong><small>${p.categoria} · ${fmt(p.preco)}</small></span>
          </a>`).join('') + `</div>`;
    }

    if (clientes.length) {
      html += `<div class="gr-group"><div class="gr-title">Clientes</div>` +
        clientes.map(c => `
          <a class="gr-item" href="#" onclick="navigateTo('clientes');return false;">
            <span class="gr-icon">◉</span>
            <span class="gr-main"><strong>${c.nome}</strong><small>${c.cpf_cnpj} · ${c.email}</small></span>
          </a>`).join('') + `</div>`;
    }

    if (usuarios.length) {
      html += `<div class="gr-group"><div class="gr-title">Usuários <span class="gr-admin">admin</span></div>` +
        usuarios.map(u => `
          <a class="gr-item" href="#" onclick="navigateTo('usuarios');return false;">
            <span class="gr-icon">◍</span>
            <span class="gr-main"><strong>${u.nome}</strong><small>${u.email} · ${u.cargo}</small></span>
          </a>`).join('') + `</div>`;
    }

    if (!html) html = `<div class="gr-empty">Nenhum resultado para "<strong>${termo}</strong>"</div>`;

    dropdown.innerHTML = html;
    dropdown.classList.add('open');
  }

  searchInput.addEventListener('input', () => buscarGlobal(searchInput.value));
  searchInput.addEventListener('focus', () => { if (searchInput.value) buscarGlobal(searchInput.value); });

  document.addEventListener('click', e => {
    if (!searchWrap.contains(e.target)) dropdown.classList.remove('open');
  });
  dropdown.addEventListener('click', e => {
    if (e.target.closest('.gr-item')) {
      dropdown.classList.remove('open');
      searchInput.value = '';
    }
  });
})();

// ============================================
// GDEM STOCK — Botão "Voltar" no Login
// ============================================
(function () {
  const loginScreen = document.getElementById('loginScreen');
  const loginCard   = loginScreen ? loginScreen.querySelector('.login-card') : null;
  if (!loginScreen || !loginCard) return;

  const btnVoltar = document.createElement('button');
  btnVoltar.id = 'loginVoltar';
  btnVoltar.className = 'login-voltar';
  btnVoltar.innerHTML = '<span>←</span> Voltar';
  loginCard.insertAdjacentElement('afterbegin', btnVoltar);

  function jaLogado() {
    return typeof getUsuarioLogado === 'function' && getUsuarioLogado();
  }

  const observer = new MutationObserver(() => {
    const visivel = !loginScreen.classList.contains('hidden');
    btnVoltar.style.display = (visivel && jaLogado()) ? 'inline-flex' : 'none';
  });
  observer.observe(loginScreen, { attributes: true, attributeFilter: ['class'] });

  btnVoltar.addEventListener('click', () => {
    if (!jaLogado()) return;
    loginScreen.classList.add('hidden');
    showToast('Troca de perfil cancelada', 'success');
  });

  btnVoltar.style.display = 'none';
})();
