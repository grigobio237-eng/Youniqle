import { ChromaClient } from 'chromadb';
import { DefaultEmbeddingFunction } from '@chroma-core/default-embed';
import path from 'path';

// Chroma DB 클라이언트 싱글톤
let chromaClient: ChromaClient | null = null;
let collection: any = null;

/**
 * Chroma DB 클라이언트 초기화
 */
export async function initializeChromaClient() {
  if (!chromaClient) {
    try {
      // 절대 경로 사용
      const chromaPath = path.join(process.cwd(), 'chroma_db');
      console.log(`[Chroma Client] 경로: ${chromaPath}`);
      
      // ChromaDB v3.x에서는 host, port, ssl 옵션 사용
      chromaClient = new ChromaClient({
        host: 'localhost',
        port: 8000,
        ssl: false
      });

      // 기본 임베딩 함수 초기화
      const embeddingFunction = new DefaultEmbeddingFunction();

      // 컬렉션 가져오기 (이미 존재하는 컬렉션 사용)
      try {
        collection = await chromaClient.getCollection({
          name: 'youniqle_knowledge',
          embeddingFunction: embeddingFunction
        });
        console.log('✅ 기존 컬렉션 로드 완료');
      } catch (error) {
        console.log('⚠️ 컬렉션이 존재하지 않습니다. 새로 생성합니다.');
        // 컬렉션이 없으면 새로 생성
        collection = await chromaClient.createCollection({
          name: 'youniqle_knowledge',
          embeddingFunction: embeddingFunction,
          metadata: {
            description: 'Youniqle 웹사이트 지식베이스'
          }
        });
        console.log('✅ 새 컬렉션 생성 완료');
      }

      console.log('✅ Chroma DB 클라이언트 초기화 완료');
      return collection;
    } catch (error) {
      console.error('❌ Chroma DB 초기화 실패:', error);
      throw error;
    }
  }
  return collection;
}

/**
 * 벡터 검색
 */
export async function searchSimilarDocuments(
  embedding: number[],
  topK: number = 5
): Promise<any[]> {
  try {
    if (!collection) {
      await initializeChromaClient();
    }

    // 벡터 검색
    const results = await collection.query({
      queryEmbeddings: [embedding],
      nResults: topK,
      include: ['documents', 'metadatas', 'distances']
    });

    // 결과 포맷팅
    const formattedResults = results.documents[0].map((doc: string, index: number) => ({
      content: doc,
      metadata: results.metadatas[0][index],
      distance: results.distances[0][index],
      relevance: 1 - results.distances[0][index] // 거리를 관련성으로 변환
    }));

    return formattedResults;
  } catch (error) {
    console.error('❌ 벡터 검색 실패:', error);
    throw error;
  }
}

/**
 * 문서 추가
 */
export async function addDocument(
  id: string,
  text: string,
  embedding: number[],
  metadata: any
) {
  try {
    if (!collection) {
      await initializeChromaClient();
    }

    await collection.add({
      ids: [id],
      documents: [text],
      embeddings: [embedding],
      metadatas: [metadata]
    });

    console.log(`✅ 문서 추가 완료: ${id}`);
  } catch (error) {
    console.error('❌ 문서 추가 실패:', error);
    throw error;
  }
}

/**
 * 컬렉션 통계
 */
export async function getCollectionStats() {
  try {
    if (!collection) {
      await initializeChromaClient();
    }

    const count = await collection.count();
    return {
      name: collection.name,
      count,
      metadata: collection.metadata
    };
  } catch (error) {
    console.error('❌ 컬렉션 통계 조회 실패:', error);
    throw error;
  }
}

