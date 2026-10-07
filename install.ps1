# Codyteam Universal Installer for Windows PowerShell
# Supports: Claude Code, Codex, Antigravity, Multica, OpenCode
param (
    [string]$TargetDir = "."
)

$ErrorActionPreference = "Stop"
$RepoUrl = "https://github.com/tody-agent/codyteam.git"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   Codyteam Multi-Agent Swarm (Double Diamond x ARIZ)" -ForegroundColor Cyan
Write-Host "   Zero-Trust Tri-Proof Gates & Superpowers Planning" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Installing into target directory: $TargetDir" -ForegroundColor Yellow

$tempDir = Join-Path $env:TEMP ("codyteam-install-" + [guid]::NewGuid().ToString().Substring(0,8))
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

try {
    Write-Host "Fetching latest Codyteam assets..." -ForegroundColor Gray
    git clone --depth 1 $RepoUrl $tempDir | Out-Null

    $resolvedTarget = (Resolve-Path $TargetDir).Path

    # 1. Claude Code
    Write-Host "-> Configuring Claude Code..." -ForegroundColor Green
    New-Item -ItemType Directory -Path (Join-Path $resolvedTarget ".claude\agents") -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $resolvedTarget ".claude\hooks") -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $resolvedTarget ".swarm") -Force | Out-Null
    Copy-Item (Join-Path $tempDir ".claude\agents\*") (Join-Path $resolvedTarget ".claude\agents\") -Recurse -Force
    Copy-Item (Join-Path $tempDir "hooks\*") (Join-Path $resolvedTarget ".claude\hooks\") -Recurse -Force
    Copy-Item (Join-Path $tempDir "templates\*") (Join-Path $resolvedTarget ".swarm\") -Recurse -Force

    # 2. Codex
    Write-Host "-> Configuring Codex..." -ForegroundColor Green
    New-Item -ItemType Directory -Path (Join-Path $resolvedTarget ".codex") -Force | Out-Null
    Copy-Item (Join-Path $tempDir "SWARM-SPEC.md") (Join-Path $resolvedTarget ".codex\SWARM-SPEC.md") -Force
    Copy-Item (Join-Path $tempDir "PLANNING-STANDARD.md") (Join-Path $resolvedTarget ".codex\PLANNING-STANDARD.md") -Force

    # 3. Google Antigravity
    Write-Host "-> Configuring Google Antigravity..." -ForegroundColor Green
    $antigravityDir = Join-Path $env:USERPROFILE ".gemini\config\plugins\codyteam"
    New-Item -ItemType Directory -Path $antigravityDir -Force | Out-Null
    Copy-Item (Join-Path $tempDir "*") $antigravityDir -Recurse -Force

    # 4. Multica
    Write-Host "-> Configuring Multica..." -ForegroundColor Green
    $multicaDir = Join-Path $resolvedTarget ".multica\skills\codyteam"
    New-Item -ItemType Directory -Path $multicaDir -Force | Out-Null
    Copy-Item (Join-Path $tempDir "skills\codyteam\*") $multicaDir -Recurse -Force

    # 5. OpenCode
    Write-Host "-> Configuring OpenCode..." -ForegroundColor Green
    $openCodeDir = Join-Path $resolvedTarget ".opencode\agents"
    New-Item -ItemType Directory -Path $openCodeDir -Force | Out-Null
    Copy-Item (Join-Path $tempDir ".claude\agents\*") $openCodeDir -Recurse -Force

    # 6. Root Specs & Scripts
    New-Item -ItemType Directory -Path (Join-Path $resolvedTarget "scripts") -Force | Out-Null
    Copy-Item (Join-Path $tempDir "SWARM-SPEC.md") (Join-Path $resolvedTarget "SWARM-SPEC.md") -Force
    Copy-Item (Join-Path $tempDir "PLANNING-STANDARD.md") (Join-Path $resolvedTarget "PLANNING-STANDARD.md") -Force
    Copy-Item (Join-Path $tempDir "scripts\*") (Join-Path $resolvedTarget "scripts\") -Recurse -Force

    Write-Host ""
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "✓ Codyteam successfully installed across all agent targets!" -ForegroundColor Green
    Write-Host "  - Claude Code:    .claude\agents\ & .claude\hooks\" -ForegroundColor Gray
    Write-Host "  - Codex:          .codex\" -ForegroundColor Gray
    Write-Host "  - Antigravity:    ~/.gemini/config/plugins/codyteam" -ForegroundColor Gray
    Write-Host "  - Multica:        .multica\skills\codyteam\" -ForegroundColor Gray
    Write-Host "  - OpenCode:       .opencode\agents\" -ForegroundColor Gray
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "Run verification test:  node scripts\test-hooks.mjs" -ForegroundColor Yellow
    Write-Host ""
}
finally {
    if (Test-Path $tempDir) {
        Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}
