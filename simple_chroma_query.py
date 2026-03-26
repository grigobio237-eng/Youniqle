# simple_chroma_query.py
import sys
import json

# 간단한 응답 생성 (실제 Chroma DB 없이)
def simple_query(user_query="배송 정보에 대해 알려주세요"):
    # 하드코딩된 응답 (테스트용)
    responses = {
        "배송": "배송은 전국 무료배송이며, 2-3일 내에 배송됩니다.",
        "결제": "결제 방법은 신용카드, 계좌이체, 간편결제를 지원합니다.",
        "고객": "고객 지원은 24시간 연중무휴로 운영됩니다.",
        "회원": "회원가입 시 다양한 혜택과 할인을 받을 수 있습니다."
    }
    
    # 키워드 매칭
    for keyword, response in responses.items():
        if keyword in user_query:
            result = {
                "user_query": user_query,
                "retrieved_documents": [
                    {
                        "content": response,
                        "source": f"{keyword}_info",
                        "category": "service"
                    }
                ],
                "document_count": 1
            }
            return result
    
    # 기본 응답
    result = {
        "user_query": user_query,
        "retrieved_documents": [
            {
                "content": "죄송합니다. 해당 정보를 찾을 수 없습니다.",
                "source": "default",
                "category": "general"
            }
        ],
        "document_count": 1
    }
    return result

if __name__ == "__main__":
    query = sys.argv[1] if len(sys.argv) > 1 else "배송 정보에 대해 알려주세요"
    result = simple_query(query)
    print(json.dumps(result, ensure_ascii=False))
