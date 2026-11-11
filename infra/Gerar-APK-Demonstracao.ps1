[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][string]$AndroidSdk,
    [Parameter(Mandatory=$true)][string]$CacheGradle,
    [Parameter(Mandatory=$true)][string]$DiretorioCmake,
    [ValidateSet('arm64-v8a','x86_64')][string]$Arquitetura='arm64-v8a',
    [string]$EnderecoApi='http://127.0.0.1:8080',
    [string]$DiretorioAssinatura,
    [switch]$PrepararProjeto
)
$ErrorActionPreference='Stop'
$uriApi=$null
if(-not [Uri]::TryCreate($EnderecoApi,[UriKind]::Absolute,[ref]$uriApi) -or $uriApi.Scheme -ne 'http' -or
    $uriApi.UserInfo -or $uriApi.Query -or $uriApi.Fragment -or $uriApi.AbsolutePath -ne '/') {
    throw 'Use somente http://127.0.0.1:8080 ou http://IPv4_PRIVADO:8083, sem caminho, credenciais ou parâmetros.'
}
$redeTeste=$EnderecoApi -ne 'http://127.0.0.1:8080'
if($redeTeste) {
    $partesIp=$uriApi.Host.Split('.')
    if($EnderecoApi -notmatch '^http://(?:0|[1-9][0-9]{0,2})(?:\.(?:0|[1-9][0-9]{0,2})){3}:8083$' -or
        $uriApi.Port -ne 8083 -or $uriApi.Host -notmatch '^(?:0|[1-9][0-9]{0,2})(?:\.(?:0|[1-9][0-9]{0,2})){3}$' -or
        @($partesIp | Where-Object {[int]$_ -gt 255}).Count -gt 0 -or -not (
        [int]$partesIp[0] -eq 10 -or ([int]$partesIp[0] -eq 172 -and [int]$partesIp[1] -ge 16 -and [int]$partesIp[1] -le 31) -or
        ([int]$partesIp[0] -eq 192 -and [int]$partesIp[1] -eq 168))) {
        throw 'O APK de rede exige IPv4 privado literal e porta8083. Não usar endereço público, hostname, túnel ou wildcard.'
    }
}
if($PSVersionTable.PSVersion.Major -lt 7){throw 'Use PowerShell 7 (pwsh.exe), conforme o guia local do projeto.'}
. (Join-Path $PSScriptRoot 'ambiente-local.ps1')
Selecionar-JavaViva (Obter-ConfiguracaoViva)
$AndroidSdk=[IO.Path]::GetFullPath($AndroidSdk)
$CacheGradle=[IO.Path]::GetFullPath($CacheGradle)
$DiretorioCmake=[IO.Path]::GetFullPath($DiretorioCmake)
if (-not $DiretorioAssinatura) { $DiretorioAssinatura=Join-Path $apoioViva 'assinatura-android-teste' }
$DiretorioAssinatura=[IO.Path]::GetFullPath($DiretorioAssinatura)
if ($DiretorioAssinatura.StartsWith($raizViva+[IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase) -and
    -not $DiretorioAssinatura.StartsWith((Join-Path $raizViva '.local')+[IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase)) {
    throw 'Guarde a assinatura fora das fontes versionáveis, em pasta privada.'
}
foreach ($ferramenta in @('platforms/android-36/android.jar','build-tools/36.0.0/apksigner.bat','build-tools/36.0.0/zipalign.exe','cmake/3.22.1/bin/ninja.exe','ndk/27.1.12297006/source.properties')) {
    if (-not (Test-Path -LiteralPath (Join-Path $AndroidSdk $ferramenta))) { throw 'SDK incompleto. Instale os componentes do guia após aceitar os termos oficiais.' }
}
$versaoNinja=(& (Join-Path $AndroidSdk 'cmake/3.22.1/bin/ninja.exe') --version | Out-String).Trim()
if ([version]$versaoNinja -lt [version]'1.12.0') { throw 'Use Ninja 1.12+ no SDK local; veja o guia Windows. Não alterar o registro do Windows.' }
if ($CacheGradle.Length -gt 32 -or $DiretorioCmake.Length -gt 32) { throw 'Use cache Gradle e raiz CMake de até32 caracteres, dentro da pasta de trabalho. Os headers/objetos nativos excedem MAX_PATH em caminhos maiores.' }
$variaveis=@('TEMP','TMP','ANDROID_HOME','ANDROID_SDK_ROOT','ANDROID_USER_HOME','GRADLE_USER_HOME','APP_ENV','VIVA_ACESSO_TESTADORES','VIVA_ATUALIZACOES','VIVA_LOGIN_DEMONSTRACAO','VIVA_ANDROID_APPLICATION_ID','VIVA_IOS_BUNDLE_IDENTIFIER','EXPO_PUBLIC_API_BASE_URL','EXPO_NO_TELEMETRY','VIVA_FONTE_APLICATIVO','VIVA_CMAKE_STAGING','VIVA_KEYSTORE_PASSWORD','VIVA_KEYSTORE_ALIAS','VIVA_KEYSTORE_FILE')
$anteriores=@{}; foreach($nome in $variaveis) { $anteriores[$nome]=[Environment]::GetEnvironmentVariable($nome,'Process') }
Push-Location $raizViva
try {
    $temporarioBuild=Join-Path $estadoViva 'temporarios'
    [IO.Directory]::CreateDirectory($temporarioBuild) | Out-Null
    $env:TEMP=$temporarioBuild;$env:TMP=$temporarioBuild
    $env:ANDROID_HOME=$AndroidSdk;$env:ANDROID_SDK_ROOT=$AndroidSdk
    $env:ANDROID_USER_HOME=Join-Path $apoioViva 'android-user';$env:GRADLE_USER_HOME=$CacheGradle
    $env:APP_ENV='development';$env:VIVA_LOGIN_DEMONSTRACAO='true';$env:VIVA_ACESSO_TESTADORES='false';$env:VIVA_ATUALIZACOES='false'
    $env:VIVA_ANDROID_APPLICATION_ID='org.vivamais.academicdemo.local'
    $env:VIVA_IOS_BUNDLE_IDENTIFIER='org.vivamais.academicdemo.local'
    $env:EXPO_PUBLIC_API_BASE_URL=$EnderecoApi;$env:EXPO_NO_TELEMETRY='1'
    $env:VIVA_FONTE_APLICATIVO=$raizViva
    # O prefab gerado inclui caminhos absolutos. Não reutilizar CMake de outro cache Gradle.
    $geradorHash=[Security.Cryptography.SHA256]::Create()
    try { $idCache=([BitConverter]::ToString($geradorHash.ComputeHash([Text.Encoding]::UTF8.GetBytes($CacheGradle+'|'+$AndroidSdk+'|'+$raizViva)))).Replace('-','').Substring(0,8).ToLowerInvariant() } finally {$geradorHash.Dispose()}
    $env:VIVA_CMAKE_STAGING=Join-Path $DiretorioCmake $idCache
    $android=Join-Path $raizViva '.local/apk/android'
    if ($PrepararProjeto -or -not (Test-Path -LiteralPath (Join-Path $android 'gradlew.bat'))) {
        & node (Join-Path $PSScriptRoot 'preparar-entrada-android.cjs')
        if ($LASTEXITCODE -ne 0) { throw 'Preparação Android falhou.' }
        Push-Location (Join-Path $raizViva '.local/apk')
        try { & node (Join-Path $raizViva 'node_modules/expo/bin/cli') prebuild --platform android --no-install; if($LASTEXITCODE -ne 0){throw 'Prebuild Android falhou.'} } finally {Pop-Location}
    }
    # HTTP apenas para o host explícito do teste; nenhuma exceção é aplicada aos builds de loja.
    $pastaXml=Join-Path $android 'app/src/main/res/xml'
    [IO.Directory]::CreateDirectory($pastaXml) | Out-Null
    [IO.File]::WriteAllText((Join-Path $pastaXml 'viva_rede_teste.xml'),
        ('<?xml version="1.0" encoding="utf-8"?><network-security-config><base-config cleartextTrafficPermitted="false"/><domain-config cleartextTrafficPermitted="true"><domain includeSubdomains="false">'+$uriApi.Host+'</domain></domain-config></network-security-config>'))
    $arquivoManifesto=Join-Path $android 'app/src/main/AndroidManifest.xml'
    [xml]$manifesto=[IO.File]::ReadAllText($arquivoManifesto)
    $manifesto.manifest.application.SetAttribute('networkSecurityConfig','http://schemas.android.com/apk/res/android','@xml/viva_rede_teste') | Out-Null
    $manifesto.Save($arquivoManifesto)
    New-Item -ItemType Directory -Path $DiretorioAssinatura -Force | Out-Null
    $arquivoCredencial=Join-Path $DiretorioAssinatura 'credencial-privada.json'
    if (-not (Test-Path -LiteralPath $arquivoCredencial)) {
        $bytes=New-Object byte[] 32;$gerador=[Security.Cryptography.RandomNumberGenerator]::Create()
        try {$gerador.GetBytes($bytes)} finally {$gerador.Dispose()}
        [IO.File]::WriteAllText($arquivoCredencial,(@{senha=[Convert]::ToBase64String($bytes);alias='viva-local'} | ConvertTo-Json))
    }
    $credencial=Get-Content -LiteralPath $arquivoCredencial -Raw|ConvertFrom-Json
    $env:VIVA_KEYSTORE_PASSWORD=$credencial.senha;$env:VIVA_KEYSTORE_ALIAS=$credencial.alias
    $env:VIVA_KEYSTORE_FILE=Join-Path $DiretorioAssinatura 'viva-local.jks'
    New-Item -ItemType Directory -Path $estadoViva -Force | Out-Null
    if (-not (Test-Path -LiteralPath $env:VIVA_KEYSTORE_FILE)) {
        & (Join-Path $env:JAVA_HOME 'bin/keytool.exe') -genkeypair -keystore $env:VIVA_KEYSTORE_FILE -storetype JKS -storepass:env VIVA_KEYSTORE_PASSWORD -keypass:env VIVA_KEYSTORE_PASSWORD -alias $credencial.alias -keyalg RSA -keysize 3072 -validity 10950 -dname 'CN=Viva Mais Demo Local,OU=Testes Academicos,O=Viva Mais,C=BR' *> (Join-Path $estadoViva 'android-assinatura.log')
        if ($LASTEXITCODE -ne 0) { throw 'Falha ao gerar assinatura exclusiva de testes.' }
    }
    $arquivoGradle=Join-Path $android 'app/build.gradle';$texto=[IO.File]::ReadAllText($arquivoGradle)
    $texto=$texto.Replace('def projectRoot = rootDir.getAbsoluteFile().getParentFile().getAbsolutePath()','def projectRoot = System.getenv("VIVA_FONTE_APLICATIVO")')
    if($texto -notmatch 'root = file\(projectRoot\)'){$texto=$texto.Replace('react {',"react {`n    root = file(projectRoot)")}
    if($texto -notmatch 'ASSINATURA_EXCLUSIVA_VIVA_LOCAL') {
        $texto+=@'

// ASSINATURA_EXCLUSIVA_VIVA_LOCAL: artefato interno com chave privada de teste.
android {
    signingConfigs { vivaLocal {
        storeFile file(System.getenv("VIVA_KEYSTORE_FILE"))
        storePassword System.getenv("VIVA_KEYSTORE_PASSWORD")
        keyAlias System.getenv("VIVA_KEYSTORE_ALIAS")
        keyPassword System.getenv("VIVA_KEYSTORE_PASSWORD")
    } }
    buildTypes { release { signingConfig signingConfigs.vivaLocal } }
}
'@
    }
    [IO.File]::WriteAllText($arquivoGradle,$texto)
    $raizGradle=Join-Path $android 'build.gradle';$texto=[IO.File]::ReadAllText($raizGradle)
    if($texto -match '(?s)// VIVA_CMAKE_CURTO.*?\napply plugin:') {
        $texto=[regex]::Replace($texto,'(?s)// VIVA_CMAKE_CURTO.*?\n(?=apply plugin:)','')
    }
    $bloco=@'
// VIVA_CMAKE_CURTO: diretórios gerados separados por módulo, configurados antes dos plugins raiz.
subprojects { projeto ->
    ["com.android.library", "com.android.application"].each { identificador ->
        projeto.plugins.withId(identificador) {
            projeto.extensions.getByName("android").externalNativeBuild.cmake.buildStagingDirectory = new File(System.getenv("VIVA_CMAKE_STAGING"), projeto.name == "app" ? "a" : projeto.name)
        }
    }
}

'@
    $texto=$texto.Replace('apply plugin: "expo-root-project"',$bloco+'apply plugin: "expo-root-project"')
    [IO.File]::WriteAllText($raizGradle,$texto)
    $arquivoWrapper=Join-Path $android 'gradle/wrapper/gradle-wrapper.properties';$wrapper=[IO.File]::ReadAllText($arquivoWrapper)
    if($wrapper -notmatch 'gradle-9\.3\.1-bin.zip'){throw 'Versão Gradle mudou; revisar checksum antes do download.'}
    $wrapper=$wrapper.Replace('networkTimeout=10000','networkTimeout=120000')
    if($wrapper -notmatch 'distributionSha256Sum='){$wrapper+="`ndistributionSha256Sum=b266d5ff6b90eada6dc3b20cb090e3731302e553a27c5d3e4df1f0d76beaff06`n"}
    [IO.File]::WriteAllText($arquivoWrapper,$wrapper)
    # Os novos módulos nativos elevam o uso de Metaspace durante o lint.
    # Ajuste somente no projeto gerado; manter lint, Hermes e os caches existentes.
    $arquivoPropriedades=Join-Path $android 'gradle.properties'
    $propriedadesGradle=[IO.File]::ReadAllText($arquivoPropriedades)
    $propriedadesGradle=[regex]::Replace($propriedadesGradle,'(?m)^org\.gradle\.jvmargs=.*$','org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=1024m')
    [IO.File]::WriteAllText($arquivoPropriedades,$propriedadesGradle)
    Push-Location $android
    try { & ./gradlew.bat --no-daemon --no-parallel --max-workers=1 :app:assembleRelease ("-PreactNativeArchitectures="+$Arquitetura) *> (Join-Path $estadoViva 'android-build.log'); if($LASTEXITCODE -ne 0){throw 'Gradle falhou; consulte .local/execucao/android-build.log.'} } finally {Pop-Location}
    $apk=Join-Path $android 'app/build/outputs/apk/release/app-release.apk'
    & (Join-Path $AndroidSdk 'build-tools/36.0.0/apksigner.bat') verify $apk
    if($LASTEXITCODE -ne 0){throw 'Assinatura do APK não verificada.'}
    & (Join-Path $AndroidSdk 'build-tools/36.0.0/zipalign.exe') -c -P 16 4 $apk
    if($LASTEXITCODE -ne 0){throw 'Alinhamento do APK não verificado.'}
    $saida=Join-Path $raizViva '.local/instalaveis';New-Item -ItemType Directory -Path $saida -Force | Out-Null
    $rotuloArquitetura=if($Arquitetura -eq 'arm64-v8a'){'arm64'}else{'x86_64'}
    $rotuloModo=if($redeTeste){'DemoRede'}else{'DemoLocal'}
    $versao=(Get-Content -LiteralPath (Join-Path $raizViva "package.json") -Raw|ConvertFrom-Json).version
    if($versao -notmatch "^[0-9]+\.[0-9]+\.[0-9]+$"){throw "Versão inválida."}
    $destino=Join-Path $saida ("VivaMais-"+$rotuloModo+"-"+$versao+"-build2-"+$rotuloArquitetura+".apk")
    if(Test-Path -LiteralPath $destino){throw "Já existe um APK desta versão. Preserve a entrega e incremente versão/build antes de substituir."}
    Copy-Item -LiteralPath $apk -Destination $destino
    Write-Output 'APK local de demonstração verificado; não enviado a loja nem instalado automaticamente.'
    [pscustomobject]@{
        arquivo=$destino
        enderecoApi=$EnderecoApi
        tamanhoBytes=(Get-Item -LiteralPath $destino).Length
        sha256=(Get-FileHash -LiteralPath $destino -Algorithm SHA256).Hash
    } | ConvertTo-Json
} finally {
    foreach($nome in $variaveis){[Environment]::SetEnvironmentVariable($nome,$anteriores[$nome],'Process')}
    Pop-Location
}
