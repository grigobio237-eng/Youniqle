import os

path = r'f:\youniqle\.env.local'
with open(path, 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

# Keep first 79 lines
new_lines = lines[:79]

# Add correct lines
new_lines.append('\n')
new_lines.append('NEXT_PUBLIC_VAPID_PUBLIC_KEY=BAsIooGg1Z7btV5X3jSpd24z65ZEV1lYXFLZwO2UjTGlKGedPxqBeQ1Ivet7gSkdZDCyrjAlZYZOlh94spr4m7Q\n')
new_lines.append('VAPID_PRIVATE_KEY=soywCD20o7hmKMc1YTj6-WoH9rIWjXMa-gq0ePjpj4Q\n')
new_lines.append('VAPID_SUBJECT=mailto:admin@grigobio.co.kr\n')
new_lines.append('CRON_SECRET=youniqle_recovery_nudge_secret_2024\n')

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Fixed .env.local")
