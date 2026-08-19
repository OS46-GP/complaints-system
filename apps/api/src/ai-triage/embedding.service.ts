import { Injectable, Logger } from '@nestjs/common';
import { resolveEmbeddingModel } from '../common/llm/model-provider';

export function buildEmbeddingText(
  subject: string,
  annotation?: string | null,
): string {
  return [subject, annotation].filter(Boolean).join(' ');
}

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private pgVector: any = null;
  private embeddingModel: any = null;
  private initialized = false;

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;

    const { PgVector } = await import('@mastra/pg');
    const { embed } = await import('ai');

    this.pgVector = new PgVector({
      id: 'complaint-embeddings',
      connectionString: process.env.DATABASE_URL!,
      // Runtime-managed schema, outside Prisma's scope (Prisma manages only
      // "public"; see prisma/schema.prisma datasource) — keeps migrate clean.
      schemaName: 'embeddings',
    });

    this.embeddingModel = resolveEmbeddingModel(process.env.EMBEDDING_MODEL);

    const test = await embed({
      model: this.embeddingModel,
      value: 'x',
    });
    const dimension = test.embedding.length;

    // If an embedding table exists with a different dimension (e.g. switching
    // from a 3072-dim Gemini model to a 1024-dim Bedrock model), drop it so the
    // index is recreated with the correct dimension. Embeddings are derived
    // data — they can always be regenerated via the reindex endpoint.
    try {
      const existing = await this.pgVector.describeIndex({
        indexName: 'complaint_embeddings',
      });
      if (existing && existing.dimension !== dimension) {
        this.logger.warn(
          `Embedding dimension changed (${existing.dimension} -> ${dimension}). ` +
            `Dropping complaint_embeddings; embeddings must be re-indexed.`,
        );
        await this.pgVector.deleteIndex({ indexName: 'complaint_embeddings' });
      }
    } catch {
      // Table does not exist yet — first run.
    }

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
