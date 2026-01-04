
$gitPath = "C:\Program Files\Git\bin\git.exe"
if (-not (Test-Path $gitPath)) {
    $gitPath = "C:\Users\baran\AppData\Local\Programs\Git\bin\git.exe"
}
if (-not (Test-Path $gitPath)) {
    # Try finding in PATH
    $gitPath = (Get-Command git -ErrorAction SilentlyContinue).Source
}

if (-not $gitPath) {
    Write-Host "Git not found! Please install Git."
    exit 1
}

Write-Host "Using Git at: $gitPath"

& $gitPath config --global user.email "baranncik07@gmail.com"
& $gitPath config --global user.name "Baran"

& $gitPath add -A
& $gitPath commit -m "Fix profile page loading and image analysis bugs"
& $gitPath push origin main

Write-Host "Deployment push completed."
