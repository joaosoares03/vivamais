[CmdletBinding()]
param(
    [ValidateSet('Diagnostico', 'Banco', 'Backend', 'Portal', 'Aplicativo', 'Verificar')]
    [string]$Servico = 'Diagnostico',
    [switch]$Producao,
    [switch]$Recompilar,
    [switch]$NaoInterativo
)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'ambiente-local.ps1')
$configuracaoViva = Obter-ConfiguracaoViva
Push-Location $raizViva
try {
    switch ($Servico) {
        'Diagnostico' {
            Write-Host "Projeto: $raizViva"
            Write-Host "java encontrado no PATH: $((Get-Command java -ErrorAction SilentlyContinue).Source)"
            Selecionar-JavaViva $configuracaoViva
            & java -version
            & node --version
            & npm.cmd --version
            & git --version
            & '.\backend\demo\mvnw.cmd' --version
            Write-Host "PostgreSQL: $($configuracaoViva.BancoHost):$($configuracaoViva.BancoPorta), banco $($configuracaoViva.BancoNome), usuário $($configuracaoViva.BancoUsuario)"
            foreach ($porta in @([int]$configuracaoViva.BancoPorta, 8080, 3000, 8081)) { Write-Host "Porta $porta responde: $(Testar-PortaViva $porta)" }
            if (Test-Path '.\node_modules\expo\bin\cli') { & node '.\node_modules\expo\bin\cli' --version }
            Write-Host 'Nenhuma senha ou variável privada foi exibida. pnpm fixado: 10.28.2; não use npm install neste monorepo.'
        }
        'Banco' {
            if (Testar-PortaViva ([int]$configuracaoViva.BancoPorta) $configuracaoViva.BancoHost) {
                Write-Host 'Porta PostgreSQL já responde. Banco preservado; verifique credenciais com psql ou com a API.'
                break
            }
            $controle = Join-Path $configuracaoViva.BancoBin 'pg_ctl.exe'
            if (-not $configuracaoViva.BancoDiretorio -or -not (Test-Path -LiteralPath $controle)) { throw 'Inicie seu serviço PostgreSQL pelo Windows/pgAdmin. Não foi localizado um cluster portátil existente; nenhum banco foi criado.' }
            if ((Get-Content (Join-Path $configuracaoViva.BancoDiretorio 'PG_VERSION') -Raw).Trim() -ne '17') { throw 'O executável portátil deste ambiente é PostgreSQL 17. Não abrir cluster de outra versão.' }
            New-Item -ItemType Directory -Force -Path $estadoViva | Out-Null
            & $controle start -D $configuracaoViva.BancoDiretorio -o "-p $($configuracaoViva.BancoPorta) -h 127.0.0.1" -l (Join-Path $estadoViva 'postgres.log') -w -t 30
            if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL não iniciou. Consulte .local/execucao/postgres.log; nunca apague postmaster.pid sem investigar.' }
        }
        'Backend' {
            Confirmar-PortaLivreViva 8080
            Configurar-BackendViva $configuracaoViva -NaoInterativo:$NaoInterativo
            if (-not (Testar-PortaViva ([int]$configuracaoViva.BancoPorta) $configuracaoViva.BancoHost)) { throw 'Inicie o PostgreSQL antes do backend.' }
            $argumentosMaven = @('-f', 'backend/demo/pom.xml')
            if (Test-Path (Join-Path $apoioViva 'm2')) { $argumentosMaven += "-Dmaven.repo.local=$(Join-Path $apoioViva 'm2')" }
            if ($Producao) {
                $jar = Join-Path $raizViva 'backend\demo\target\viva-mais-api-0.1.0-SNAPSHOT.jar'
                if ($Recompilar -or -not (Test-Path $jar)) {
                    & '.\backend\demo\mvnw.cmd' @argumentosMaven package '-DskipTests'
                    if ($LASTEXITCODE -ne 0) { throw 'Falha ao compilar a API. Veja a primeira mensagem ERROR; nenhum teste foi alegado como executado por package -DskipTests.' }
                }
                & java '-Xmx512m' -jar $jar
            } else { & '.\backend\demo\mvnw.cmd' @argumentosMaven 'spring-boot:run' }
            if ($LASTEXITCODE -ne 0) { throw 'A API encerrou com erro. Veja o terminal ou backend.erro.log.' }
        }
        'Portal' {
            Confirmar-PortaLivreViva 3000
            Confirmar-NodeViva
            Configurar-FrontendViva
            Push-Location (Join-Path $raizViva 'web')
            try {
                $executavelNext = & node -p "require.resolve('next/dist/bin/next')"
                if ($LASTEXITCODE -ne 0 -or -not $executavelNext) { throw 'Next.js não localizado. Instale o workspace com pnpm 10.28.2 conforme o guia.' }
                if ($Producao) {
                    if ($Recompilar -or -not (Test-Path '.next\BUILD_ID')) {
                        & node $executavelNext build --webpack
                        if ($LASTEXITCODE -ne 0) { throw 'Build do portal falhou; consulte o guia para EPERM nesta sandbox.' }
                    }
                    & node $executavelNext start --hostname 127.0.0.1 --port 3000
                } else { & node $executavelNext dev --webpack --hostname 127.0.0.1 --port 3000 }
                if ($LASTEXITCODE -ne 0) { throw 'O portal encerrou com erro.' }
            } finally { Pop-Location }
        }
        'Aplicativo' {
            Confirmar-PortaLivreViva 8081
            Confirmar-NodeViva
            Configurar-FrontendViva
            if ($Producao) {
                if ($Recompilar -or -not (Test-Path 'dist\index.html')) {
                    & node 'node_modules\expo\bin\cli' export --platform web
                    if ($LASTEXITCODE -ne 0) { throw 'Export Expo falhou.' }
                }
                & node 'infra\serve-mobile-preview.mjs'
            } else { & node --dns-result-order=ipv4first 'node_modules\expo\bin\cli' start --web --localhost --port 8081 }
            if ($LASTEXITCODE -ne 0) { throw 'O aplicativo encerrou com erro.' }
        }
        'Verificar' { Verificar-ServicosViva }
    }
} finally {
    if ($Servico -eq 'Backend') { $env:DATABASE_PASSWORD = $null }
    Pop-Location
}
