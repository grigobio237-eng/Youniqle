
$target = "F:\ffmpeg-2026-02-15-git-33b215d155-full_build\bin"
$current = [Environment]::GetEnvironmentVariable("Path", "User")
$current = $current -replace ";+$", "" # Remove trailing semicolons

if ($current -notlike "*$target*") {
    $newPath = "$current;$target"
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    Write-Host "SUCCESS: Added FFmpeg to User Path: $target"
} else {
    Write-Host "INFO: FFmpeg already in User Path"
}
