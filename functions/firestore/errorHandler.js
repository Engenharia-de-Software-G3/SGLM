// errorHandler.js
export class ErroDeNegocio extends Error {
  constructor(message, code = null, details = null) {
    super(message);
    this.name = 'BusinessError';
    this.code = code;
    this.details = details;
  }
}

export const tratadorDeErros = {
  // Wrapper para operações do Firestore
  executarOperacaoFirestore: async (operation, context = '') => {
    try {
      return await operation();
    } catch (error) {
      console.error(`Erro em ${context}:`, error);

      // Tratar erros específicos do Firestore
      if (error.code === 'permission-denied') {
        throw new ErroDeNegocio('Acesso negado', 'PERMISSION_DENIED');
      }

      if (error.code === 'unavailable') {
        throw new ErroDeNegocio('Serviço temporariamente indisponível', 'SERVICE_UNAVAILABLE');
      }

      // Propagar erros de negócio
      if (error instanceof ErroDeNegocio || error.name === 'ValidationError') {
        throw error;
      }

      // Erro genérico
      throw new ErroDeNegocio('Erro interno do sistema', 'INTERNAL_ERROR', error.message);
    }
  },

  // Formatar resposta de erro
  formatarRespostaDeErro: (error) => {
    if (error instanceof ErroDeNegocio || error.name === 'ValidationError') {
      return {
        success: false,
        error: error.message,
        code: error.code || 'VALIDATION_ERROR',
        field: error.field || null,
      };
    }

    return {
      success: false,
      error: 'Erro interno do sistema',
      code: 'INTERNAL_ERROR',
    };
  },
};
