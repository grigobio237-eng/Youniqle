import re

with open('scratch/old_page.tsx', 'r', encoding='utf-16') as f:
    content = f.read()

# 1. 'clinic' 탭 시작 위치 찾기
clinic_start = content.find('<TabsContent value="clinic"')
# 퍼스널 탭이 끝나는 지점 찾기 (clinic 탭 시작 직전의 </TabsContent>)
personal_end = content.rfind('</TabsContent>', 0, clinic_start)

# 2. 이동할 블록 추출 (Step 3: 내일의 예보 부터 Step 5 끝나는 지점까지)
block_start = content.find('<div className="space-y-20 mt-20 pt-10 border-t border-line/50">', clinic_start)
forecast_idx = content.find('{/* Forecast Modal */}')

# block_end는 Forecast Modal 이전에 열려있는 div들을 닫는 위치여야 함.
# 원래 구조상, clinic 탭 안에 Step 1이 있고, 그 아래에 이동할 block이 있음.
# block 전체를 안전하게 복사하기 위해 정규식을 쓰거나 인덱스를 탐색
block_end = content.rfind('</div>', block_start, forecast_idx)
# 한 번 더 위로 올라가서 block 자체의 </div>를 찾음
block_end = content.rfind('</div>', block_start, block_end)

extracted_block = content[block_start:block_end]

# 3. 추출한 블록을 기존 위치에서 삭제
content = content[:block_start] + content[block_end:]

# 4. 추출한 블록을 personal 탭이 끝나는 위치 직전에 삽입
content = content[:personal_end] + extracted_block + '\n' + content[personal_end:]

with open('src/app/ai-navigator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('AST Move Complete')
