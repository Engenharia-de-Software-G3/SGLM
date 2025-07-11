// functions/cliente.js
/**
 * Rota GET para listar clientes.
 * Suporta paginação e filtros por nome e tipo (PF/PJ).
 * Parâmetros de query:
 * - limite: Número de itens por página (padrão: 10)
 * - ultimoDocId: ID do último documento da página anterior (para paginação)
 * - filtros: JSON stringificado com { nome?: string, tipo?: 'PF' | 'PJ' }
 */
router.get('/', async (req, res) => {
  try {
    const { limite = '10', ultimoDocId, filtros = '{}' } = req.query;

    // Validar e parsear parâmetros
    const limiteNum = parseInt(limite) || 10;
    let filtrosParsed;
    
    try {
      filtrosParsed = JSON.parse(filtros);
    } catch {
      filtrosParsed = {};
    }

    // Recuperar último documento para paginação
    let ultimoDocSnapshot = null;
    if (ultimoDocId) {
      ultimoDocSnapshot = await db.collection('clientes').doc(ultimoDocId).get();
      if (!ultimoDocSnapshot.exists) {
        return res.status(400).json({ error: 'ultimoDocId inválido' });
      }
    }

    // Chamar função de listagem
    const { clientes, ultimoDoc } = await listarClientes({
      limite: limiteNum,
      ultimoDoc: ultimoDocSnapshot,
      filtros: filtrosParsed
    });

    // Preparar resposta
    const resposta = {
      clientes,
      paginacao: {
        possuiMais: !!ultimoDoc,
        ultimoDocId: ultimoDoc?.id || null
      }
    };

    res.status(200).json(resposta);

  } catch (error) {
    console.error('Erro na rota GET /clientes:', error);
    res.status(500).json({ 
      error: 'Erro interno no servidor',
      detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
