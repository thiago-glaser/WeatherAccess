<#
.SYNOPSIS
    Deploys the WeatherAccess application to a remote server by building the Docker image
    directly on the server (no Docker Hub required).

.EXAMPLE (full deploy - uploads source + builds on server)
    .\deploy.ps1 `
      -RemoteUser <ssh-user> `
      -RemoteHost <server-hostname> `
      -SshKeyPath "<path-to-ssh-key>"

.EXAMPLE (skip re-uploading certs/wallet/env - faster redeploy when only code changed)
    .\deploy.ps1 `
      -RemoteUser <ssh-user> `
      -RemoteHost <server-hostname> `
      -SshKeyPath "<path-to-ssh-key>" `
      -SkipRuntimeFiles
#>
param(
    [Parameter(Mandatory)][string]$RemoteUser,
    [Parameter(Mandatory)][string]$RemoteHost,
    [Parameter(Mandatory)][string]$SshKeyPath,
    [string]$ImageName = "weatheraccess",
    [string]$Tag = "latest",
    [string]$RemoteDir = "~/WeatherAccess",
    [switch]$SkipRuntimeFiles  # skip certs/wallet/env upload (already on server)
)

$LocalDir = $PSScriptRoot

function TS { Get-Date -Format '[HH:mm:ss]' }
function Write-Step {
    param($msg)
    Write-Host ""
    Write-Host "$(TS) ------------------------------------------" -ForegroundColor DarkGray
    Write-Host "$(TS)   $msg" -ForegroundColor Cyan
    Write-Host "$(TS) ------------------------------------------" -ForegroundColor DarkGray
}
function Write-OK { param($msg) Write-Host "$(TS) [OK]   $msg" -ForegroundColor Green }
function Write-Warn { param($msg) Write-Host "$(TS) [WARN] $msg" -ForegroundColor Yellow }
function Write-Fail { param($msg) Write-Host "$(TS) [FAIL] $msg" -ForegroundColor Red }

function Invoke-SSH {
    param([string]$Cmd)
    & ssh -n -i $script:LocalKeyPath `
        -o StrictHostKeyChecking=no `
        -o BatchMode=yes `
        -o ConnectTimeout=15 `
        -o ServerAliveInterval=10 `
        -o ServerAliveCountMax=3 `
        "$RemoteUser@$RemoteHost" $Cmd
}
function Invoke-SCP {
    param([string]$Src, [string]$Dst, [switch]$Recurse)
    $scpArgs = @(
        "-i", $script:LocalKeyPath,
        "-o", "StrictHostKeyChecking=no",
        "-o", "BatchMode=yes",
        "-o", "ConnectTimeout=15"
    )
    if ($Recurse) { $scpArgs += "-r" }
    $scpArgs += $Src, "${RemoteUser}@${RemoteHost}:${Dst}"
    & scp @scpArgs
}

# ============================================================
Write-Step "Preflight checks"
# ============================================================

foreach ($tool in @("ssh", "scp", "docker", "tar")) {
    if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
        Write-Fail "$tool not found in PATH."
        exit 1
    }
}
Write-OK "ssh, scp, docker, tar available"

if (-not (Test-Path $SshKeyPath)) { Write-Fail "SSH key not found: $SshKeyPath"; exit 1 }
Write-OK "SSH key found"

# Stage key to ~/.ssh/
$sshDir = Join-Path $env:USERPROFILE ".ssh"
$safeKeyName = "deploy_${RemoteHost}.key"
$script:LocalKeyPath = Join-Path $sshDir $safeKeyName

if (-not (Test-Path $sshDir)) { New-Item -ItemType Directory -Path $sshDir | Out-Null }

if (Test-Path $script:LocalKeyPath) {
    icacls $script:LocalKeyPath /grant:r "${env:USERNAME}:(F)" | Out-Null
}
Copy-Item -Path $SshKeyPath -Destination $script:LocalKeyPath -Force
icacls $script:LocalKeyPath /inheritance:r /grant:r "${env:USERNAME}:(R)" | Out-Null
Write-OK "Key staged at ~/.ssh/$safeKeyName"

# Pre-flight: verify SSH works
Write-Host "    Testing SSH connection to $RemoteHost ..." -ForegroundColor DarkGray
$connected = $false
for ($attempt = 1; $attempt -le 3; $attempt++) {
    & ssh -n -i $script:LocalKeyPath `
        -o StrictHostKeyChecking=no `
        -o BatchMode=yes `
        -o ConnectTimeout=10 `
        "$RemoteUser@$RemoteHost" "echo ok" 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) { $connected = $true; break }
    Write-Warn "SSH attempt $attempt/3 failed (exit $LASTEXITCODE) - retrying in 3s ..."
    Start-Sleep -Seconds 3
}
if (-not $connected) {
    Write-Fail "Cannot connect to $RemoteHost after 3 attempts."
    exit 1
}
Write-OK "SSH connection verified"

# ============================================================
Write-Step "Step 1 - Create remote directory structure"
# ============================================================

Invoke-SSH "mkdir -p $RemoteDir/oracle_wallet"
if ($LASTEXITCODE -ne 0) { Write-Fail "Cannot create remote dirs. Check SSH access."; exit 1 }
Write-OK "Remote directories ready"

# ============================================================
# Runtime-mounted files
# ============================================================

if (-not $SkipRuntimeFiles) {

    Write-Step "Step 2 - Upload .env"
    $envFile = Join-Path $LocalDir ".env"
    if (-not (Test-Path $envFile)) { Write-Fail ".env not found"; exit 1 }
    Invoke-SCP -Src $envFile -Dst "$RemoteDir/"
    if ($LASTEXITCODE -ne 0) { Write-Fail "Failed to upload .env"; exit 1 }
    Write-OK ".env uploaded"

    Write-Step "Step 3 - Upload Oracle Wallet (Compressed)"
    $walletDir = "oracle_wallet"
    $localWalletPath = Join-Path $LocalDir $walletDir
    if (Test-Path $localWalletPath) {
        $tempWalletArchive = Join-Path $env:TEMP "oracle_wallet_weather.tar.gz"
        $remoteWalletArchive = "/tmp/oracle_wallet_weather.tar.gz"

        Write-Host "    Archiving Oracle wallet..." -ForegroundColor DarkGray
        & tar -czf $tempWalletArchive -C $LocalDir $walletDir
        if ($LASTEXITCODE -ne 0) { Write-Fail "Failed to archive Oracle wallet"; exit 1 }

        Write-Host "    Uploading Oracle wallet archive..." -ForegroundColor DarkGray
        Invoke-SCP -Src $tempWalletArchive -Dst $remoteWalletArchive
        if ($LASTEXITCODE -ne 0) { Write-Fail "Failed to upload Oracle wallet archive"; exit 1 }

        Write-Host "    Extracting Oracle wallet on server..." -ForegroundColor DarkGray
        Invoke-SSH "tar -xzf $remoteWalletArchive -C $RemoteDir && rm -f $remoteWalletArchive"
        if ($LASTEXITCODE -ne 0) { Write-Fail "Failed to extract Oracle wallet on server"; exit 1 }

        Remove-Item $tempWalletArchive -Force
        Write-OK "Oracle wallet uploaded and extracted"
    }
}

# ============================================================
Write-Step "Step 4 - Upload source code for server-side build"
# ============================================================

$SrcDir = $RemoteDir + "/src"
$TarFile = "/tmp/weatheraccess-src.tar.gz"
$localTar = Join-Path $env:TEMP "weatheraccess-src.tar.gz"

Write-Host "    Creating archive of source files ..." -ForegroundColor DarkGray
$excludes = @(
    "--exclude=node_modules",
    "--exclude=.next",
    "--exclude=.git",
    "--exclude=oracle_wallet",
    "--exclude=.env*"
)
& tar -czf $localTar @excludes -C $LocalDir .
if ($LASTEXITCODE -ne 0) { Write-Fail "tar failed."; exit 1 }

Write-Host "    Uploading archive to server ..." -ForegroundColor DarkGray
Invoke-SCP -Src $localTar -Dst $TarFile
if ($LASTEXITCODE -ne 0) { Write-Fail "Failed to upload source archive"; exit 1 }
Remove-Item $localTar -Force
Write-OK "Archive uploaded"

# ============================================================
Write-Step "Step 5 - Build Docker image on server"
# ============================================================

$buildCmd = "set -e" +
"; rm -rf $SrcDir" +
"; mkdir -p $SrcDir" +
"; cd $SrcDir" +
"; tar -xzf $TarFile" +
"; docker build -t ${ImageName}:${Tag} ." +
"; rm -f $TarFile"
Invoke-SSH $buildCmd
if ($LASTEXITCODE -ne 0) { Write-Fail "Remote docker build failed"; exit 1 }
Write-OK "Image built on server: ${ImageName}:${Tag}"

# ============================================================
Write-Step "Step 6 - Start container via Proxy Deploy"
# ============================================================

$ProxyDeployScript = "C:\code\proxy\deploy.ps1"

if (Test-Path $ProxyDeployScript) {
    Write-Host "    Delegating to Proxy deployment script..." -ForegroundColor DarkGray
    & $ProxyDeployScript -RemoteUser $RemoteUser -RemoteHost $RemoteHost -SshKeyPath $SshKeyPath -LogContainer weatheraccess-web
    if ($LASTEXITCODE -ne 0) { Write-Fail "Proxy deploy failed"; exit 1 }
}
else {
    Write-Fail "Could not find proxy deploy script at $ProxyDeployScript"
    exit 1
}
