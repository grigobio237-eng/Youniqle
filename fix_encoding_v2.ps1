$content = Get-Content 'f:\youniqle\src\lib\ai\gemini-engine.ts' -Encoding utf8
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllLines('f:\youniqle\src\lib\ai\gemini-engine.ts', $content, $utf8NoBom)
