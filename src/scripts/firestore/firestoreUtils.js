// databaseUtils.js - Utilitários para operações do Firestore
import { db } from '../../../firebaseConfig.js';
import { errorHandler, BusinessError } from './errorHandler.js';
import { formatters } from './validators.js';

/**
 * Utilitários para operações de banco de dados
 */
export class DatabaseUtils {
  /**
   * Executa uma consulta com paginação automática
   */
  static async paginatedQuery({
    collection,
    orderBy = null,
    where = [],
    limit = 10,
    startAfter = null,
  }) {
    let query = db.collection(collection);

    // Aplicar filtros WHERE
    where.forEach(([field, operator, value]) => {
      query = query.where(field, operator, value);
    });

    // Aplicar ordenação
    if (orderBy) {
      if (Array.isArray(orderBy[0])) {
        // Múltiplos campos de ordenação
        orderBy.forEach(([field, direction = 'asc']) => {
          query = query.orderBy(field, direction);
        });
      } else {
        // Único campo de ordenação
        const [field, direction = 'asc'] = orderBy;
        query = query.orderBy(field, direction);
      }
    }

    // Aplicar paginação
    if (startAfter) {
      query = query.startAfter(startAfter);
    }

    query = query.limit(limit);

    const snapshot = await query.get();

    return {
      docs: snapshot.docs,
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
      hasMore: snapshot.docs.length === limit,
    };
  }

  /**
   * Verifica se um documento existe
   */
  static async documentExists(collection, docId) {
    const doc = await db.collection(collection).doc(docId).get();
    return doc.exists;
  }

  /**
   * Busca documentos por campo específico
   */
  static async findByField(collection, field, value, limit = 1) {
    const snapshot = await db.collection(collection).where(field, '==', value).limit(limit).get();

    if (limit === 1) {
      return snapshot.empty
        ? null
        : {
            doc: snapshot.docs[0],
            data: snapshot.docs[0].data(),
          };
    }

    return snapshot.docs.map((doc) => ({
      doc,
      data: doc.data(),
    }));
  }

  /**
   * Atualiza documento com controle de concorrência
   */
  static async safeUpdate(docRef, updates, expectedVersion = null) {
    return db.runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef);

      if (!doc.exists) {
        throw new BusinessError('Documento não encontrado', 'DOC_NOT_FOUND');
      }

      // Verificar versão se fornecida (controle de concorrência otimista)
      if (expectedVersion && doc.data().version !== expectedVersion) {
        throw new BusinessError(
          'Documento foi modificado por outro usuário',
          'CONCURRENT_MODIFICATION',
        );
      }

      const updateData = {
        ...updates,
        dataAtualizacao: formatters.dateToISO(new Date()),
        version: (doc.data().version || 0) + 1,
      };

      transaction.update(docRef, updateData);
      return updateData.version;
    });
  }

  /**
   * Executa operação em lote com controle de erro
   */
  static async batchOperation(operations) {
    const batch = db.batch();

    operations.forEach(({ type, ref, data }) => {
      switch (type) {
        case 'set':
          batch.set(ref, data);
          break;
        case 'update':
          batch.update(ref, data);
          break;
        case 'delete':
          batch.delete(ref);
          break;
        default:
          throw new Error(`Tipo de operação inválido: ${type}`);
      }
    });

    await batch.commit();
  }

  /**
   * Conta documentos com filtros
   */
  static async countDocuments(collection, where = []) {
    let query = db.collection(collection);

    where.forEach(([field, operator, value]) => {
      query = query.where(field, operator, value);
    });

    const snapshot = await query.get();
    return snapshot.size;
  }

  /**
   * Busca texto em múltiplos campos
   */
  static async textSearch(collection, searchFields, searchTerm, limit = 50) {
    const normalizedTerm = formatters.stringForSearch(searchTerm);
    const results = [];

    // Para cada campo de busca, fazer uma consulta
    for (const field of searchFields) {
      const snapshot = await db
        .collection(collection)
        .where(field, '>=', normalizedTerm)
        .where(field, '<=', normalizedTerm + '\uf8ff')
        .limit(limit)
        .get();

      snapshot.docs.forEach((doc) => {
        if (!results.find((r) => r.id === doc.id)) {
          results.push({
            id: doc.id,
            data: doc.data(),
            matchField: field,
          });
        }
      });
    }

    return results.slice(0, limit);
  }

  /**
   * Executa migração de dados
   */
  static async migrateData(collection, migrationFn, batchSize = 100) {
    let lastDoc = null;
    let processedCount = 0;

    do {
      let query = db.collection(collection).limit(batchSize);

      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }

      const snapshot = await query.get();

      if (snapshot.empty) break;

      const batch = db.batch();

      for (const doc of snapshot.docs) {
        const migratedData = await migrationFn(doc.data());
        if (migratedData) {
          batch.update(doc.ref, migratedData);
        }
      }

      await batch.commit();

      processedCount += snapshot.docs.length;
      lastDoc = snapshot.docs[snapshot.docs.length - 1];

      console.log(`Migrados ${processedCount} documentos...`);
    } while (lastDoc);

    return processedCount;
  }
}

/**
 * Cache em memória para consultas frequentes
 */
export class MemoryCache {
  constructor(ttlMinutes = 5) {
    this.cache = new Map();
    this.ttl = ttlMinutes * 60 * 1000; // Converter para milissegundos
  }

  /**
   * Armazena item no cache
   */
  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  /**
   * Recupera item do cache
   */
  get(key) {
    const item = this.cache.get(key);

    if (!item) return null;

    // Verificar se expirou
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Remove item do cache
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * Limpa todo o cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Remove itens expirados
   */
  cleanup() {
    const now = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Executa função com cache
   */
  async withCache(key, asyncFn) {
    // Tentar buscar do cache primeiro
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    // Executar função e cachear resultado
    const result = await asyncFn();
    this.set(key, result);

    return result;
  }
}

/**
 * Monitor de performance para consultas
 */
export class QueryMonitor {
  constructor() {
    this.queries = [];
    this.slowQueryThreshold = 1000; // 1 segundo
  }

  /**
   * Monitora execução de consulta
   */
  async monitor(queryName, queryFn) {
    const startTime = Date.now();

    try {
      const result = await queryFn();
      const duration = Date.now() - startTime;

      this.logQuery(queryName, duration, true);

      if (duration > this.slowQueryThreshold) {
        console.warn(`Consulta lenta detectada: ${queryName} (${duration}ms)`);
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logQuery(queryName, duration, false, error.message);
      throw error;
    }
  }

  /**
   * Registra estatísticas da consulta
   */
  logQuery(name, duration, success, error = null) {
    this.queries.push({
      name,
      duration,
      success,
      error,
      timestamp: new Date().toISOString(),
    });

    // Manter apenas as últimas 1000 consultas
    if (this.queries.length > 1000) {
      this.queries = this.queries.slice(-1000);
    }
  }

  /**
   * Gera relatório de performance
   */
  getPerformanceReport() {
    const totalQueries = this.queries.length;
    const successfulQueries = this.queries.filter((q) => q.success).length;
    const failedQueries = totalQueries - successfulQueries;

    const durations = this.queries.map((q) => q.duration);
    const avgDuration =
      durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / durations.length : 0;

    const slowQueries = this.queries.filter((q) => q.duration > this.slowQueryThreshold);

    return {
      totalQueries,
      successfulQueries,
      failedQueries,
      successRate: totalQueries > 0 ? (successfulQueries / totalQueries) * 100 : 0,
      avgDuration: Math.round(avgDuration),
      slowQueries: slowQueries.length,
      slowestQueries: slowQueries
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 10)
        .map((q) => ({ name: q.name, duration: q.duration })),
    };
  }
}

// Instâncias globais
export const memoryCache = new MemoryCache(5); // 5 minutos de TTL
export const queryMonitor = new QueryMonitor();

// Limpeza automática do cache a cada 10 minutos
setInterval(
  () => {
    memoryCache.cleanup();
  },
  10 * 60 * 1000,
);
