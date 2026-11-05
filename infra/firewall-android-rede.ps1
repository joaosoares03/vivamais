[CmdletBinding()]
param(
    [ValidateSet('Verificar','Liberar','Remover')][string]$Acao='Verificar',
    [Parameter(Mandatory=$true)][string]$Computador,
    [Parameter(Mandatory=$true)][string]$Celular
)
$ErrorActionPreference='Stop'
function Confirmar-Ipv4Privado([string]$Endereco) {
    if($Endereco -notmatch '^(?:0|[1-9][0-9]{0,2})(?:\.(?:0|[1-9][0-9]{0,2})){3}$'){throw 'Informe IPv4 privado literal.'}
    $partes=$Endereco.Split('.') | ForEach-Object {[int]$_}
    if(@($partes | Where-Object {$_ -gt 255}).Count -or -not ($partes[0] -eq 10 -or
        ($partes[0] -eq 172 -and $partes[1] -ge 16 -and $partes[1] -le 31) -or ($partes[0] -eq 192 -and $partes[1] -eq 168))) {
        throw 'Somente IPv4 privado RFC1918; nenhum endereço público, wildcard ou loopback.'
    }
}
Confirmar-Ipv4Privado $Computador
Confirmar-Ipv4Privado $Celular
if($Computador -eq $Celular){throw 'Os dois endereços precisam ser diferentes.'}
if($Acao -ne 'Verificar') {
    $identidade=[Security.Principal.WindowsIdentity]::GetCurrent()
    $administrador=[Security.Principal.WindowsPrincipal]::new($identidade)
    if(-not $administrador.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
        # Elevação normal do Windows, somente quando o proprietário executa uma ação de alteração.
        $executavel=if(Test-Path (Join-Path $PSHOME 'pwsh.exe')){Join-Path $PSHOME 'pwsh.exe'}else{Join-Path $PSHOME 'powershell.exe'}
        Write-Output 'O Windows solicitará autorização de administrador (UAC). Confira e confirme somente se autorizar esta regra de teste.'
        $processo=Start-Process -FilePath $executavel -Verb RunAs -WindowStyle Normal -Wait -PassThru `
            -ArgumentList @('-NoProfile','-File',('"'+$PSCommandPath+'"'),'-Acao',$Acao,'-Computador',$Computador,'-Celular',$Celular)
        if($processo.ExitCode -ne 0){throw 'A ação elevada não foi concluída. Nenhuma outra configuração será alterada.'}
        Write-Output "Ação $Acao concluída no processo autorizado pelo Windows."
        return
    }
}
$nomeRegra='VivaMais-DemoAndroid-8083'
if($Acao -eq 'Remover') {
    Get-NetFirewallRule -Name $nomeRegra -ErrorAction SilentlyContinue | Remove-NetFirewallRule
    Write-Output 'Regra específica Viva+ removida. Nenhuma outra regra alterada.'
    return
}
$interface=Get-NetIPAddress -AddressFamily IPv4 -IPAddress $Computador -ErrorAction Stop
if(@($interface).Count -ne 1){throw 'O IP do computador precisa identificar exatamente uma interface.'}
$perfil=Get-NetConnectionProfile -InterfaceIndex $interface.InterfaceIndex -ErrorAction Stop
if(@($perfil).Count -ne 1){throw 'Não foi possível determinar um único perfil de rede.'}
$categoria=if($perfil.NetworkCategory -eq 'DomainAuthenticated'){'Domain'}else{[string]$perfil.NetworkCategory}
. (Join-Path $PSScriptRoot 'ambiente-local.ps1')
$java=Join-Path (Obter-ConfiguracaoViva).JavaHome 'bin\java.exe'
if(-not (Test-Path -LiteralPath $java)){throw 'JDK do projeto não encontrado.'}
$existente=Get-NetFirewallRule -Name $nomeRegra -ErrorAction SilentlyContinue
if($Acao -eq 'Verificar') {
    Write-Output "Rede: perfil=$categoria; portaTCP=8083; regraVivaMais=$([bool]$existente). Nenhuma alteração realizada."
    return
}
if($existente){
    $portas=$existente | Get-NetFirewallPortFilter
    $enderecos=$existente | Get-NetFirewallAddressFilter
    $aplicacao=$existente | Get-NetFirewallApplicationFilter
    $adaptador=$existente | Get-NetFirewallInterfaceFilter
    $mesmaRegra=([string]$existente.Enabled -eq 'True' -and [string]$existente.Direction -eq 'Inbound' -and
        [string]$existente.Action -eq 'Allow' -and [string]$existente.Profile -eq $categoria -and
        [string]$portas.Protocol -eq 'TCP' -and [string]$portas.LocalPort -eq '8083' -and
        @($enderecos.LocalAddress).Count -eq 1 -and [string]$enderecos.LocalAddress -eq $Computador -and
        @($enderecos.RemoteAddress).Count -eq 1 -and [string]$enderecos.RemoteAddress -eq $Celular -and
        [string]$aplicacao.Program -eq $java -and @($adaptador.InterfaceAlias).Count -eq 1 -and
        [string]$adaptador.InterfaceAlias -eq $interface.InterfaceAlias)
    if(-not $mesmaRegra){throw 'Existe regra Viva+ com configuração diferente. Não será alterada; revise antes de remover ou recriar.'}
    Write-Output 'A mesma regra restrita já está configurada e foi conferida. Nenhuma alteração necessária.'
    return
}
New-NetFirewallRule -Name $nomeRegra -DisplayName 'Viva+ teste Android (somente celular autorizado)' `
    -Description 'Demonstração sintética local. Remover ao terminar o teste.' `
    -Direction Inbound -Action Allow -Protocol TCP -LocalPort 8083 -LocalAddress $Computador `
    -RemoteAddress $Celular -Program $java -InterfaceAlias $interface.InterfaceAlias -Profile $categoria `
    -EdgeTraversalPolicy Block | Out-Null
Write-Output 'Regra criada somente para Java do projeto, interface/perfil atuais, IP do computador, IP do celular e TCP8083. Firewall permanece ativo.'
Write-Output 'Ao terminar, execute este mesmo script com -Acao Remover. Nenhuma porta do roteador foi alterada.'
