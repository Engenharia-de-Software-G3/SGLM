// errorHandler.js
export class BusinessError extends Error {
  constructor(message, code = null, details = null) {
    super(message);
    this.name = 'BusinessError';
    this.code = code;
    this.details = details;
  }
}

export const errorHandler = {
  // Wrapper para operações do Firestore
  handleFirestoreOperation: async (operation, context = '') => {
    try {
      return await operation();
    } catch (error) {
      console.error(`Erro em ${context}:`, error);

      // Tratar erros específicos do Firestore
      if (error.code === 'permission-denied') {
        throw new BusinessError('Acesso negado', 'PERMISSION_DENIED');
      }

      if (error.code === 'unavailable') {
        throw new BusinessError('Serviço temporariamente indisponível', 'SERVICE_UNAVAILABLE');
      }

      // Propagar erros de negócio
      if (error instanceof BusinessError || error.name === 'ValidationError') {
        throw error;
      }

      // Erro genérico
      throw new BusinessError('Erro interno do sistema', 'INTERNAL_ERROR', error.message);
    }
  },

  // Formatar resposta de erro
  formatErrorResponse: (error) => {
    if (error instanceof BusinessError || error.name === 'ValidationError') {
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
