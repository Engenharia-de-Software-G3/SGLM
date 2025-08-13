import { db } from '../../../firebaseConfig.js';
import { v4 as uuidv4 } from 'uuid';
import { buscarClientePorCPF } from './firestoreClientes.js'; // Importa a função de busca de cliente
import { buscarPorChassi } from './firestoreVeiculos.js'; // Importa a função de busca de veículo

/**
 * Cria um novo contrato jurídico no Firestore.
 * @param {Object} dadosContrato - Objeto contendo os dados do contrato.
 * @param {string} dadosContrato.cpfCliente - CPF do cliente.
 * @param {string} dadosContrato.chassiVeiculo - Chassi do veículo.
 * @param {Object} dadosContrato.termosContrato - Termos do contrato (valor, prazo, obrigações, etc.).
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 */
export const criarContratoJuridico = async ({ cpfCliente, chassiVeiculo, termosContrato }) => {
  try {
    // 1. Buscar os dados completos do cliente e do veículo
    const clienteResult = await buscarClientePorCPF(cpfCliente);
    if (!clienteResult.success) {
      return { success: false, error: clienteResult.error };
    }
    const cliente = clienteResult.cliente;

    const veiculo = await buscarPorChassi(chassiVeiculo);
    if (!veiculo) {
      return { success: false, error: 'Veículo não encontrado.' };
    }

    // 2. Montar o objeto do contrato
    const contratoData = {
      id: uuidv4(),
      dataCriacao: new Date().toISOString(),
      status: 'ativo',
      
      // Dados do Cliente
      cliente: {
        id: cliente.id,
        nomeCompleto: cliente.nomeCompleto,
        cpf: cliente.cpf,
        contato: {
          email: cliente.email,
          telefone: cliente.telefone
        },
        
      },
      
      // Dados do Veículo
      veiculo: {
        id: veiculo.id,
        placa: veiculo.placa,
        chassi: veiculo.chassi,
        marca: veiculo.marca,
        modelo: veiculo.modelo,
        
      },

      // Termos do Contrato
      termos: termosContrato
    };

    // 3. Salvar o contrato na coleção 'contratos'
    await db.collection('contratos').doc(contratoData.id).set(contratoData);

    return { success: true, id: contratoData.id };
  } catch (error) {
    console.error('Erro ao criar contrato jurídico:', error);
    return { success: false, error: error.message };
  }
};


/**
 * Busca um contrato específico pelo seu ID.
 * @param {string} id - O ID do contrato.
 * @returns {Promise<{success: boolean, contrato?: Object, error?: string}>}
 */
export const buscarContratoPorId = async (id) => {
  try {
    const contratoRef = db.collection('contratos').doc(id);
    const doc = await contratoRef.get();

    if (!doc.exists) {
      return { success: false, error: 'Contrato não encontrado.' };
    }
    return { success: true, contrato: doc.data() };
  } catch (error) {
    console.error(`Erro ao buscar contrato ${id}:`, error);
    return { success: false, error: error.message };
  }
};