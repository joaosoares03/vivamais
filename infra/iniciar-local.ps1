[CmdletBinding()]
param([switch]$Producao, [switch]$Recompilar, [switch]$AguardarSinal, [switch]$SmsLocal, [switch]$Demonstracao)
$ErrorActionPreference = 'Stop'
if ($PSVersionTable.PSVersion.Major -lt 7) { throw 'Para o inicializador automático use PowerShell 7 (pwsh.exe). O guia também oferece três terminais manuais para Windows PowerShell.' }
. (Join-Path $PSScriptRoot 'ambiente-local.ps1')
$configuracaoViva = Obter-ConfiguracaoViva
if ($Demonstracao) {
    if (-not $env:PATIENT_DEMO_ORGANIZATION_ID) { throw 'Defina PATIENT_DEMO_ORGANIZATION_ID com a unidade fictícia do banco isolado antes de iniciar a demonstração.' }
    [void][guid]::Parse($env:PATIENT_DEMO_ORGANIZATION_ID)
    $env:PATIENT_DEMO_LOGIN_ENABLED = 'true'
    $env:VIVA_LOGIN_DEMONSTRACAO = 'true'
    $env:SERVER_ADDRESS = '127.0.0.1'
    $env:APP_ENV = 'development'
    # O export precisa refletir o modo escolhido; não servir um bundle antigo com outro fluxo.
    $Recompilar = $true
} else {
    $env:PATIENT_DEMO_LOGIN_ENABLED = 'false'
    $env:VIVA_LOGIN_DEMONSTRACAO = 'false'
}
Confirmar-NodeViva
foreach ($porta in @(8080, 3000, 8081)) { Confirmar-PortaLivreViva $porta }
$registro = Join-Path $estadoViva 'processos.json'
if (Test-Path -LiteralPath $registro) { throw 'Existe registro de inicialização anterior. Execute infra/encerrar-local.ps1 antes de iniciar outro conjunto; processos desconhecidos não serão encerrados.' }
$senhaAnterior = $env:DATABASE_PASSWORD
if ($SmsLocal) {
    $env:SMS_PROVIDER = 'LOCAL'
    $env:SMS_LOCAL_TEST_ENABLED = 'true'
    $env:SMS_REAL_AUTHORIZED = 'false'
    $env:APP_ENV = 'development'
}
Configurar-BackendViva $configuracaoViva
New-Item -ItemType Directory -Force -Path $estadoViva | Out-Null
$bancoIniciado = -not (Testar-PortaViva ([int]$configuracaoViva.BancoPorta) $configuracaoViva.BancoHost)
& (Join-Path $PSScriptRoot 'executar-local.ps1') -Servico Banco
$estado = @{ Raiz = $raizViva; Execucao = [guid]::NewGuid().ToString(); BancoIniciado = $bancoIniciado; Processos = @() }
$estado | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $registro -Encoding UTF8
$executavel = (Get-Process -Id $PID).Path
try {
    foreach ($servico in @('Backend', 'Portal', 'Aplicativo')) {
        if ($servico -ne 'Backend') { $env:DATABASE_PASSWORD = $null }
        $argumentos = @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', ('"' + (Join-Path $PSScriptRoot 'executar-local.ps1') + '"'), '-Servico', $servico, '-NaoInterativo')
        if ($Producao) { $argumentos += '-Producao' }
        if ($Recompilar) { $argumentos += '-Recompilar' }
        $nome = $servico.ToLowerInvariant()
        $processo = Start-Process -FilePath $executavel -ArgumentList $argumentos -WorkingDirectory $raizViva -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $estadoViva "$nome.log") -RedirectStandardError (Join-Path $estadoViva "$nome.erro.log")
        $estado.Processos += @{ Servico = $servico; Id = $processo.Id; Inicio = $processo.StartTime.ToUniversalTime().ToString('o') }
        $estado | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $registro -Encoding UTF8
        $url = @{ Backend = 'http://127.0.0.1:8080/actuator/health'; Portal = 'http://127.0.0.1:3000/'; Aplicativo = 'http://127.0.0.1:8081/' }[$servico]
        $limite = (Get-Date).AddMinutes(5)
        $pronto = $false
        Write-Host "Iniciando $servico. Logs em .local/execucao/$nome.log e $nome.erro.log…"
        do {
            if ($processo.HasExited) { throw "$servico encerrou. Consulte os logs; não copie credenciais para o chat." }
            try {
                $resposta = Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 10
                $pronto = $resposta.StatusCode -eq 200
                if ($servico -eq 'Backend') { $pronto = $pronto -and (Converter-JsonRespostaViva $resposta).status -eq 'UP' }
            } catch { $pronto = $false }
            if (-not $pronto) { Start-Sleep -Seconds 2 }
        } while (-not $pronto -and (Get-Date) -lt $limite)
        if (-not $pronto) { throw "$servico não ficou pronto em cinco minutos. Veja os logs e execute encerrar-local.ps1 antes de tentar outra vez." }
        Write-Host "OK $servico $url"
    }
    Write-Host 'Pronto. Paciente: http://127.0.0.1:8081/acesso | Profissional: http://127.0.0.1:3000'
    Write-Host 'Encerrar este conjunto: .\infra\encerrar-local.ps1. Para acompanhar mensagens, use Get-Content .local/execucao/backend.log -Tail 30 -Wait.'
    if ($AguardarSinal) {
        Write-Output 'Terminal controlador ativo. Execute infra/encerrar-local.ps1 em outro terminal para solicitar encerramento.'
        $sinal = Join-Path $estadoViva 'parada-solicitada.json'
        do {
            Start-Sleep -Seconds 2
            $solicitada = $false
            if (Test-Path -LiteralPath $sinal) {
                $solicitada = (Get-Content -LiteralPath $sinal -Raw | ConvertFrom-Json).Execucao -eq $estado.Execucao
            }
        } while (-not $solicitada)
    } else {
        Write-Host 'Mantenha este terminal aberto durante os testes. Pressione Enter aqui quando terminar para encerrar os serviços deste conjunto.'
        Read-Host 'Encerrar agora? Enter encerra; deixe aguardando para continuar usando' | Out-Null
    }
    & (Join-Path $PSScriptRoot 'encerrar-local.ps1') -NoTerminalControlador
} catch {
    $falhaControleViva = $_
    Write-Output 'Inicialização/controle interrompido. Consultar os logs privados e o registro em .local/execucao antes de repetir.'
    try { & (Join-Path $PSScriptRoot 'encerrar-local.ps1') -NoTerminalControlador }
    catch { Write-Output 'O encerramento não foi confirmado. Registro preservado; não encerrar processos desconhecidos.' }
    throw $falhaControleViva
} finally { $env:DATABASE_PASSWORD = $senhaAnterior }
