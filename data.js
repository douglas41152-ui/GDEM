// ============================================
// GDEM STOCK — Mock Data (data.js)
// ============================================

const DB = {
  produtos: [
    { id: 1, nome_produto: "Notebook Dell Inspiron", descricao: "Notebook i5 8GB 256SSD", categoria: "Eletrônicos", preco: 2899.90, quantidade_estoque: 3, status: "disponível", data_cadastro: "2026-01-10" },
    { id: 2, nome_produto: "Mouse Logitech MX3", descricao: "Mouse sem fio premium", categoria: "Eletrônicos", preco: 349.90, quantidade_estoque: 18, status: "disponível", data_cadastro: "2026-01-12" },
    { id: 3, nome_produto: "Caderno Universitário", descricao: "200 folhas, capa dura", categoria: "Papelaria", preco: 24.90, quantidade_estoque: 0, status: "indisponível", data_cadastro: "2026-01-14" },
    { id: 4, nome_produto: "Camisa Polo G", descricao: "Camisa polo masculina GG", categoria: "Vestuário", preco: 89.90, quantidade_estoque: 7, status: "disponível", data_cadastro: "2026-01-20" },
    { id: 5, nome_produto: "Shampoo Elseve 400ml", descricao: "Shampoo reparador", categoria: "Higiene", preco: 18.50, quantidade_estoque: 2, status: "disponível", data_cadastro: "2026-02-01" },
    { id: 6, nome_produto: "Barra de Cereal", descricao: "Barra integral sabor mel", categoria: "Alimentação", preco: 3.20, quantidade_estoque: 45, status: "disponível", data_cadastro: "2026-02-05" },
    { id: 7, nome_produto: "Teclado Mecânico RGB", descricao: "Switch Blue, USB", categoria: "Eletrônicos", preco: 289.00, quantidade_estoque: 9, status: "disponível", data_cadastro: "2026-02-10" },
    { id: 8, nome_produto: "Fone JBL Tune 500", descricao: "Fone com fio, P2", categoria: "Eletrônicos", preco: 149.90, quantidade_estoque: 1, status: "danificado", data_cadastro: "2026-02-15" },
    { id: 9, nome_produto: "Caneta BIC Cristal", descricao: "Caixa com 50 unidades", categoria: "Papelaria", preco: 29.90, quantidade_estoque: 30, status: "disponível", data_cadastro: "2026-03-01" },
    { id: 10, nome_produto: "Arroz Integral 1kg", descricao: "Tipo 1, pacote 1kg", categoria: "Alimentação", preco: 7.80, quantidade_estoque: 60, status: "disponível", data_cadastro: "2026-03-05" },
  ],

  clientes: [
    { id: 1, nome: "Ana Paula Ferreira",   cpf_cnpj: "123.456.789-00", telefone: "(61) 98001-1111", email: "ana@email.com",   endereco: "QD 10, BL A — Asa Norte, Brasília", data_cadastro: "2026-01-05" },
    { id: 2, nome: "Mercado Central LTDA", cpf_cnpj: "12.345.678/0001-90", telefone: "(61) 3201-2200", email: "compras@mercadocentral.com.br", endereco: "SHN Quadra 2 — Brasília", data_cadastro: "2026-01-10" },
    { id: 3, nome: "Carlos Eduardo Lima",  cpf_cnpj: "987.654.321-00", telefone: "(61) 99100-3344", email: "carlos@email.com", endereco: "SHCS EQ 114/214 — Asa Sul, Brasília", data_cadastro: "2026-01-20" },
    { id: 4, nome: "Loja Tech Varejo",     cpf_cnpj: "98.765.432/0001-11", telefone: "(61) 3344-5566", email: "contato@techvarejo.com.br", endereco: "Setor Comercial Norte, Brasília", data_cadastro: "2026-02-01" },
    { id: 5, nome: "Beatriz Nunes Costa",  cpf_cnpj: "321.000.111-22", telefone: "(61) 98765-4321", email: "bia.costa@gmail.com", endereco: "QE 32 — Guará II, Brasília", data_cadastro: "2026-02-18" },
  ],

  pedidos: [
    { id: 1, id_cliente: 1, id_usuario: 1, data_pedido: "2026-03-10", valor_total: 2899.90, forma_pagamento: "Cartão de Crédito", status_pedido: "finalizado" },
    { id: 2, id_cliente: 2, id_usuario: 1, data_pedido: "2026-03-14", valor_total: 1749.50, forma_pagamento: "PIX",               status_pedido: "finalizado" },
    { id: 3, id_cliente: 3, id_usuario: 1, data_pedido: "2026-03-20", valor_total: 439.80,  forma_pagamento: "Boleto",            status_pedido: "pendente"   },
    { id: 4, id_cliente: 4, id_usuario: 1, data_pedido: "2026-04-02", valor_total: 5200.00, forma_pagamento: "Cartão de Débito",  status_pedido: "pendente"   },
    { id: 5, id_cliente: 1, id_usuario: 1, data_pedido: "2026-04-10", valor_total: 89.90,   forma_pagamento: "PIX",               status_pedido: "finalizado" },
    { id: 6, id_cliente: 5, id_usuario: 1, data_pedido: "2026-04-12", valor_total: 349.90,  forma_pagamento: "PIX",               status_pedido: "cancelado"  },
    { id: 7, id_cliente: 2, id_usuario: 1, data_pedido: "2026-04-18", valor_total: 780.00,  forma_pagamento: "Cartão de Crédito", status_pedido: "pendente"   },
  ],

  movimentacoes: [
    { id: 1, id_produto: 1, tipo_movimentacao: "saída",    quantidade: 1,  data_movimentacao: "2026-03-10", observacao: "Venda pedido #1" },
    { id: 2, id_produto: 2, tipo_movimentacao: "entrada",  quantidade: 20, data_movimentacao: "2026-03-11", observacao: "Reposição de estoque" },
    { id: 3, id_produto: 3, tipo_movimentacao: "saída",    quantidade: 5,  data_movimentacao: "2026-03-14", observacao: "Venda pedido #2" },
    { id: 4, id_produto: 5, tipo_movimentacao: "saída",    quantidade: 3,  data_movimentacao: "2026-03-20", observacao: "Venda pedido #3" },
    { id: 5, id_produto: 8, tipo_movimentacao: "devolução",quantidade: 1,  data_movimentacao: "2026-04-01", observacao: "Produto danificado" },
    { id: 6, id_produto: 6, tipo_movimentacao: "entrada",  quantidade: 50, data_movimentacao: "2026-04-05", observacao: "Compra fornecedor Nestlé" },
    { id: 7, id_produto: 4, tipo_movimentacao: "saída",    quantidade: 2,  data_movimentacao: "2026-04-10", observacao: "Venda pedido #5" },
    { id: 8, id_produto: 7, tipo_movimentacao: "entrada",  quantidade: 10, data_movimentacao: "2026-04-15", observacao: "Reposição estoque teclados" },
  ],

  usuarios: [
    { id: 1, nome: "Marcos Leal",   email: "admin@gdem.com",       senha: "admin123",   cargo: "admin",    data_cadastro: "2026-01-01" },
    { id: 2, nome: "Douglas",       email: "douglas@gdem.com",     senha: "usuario123", cargo: "operador", data_cadastro: "2026-01-05" },
    { id: 3, nome: "Esther",        email: "esther@gdem.com",      senha: "usuario123", cargo: "operador", data_cadastro: "2026-01-05" },
    { id: 4, nome: "Guilherme",     email: "guilherme@gdem.com",   senha: "usuario123", cargo: "operador", data_cadastro: "2026-01-05" },
  ]
};

DB._nextId = {
  produtos: DB.produtos.length + 1,
  clientes: DB.clientes.length + 1,
  pedidos: DB.pedidos.length + 1,
  movimentacoes: DB.movimentacoes.length + 1,
  usuarios: DB.usuarios.length + 1,
};
  movimentacoes: [
    { id: 1, id_produto: 1, tipo_movimentacao: "saída",    quantidade: 1,  data_movimentacao: "2026-03-10", observacao: "Venda pedido #1" },
    { id: 2, id_produto: 2, tipo_movimentacao: "entrada",  quantidade: 20, data_movimentacao: "2026-03-11", observacao: "Reposição de estoque" },
    { id: 3, id_produto: 3, tipo_movimentacao: "saída",    quantidade: 5,  data_movimentacao: "2026-03-14", observacao: "Venda pedido #2" },
    { id: 4, id_produto: 5, tipo_movimentacao: "saída",    quantidade: 3,  data_movimentacao: "2026-03-20", observacao: "Venda pedido #3" },
    { id: 5, id_produto: 8, tipo_movimentacao: "devolução",quantidade: 1,  data_movimentacao: "2026-04-01", observacao: "Produto danificado" },
    { id: 6, id_produto: 6, tipo_movimentacao: "entrada",  quantidade: 50, data_movimentacao: "2026-04-05", observacao: "Compra fornecedor Nestlé" },
    { id: 7, id_produto: 4, tipo_movimentacao: "saída",    quantidade: 2,  data_movimentacao: "2026-04-10", observacao: "Venda pedido #5" },
    { id: 8, id_produto: 7, tipo_movimentacao: "entrada",  quantidade: 10, data_movimentacao: "2026-04-15", observacao: "Reposição estoque teclados" },
  ],

  usuarios: [
    { id: 1, nome: "Marcos Leal",   email: "admin@gdem.com",       senha: "admin123",   cargo: "admin",    data_cadastro: "2026-01-01" },
    { id: 2, nome: "Douglas",       email: "douglas@gdem.com",     senha: "usuario123", cargo: "operador", data_cadastro: "2026-01-05" },
    { id: 3, nome: "Esther",        email: "esther@gdem.com",      senha: "usuario123", cargo: "operador", data_cadastro: "2026-01-05" },
    { id: 4, nome: "Guilherme",     email: "guilherme@gdem.com",   senha: "usuario123", cargo: "operador", data_cadastro: "2026-01-05" },
  ]
};

DB._nextId = {
  produtos: DB.produtos.length + 1,
  clientes: DB.clientes.length + 1,
  pedidos: DB.pedidos.length + 1,
  movimentacoes: DB.movimentacoes.length + 1,
  usuarios: DB.usuarios.length + 1,
};
