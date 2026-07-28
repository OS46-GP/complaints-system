import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private pgVector: any = null;
  private embeddingModel: any = null;
  private initialized = false;

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;

    const { PgVector } = await import('@mastra/pg');
    const { ModelRouterEmbeddingModel } = await import('@mastra/core/llm');
    const { embed } = await import('ai');

    this.pgVector = new PgVector({
      id: 'complaint-embeddings',
      connectionString: process.env.DATABASE_URL!,
    });

    this.embeddingModel = new ModelRouterEmbeddingModel(
      process.env.EMBEDDING_MODEL || 'google/gemini-embedding-2',
    );

    const test = await embed({
      model: this.embeddingModel,
      value: 'x',
    });
    const dimension = test.embedding.length;

    try {
      await this.pgVector.createIndex({
        indexName: 'complaint_embeddings',
        dimension,
        metric: 'cosine',
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);
      if (/already exists/i.test(message)) {
        this.logger.warn('Embedding index already exists');
      } else if (/cannot have more than \d+ dimensions/i.test(message)) {
        this.logger.warn(
          `Skipping index creation — ${message}. Vector search will use brute-force. ` +
          `To create an index manually, see https://github.com/pgvector/pgvector#indexing.`,
        );
      } else {
        this.logger.error('Failed to create embedding index', error);
        throw error;
      }
    }

    this.initialized = true;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    await this.ensureInitialized();
    const { embed } = await import('ai');
    const result = await embed({
      model: this.embeddingModel,
      value: text,
    });
    return result.embedding;
  }

  async upsertEmbedding(
    complaintId: string,
    text: string,
    departmentId: string | null,
    location: string | null,
  ): Promise<void> {
    await this.ensureInitialized();
    const vector = await this.generateEmbedding(text);
    await this.pgVector.upsert({
      indexName: 'complaint_embeddings',
      vectors: [vector],
      metadata: [{
        complaintId,
        departmentId: departmentId || '',
        location: location || '',
      }],
      ids: [complaintId],
    });
  }

  async searchSimilar(
    text: string,
    candidateIds: string[],
    topK = 5,
  ): Promise<Array<{ id: string; score: number }>> {
    if (candidateIds.length === 0) return [];
    await this.ensureInitialized();
    const queryVector = await this.generateEmbedding(text);
    const results = await this.pgVector.query({
      indexName: 'complaint_embeddings',
      queryVector,
      topK,
      filter: { complaintId: { $in: candidateIds } },
    });
    return results.map((r: { id: string; score: number }) => ({
      id: r.id,
      score: r.score,
    }));
  }

  async ensureEmbedding(
    complaintId: string,
    subject: string,
    departmentId: string | null,
    location: string | null,
  ): Promise<void> {
    await this.upsertEmbedding(complaintId, subject, departmentId, location);
  }
}
