import { AxiosInstance } from 'axios';
import {
  GetDocumentTranscriptResponse,
  KnowledgeDocument,
  KnowledgeDocumentsListQuery,
  KnowledgeFolder,
  KnowledgeFoldersListQuery,
  KnowledgeSearchHit,
  KnowledgeSearchInput,
  PagedResult,
} from '../types';

export class KnowledgeDocumentsService {
  constructor(private readonly http: AxiosInstance) {}

  async list(
    query: KnowledgeDocumentsListQuery = {}
  ): Promise<PagedResult<KnowledgeDocument>> {
    const resp = await this.http.get<PagedResult<KnowledgeDocument>>(
      '/knowledge/documents',
      { params: query }
    );
    return resp.data;
  }

  async get(id: string): Promise<KnowledgeDocument | null> {
    const resp = await this.http.get<{ item: KnowledgeDocument | null }>(
      `/knowledge/documents/${id}`
    );
    return resp.data.item;
  }

  async getTranscript(id: string): Promise<GetDocumentTranscriptResponse> {
    const resp = await this.http.get<GetDocumentTranscriptResponse>(
      `/knowledge/documents/${id}/transcript`
    );
    return resp.data;
  }
}

export class KnowledgeFoldersService {
  constructor(private readonly http: AxiosInstance) {}

  async list(
    query: KnowledgeFoldersListQuery = {}
  ): Promise<{ items: KnowledgeFolder[] }> {
    const resp = await this.http.get<{ items: KnowledgeFolder[] }>(
      '/knowledge/folders',
      { params: query }
    );
    return resp.data;
  }

  async get(id: string): Promise<KnowledgeFolder | null> {
    const resp = await this.http.get<{ item: KnowledgeFolder | null }>(
      `/knowledge/folders/${id}`
    );
    return resp.data.item;
  }
}

export class KnowledgeService {
  readonly documents: KnowledgeDocumentsService;
  readonly folders: KnowledgeFoldersService;

  constructor(private readonly http: AxiosInstance) {
    this.documents = new KnowledgeDocumentsService(http);
    this.folders = new KnowledgeFoldersService(http);
  }

  async search(input: KnowledgeSearchInput): Promise<KnowledgeSearchHit[]> {
    const resp = await this.http.post<{ items: KnowledgeSearchHit[] }>(
      '/knowledge/search',
      input
    );
    return resp.data.items;
  }
}
