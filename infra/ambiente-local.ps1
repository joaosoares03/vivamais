# Funções compartilhadas; este arquivo não contém senhas e não muda o Windows.
$ProgressPreference = 'SilentlyContinue'
$raizViva = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$apoioViva = [IO.Path]::GetFullPath((Join-Path $raizViva '..\..\work'))
$estadoViva = Join-Path $raizViva '.local\execucao'

function Obter-ConfiguracaoViva {
    $portatil = Test-Path -LiteralPath (Join-Path $apoioViva 'pg-data\PG_VERSION')
    $configuracao = @{
        JavaHome = (Join-Path $env:USERPROFILE '.jdks\ms-21.0.10')
        BancoHost = '127.0.0.1'
        BancoPorta = $(if ($portatil) { 55432 } else { 5432 })
        BancoNome = 'vivamais'
        BancoUsuario = $(if ($portatil) { 'viva' } else { 'vivamais' })
        BancoDiretorio = $(if ($portatil) { Join-Path $apoioViva 'pg-data' } else { '' })
        BancoBin = $(if ($portatil) { Join-Path $apoioViva 'pg-tools\package\native\bin' } else { '' })
        Psql = $(if (Test-Path (Join-Path $apoioViva 'pg-client\psql.exe')) { Join-Path $apoioViva 'pg-client\psql.exe' } else { 'psql' })
    }
    $arquivo = Join-Path $raizViva '.local\configuracao-local.json'
    if (Test-Path -LiteralPath $arquivo) {
        $personalizada = Get-Content -LiteralPath $arquivo -Raw | ConvertFrom-Json
        foreach ($propriedade in $personalizada.PSObject.Properties) {
            if (-not $configuracao.ContainsKey($propriedade.Name)) { throw "Configuração desconhecida: $($propriedade.Name). Não coloque senhas neste arquivo." }
            $configuracao[$propriedade.Name] = $propriedade.Value
        }
    }
    return $configuracao
}

function Selecionar-JavaViva($Configuracao) {
    $java = Join-Path $Configuracao.JavaHome 'bin\java.exe'
    if (-not (Test-Path -LiteralPath $java)) { throw 'JDK 21 não encontrado. Ajuste JavaHome em .local/configuracao-local.json; consulte o guia Windows.' }
    # Java escreve a versão em stderr; no Windows PowerShell 5.1 isso não é falha.
    $inicioJava = New-Object Diagnostics.ProcessStartInfo
    $inicioJava.FileName = $java
    $inicioJava.Arguments = '-version'
    $inicioJava.UseShellExecute = $false
    $inicioJava.CreateNoWindow = $true
    $inicioJava.RedirectStandardOutput = $true
    $inicioJava.RedirectStandardError = $true
    $processoJava = New-Object Diagnostics.Process
    $processoJava.StartInfo = $inicioJava
    try {
        if (-not $processoJava.Start()) { throw 'Não foi possível verificar o JDK.' }
        $saidaJava = $processoJava.StandardOutput.ReadToEndAsync()
        $erroJava = $processoJava.StandardError.ReadToEndAsync()
        if (-not $processoJava.WaitForExit(10000)) { $processoJava.Kill(); throw 'A verificação do JDK excedeu dez segundos.' }
        $versao = $saidaJava.GetAwaiter().GetResult() + $erroJava.GetAwaiter().GetResult()
        if ($processoJava.ExitCode -ne 0) { throw 'O executável Java não confirmou sua versão.' }
    } finally { $processoJava.Dispose() }
    if ($versao -notmatch 'version "21\.') { throw 'O backend exige Java 21. Nenhum Java global foi alterado.' }
    $env:JAVA_HOME = $Configuracao.JavaHome
    $env:PATH = "$($Configuracao.JavaHome)\bin;$env:PATH"
    if (Test-Path (Join-Path $apoioViva 'maven-home')) { $env:MAVEN_USER_HOME = Join-Path $apoioViva 'maven-home' }
}

function Testar-PortaViva([int]$Porta, [string]$Servidor = '127.0.0.1') {
    $cliente = New-Object Net.Sockets.TcpClient
    try {
        $tarefa = $cliente.BeginConnect($Servidor, $Porta, $null, $null)
        if (-not $tarefa.AsyncWaitHandle.WaitOne(2000)) { return $false }
        $cliente.EndConnect($tarefa)
        return $true
    } catch { return $false } finally { $cliente.Dispose() }
}

function Confirmar-PortaLivreViva([int]$Porta) {
    if (Testar-PortaViva $Porta) { throw "Porta $Porta ocupada. Use -Servico Verificar; não encerre um processo desconhecido. Consulte o guia." }
}

function Configurar-BackendViva($Configuracao, [switch]$NaoInterativo) {
    Selecionar-JavaViva $Configuracao
    if (-not $env:DATABASE_URL) { $env:DATABASE_URL = "jdbc:postgresql://$($Configuracao.BancoHost):$($Configuracao.BancoPorta)/$($Configuracao.BancoNome)" }
    if (-not $env:DATABASE_USER) { $env:DATABASE_USER = $Configuracao.BancoUsuario }
    if (-not $env:DATABASE_PASSWORD) {
        $arquivoPrivado = Join-Path $apoioViva 'postgres-local-credentials.json'
        if (Test-Path -LiteralPath $arquivoPrivado) {
            $credencial = Get-Content -LiteralPath $arquivoPrivado -Raw | ConvertFrom-Json
            $enderecoEsperado = "jdbc:postgresql://$($credencial.host):$($credencial.port)/$($credencial.database)"
            if ($env:DATABASE_URL -eq $enderecoEsperado -and $env:DATABASE_USER -eq $credencial.user) {
                $env:DATABASE_PASSWORD = $credencial.password
            }
            $credencial = $null
        }
        if (-not $env:DATABASE_PASSWORD) {
            if ($NaoInterativo) { throw 'Senha do banco ausente. Inicie pelo terminal para informá-la com Read-Host -AsSecureString.' }
            $segredo = Read-Host 'Senha do usuário PostgreSQL (não é a senha do login Viva+)' -AsSecureString
            $ponteiro = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($segredo)
            try { $env:DATABASE_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ponteiro) }
            finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ponteiro); $segredo.Dispose() }
        }
    }
    if (-not $env:DATABASE_PASSWORD) { throw 'Informe uma senha não vazia para o PostgreSQL.' }
    $env:PORT = '8080'
    $env:FILES_DIRECTORY = Join-Path $raizViva '.local\private-files'
    $env:FOOD_ANALYSIS_ENABLED = 'false'
    # Nunca ativar bootstrap implicitamente sobre o banco existente.
    $env:SPRING_PROFILES_ACTIVE = ''
    $env:DEMO_BOOTSTRAP_PASSWORD = ''
    if (Test-Path (Join-Path $apoioViva 'ocr-data\eng.traineddata.gz')) {
        $env:OCR_NODE_SCRIPT = Join-Path $raizViva 'infra\ocr-worker.mjs'
        $env:OCR_NODE_EXECUTABLE = (Get-Command node -ErrorAction Stop).Source
        $env:OCR_DATA_DIRECTORY = Join-Path $apoioViva 'ocr-data'
        $env:OCR_CACHE_DIRECTORY = Join-Path $raizViva '.local\ocr-cache'
    }
}

function Configurar-FrontendViva {
    $env:API_BASE_URL = 'http://127.0.0.1:8080'
    $env:APP_ORIGIN = 'http://127.0.0.1:3000'
    $env:NEXT_PUBLIC_APLICATIVO_URL = 'http://127.0.0.1:8081'
    $env:EXPO_PUBLIC_API_BASE_URL = 'http://127.0.0.1:8080'
    $env:EXPO_PUBLIC_PORTAL_URL = 'http://127.0.0.1:3000'
    $env:APP_ENV = 'development'
    $env:NEXT_TELEMETRY_DISABLED = '1'
    $temporario = Join-Path $estadoViva 'temporarios'
    New-Item -ItemType Directory -Force -Path $temporario | Out-Null
    $env:TEMP = $temporario
    $env:TMP = $temporario
}

function Confirmar-NodeViva {
    $versao = (& node --version)
    if ($LASTEXITCODE -ne 0 -or $versao -notmatch '^v(\d+)\.(\d+)\.') { throw 'Node não encontrado. Consulte o guia.' }
    $principal = [int]$Matches[1]; $secundaria = [int]$Matches[2]
    if ($principal -lt 22 -or $principal -ge 25 -or ($principal -eq 22 -and $secundaria -lt 16)) { throw 'Use Node 24 (ou >=22.16 e <25), conforme package.json. Consulte o guia.' }
    if (-not (Test-Path (Join-Path $raizViva 'node_modules\expo\bin\cli'))) { throw 'Dependências ausentes. Execute pnpm 10.28.2 install --frozen-lockfile na raiz, conforme o guia.' }
}

function Verificar-ServicosViva {
    $falhou = $false
    foreach ($alvo in @(
        @{ Nome = 'API'; Url = 'http://127.0.0.1:8080/actuator/health' },
        @{ Nome = 'Portal'; Url = 'http://127.0.0.1:3000/' },
        @{ Nome = 'Aplicativo'; Url = 'http://127.0.0.1:8081/' }
    )) {
        try {
            $resposta = Invoke-WebRequest -UseBasicParsing -Uri $alvo.Url -TimeoutSec 15
            if ($alvo.Nome -eq 'API' -and (Converter-JsonRespostaViva $resposta).status -ne 'UP') { throw 'API sem saúde' }
            Write-Host "OK $($alvo.Nome): HTTP $($resposta.StatusCode) $($alvo.Url)"
        } catch { Write-Host "INDISPONÍVEL $($alvo.Nome): $($alvo.Url)"; $falhou = $true }
    }
    if ($falhou) { throw 'Um serviço não respondeu. Consulte os terminais/logs; health não substitui os testes de login.' }
}

function Converter-JsonRespostaViva($Resposta) {
    $conteudo = $Resposta.Content
    if ($conteudo -is [byte[]]) { $conteudo = [Text.Encoding]::UTF8.GetString($conteudo) }
    return ($conteudo | ConvertFrom-Json)
}
