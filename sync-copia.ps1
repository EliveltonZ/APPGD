<#
  Sincroniza a pasta "APP - Copia" com o estado atual de "APP".

  Por que existe: as duas pastas sao clones git separados do mesmo
  repositorio remoto, mas podem estar em commits/branches diferentes e com
  alteracoes nao commitadas. Um "git pull" na Copia so traria o que ja foi
  commitado - nao traria nada que ainda esta so no disco em APP. Por isso
  este script copia os arquivos de verdade (robocopy /MIR), sem usar git.

  O que faz: espelha backend\src e frontend\src de APP para dentro de
  "APP - Copia" (cria, atualiza e REMOVE o que nao existe mais em APP).
  Fica de fora: node_modules, .git, .env e pastas do Claude Code (.claude) -
  cada pasta mantem as proprias.

  Como usar (abrir PowerShell e rodar):
      .\sync-copia.ps1
  De qualquer lugar:
      powershell -File "C:\Users\GD\Desktop\APP\sync-copia.ps1"

  Para so ver o que mudaria, sem copiar nada:
      .\sync-copia.ps1 -WhatIf
#>

param(
    [string]$Source = "C:\Users\GD\Desktop\APP",
    [string]$Dest   = "C:\Users\GD\Desktop\APP - Copia",
    [switch]$WhatIf
)

if (-not (Test-Path $Source)) { Write-Error "Pasta de origem nao encontrada: $Source"; exit 1 }
if (-not (Test-Path $Dest))   { Write-Error "Pasta de destino nao encontrada: $Dest"; exit 1 }

# Pastas espelhadas (relativas a cada raiz) e o que fica de fora de cada uma.
$pairs = @(
    @{ Rel = "backend\src";  Excl = @("node_modules", ".git") },
    @{ Rel = "frontend\src"; Excl = @("node_modules", ".git") }
)

$robocopyArgs = @("/MIR", "/NFL", "/NDL", "/NJH", "/NP")
if ($WhatIf) { $robocopyArgs += "/L" }   # /L = so lista o que mudaria, nao copia nada

$houveErro = $false

foreach ($pair in $pairs) {
    $src = Join-Path $Source $pair.Rel
    $dst = Join-Path $Dest   $pair.Rel

    if (-not (Test-Path $src)) {
        Write-Warning "Pulando (nao existe em APP): $src"
        continue
    }

    Write-Host (">> Sincronizando " + $pair.Rel + " ...") -ForegroundColor Cyan

    $xd = @()
    foreach ($e in $pair.Excl) { $xd += "/XD"; $xd += (Join-Path $src $e) }

    & robocopy $src $dst @robocopyArgs @xd | Out-Null
    # robocopy usa codigo de saida como "bitmask" de sucesso - so e erro de
    # verdade a partir de 8 (ver documentacao do robocopy). 0-7 e copia ok.
    if ($LASTEXITCODE -ge 8) {
        Write-Error ("robocopy falhou em " + $pair.Rel + " (codigo " + $LASTEXITCODE + ")")
        $houveErro = $true
    } else {
        Write-Host ("   OK (codigo robocopy " + $LASTEXITCODE + ")") -ForegroundColor Green
    }
}

if ($houveErro) {
    Write-Host "`nSincronizacao terminou com erro(s) - ver mensagens acima." -ForegroundColor Red
    exit 1
}

if ($WhatIf) {
    Write-Host "`nModo -WhatIf: nada foi copiado, so listado o que mudaria." -ForegroundColor Yellow
} else {
    Write-Host "`nSincronizacao concluida. 'APP - Copia' agora reflete o codigo atual de 'APP'." -ForegroundColor Green
    Write-Host "Se tiver um servidor (nodemon/vite) rodando na Copia, ele deve recarregar sozinho." -ForegroundColor Green
}
