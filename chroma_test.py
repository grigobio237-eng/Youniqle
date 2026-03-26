# chroma_test.py
import chromadb
import json
import os

def create_chroma_database():
    print("=== Chroma DB 초기화 ===")
    
    # Chroma 클라이언트 초기화 (로컬 파일 시스템에 저장)
    client = chromadb.PersistentClient(path="./chroma_db")
    
    # 컬렉션 생성 또는 가져오기
    collection = client.get_or_create_collection(
        name="youniqle_knowledge",
        metadata={"description": "Youniqle 웹사이트 지식베이스"}
    )
    
    print(f"✅ 컬렉션 생성 완료: {collection.name}")
    
    # 샘플 데이터 추가
    documents = [
        "우리 회사는 최신 웹3.0 기술을 활용하여 사용자 중심의 서비스를 제공합니다.",
        "제품 A는 블록체인 기반의 보안 기능을 갖추고 있습니다.",
        "고객 지원은 24시간 연중무휴로 운영됩니다.",
        "개인 정보 보호 정책은 웹사이트에서 확인할 수 있습니다.",
        "배송은 전국 무료배송이며, 2-3일 내에 배송됩니다.",
        "결제 방법은 신용카드, 계좌이체, 간편결제를 지원합니다.",
        "회원가입 시 다양한 혜택과 할인을 받을 수 있습니다.",
        "고객 문의는 이메일 또는 전화로 가능합니다."
    ]
    
    metadatas = [
        {"source": "about_us", "category": "company"},
        {"source": "product_a", "category": "product"},
        {"source": "customer_support", "category": "service"},
        {"source": "privacy_policy", "category": "policy"},
        {"source": "shipping_info", "category": "service"},
        {"source": "payment_info", "category": "service"},
        {"source": "membership", "category": "service"},
        {"source": "contact_info", "category": "contact"}
    ]
    
    ids = [f"doc_{i+1}" for i in range(len(documents))]
    
    # 문서 추가
    collection.add(
        documents=documents,
        metadatas=metadatas,
        ids=ids
    )
    
    print(f"✅ {len(documents)}개 문서 추가 완료")
    
    # 쿼리 테스트
    print("\n=== 쿼리 테스트 ===")
    query_results = collection.query(
        query_texts=["배송 정보에 대해 알려주세요"],
        n_results=3
    )
    
    print("검색 결과:")
    for i, doc in enumerate(query_results['documents'][0]):
        print(f"  {i+1}. {doc}")
        print(f"     출처: {query_results['metadatas'][0][i]['source']}")
        print(f"     카테고리: {query_results['metadatas'][0][i]['category']}")
        print()
    
    # 모든 컬렉션 목록 확인
    print("=== 모든 컬렉션 목록 ===")
    collections = client.list_collections()
    for col in collections:
        print(f"  - {col.name}: {col.metadata}")
    
    return client, collection

if __name__ == "__main__":
    try:
        client, collection = create_chroma_database()
        print("\n🎉 Chroma DB 설정 완료!")
        print(f"📁 데이터베이스 위치: {os.path.abspath('./chroma_db')}")
        print(f"📊 컬렉션: {collection.name}")
        print(f"📄 문서 수: {collection.count()}")
        
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        import traceback
        traceback.print_exc()
