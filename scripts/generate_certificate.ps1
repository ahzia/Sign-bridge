# PowerShell script to generate a self-signed certificate for APPX packaging
# This is for development/testing purposes only

Write-Host "🔐 Generating self-signed certificate for APPX packaging..." -ForegroundColor Green

# Create certificates directory if it doesn't exist
$certDir = "frontend\certificates"
if (!(Test-Path $certDir)) {
    New-Item -ItemType Directory -Path $certDir -Force
}

# Generate a self-signed certificate
$certName = "SignBridge Development Certificate"
$certFile = "$certDir\signbridge.p12"
$certPassword = "signbridge123"

Write-Host "📜 Creating self-signed certificate..." -ForegroundColor Blue

# Create the certificate
$cert = New-SelfSignedCertificate -Type CodeSigningCert -Subject "CN=SignBridge Team" -KeyUsage DigitalSignature -FriendlyName $certName -CertStoreLocation "Cert:\CurrentUser\My" -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.3", "2.5.29.19={text}")

# Export the certificate to PFX format
$certPath = "Cert:\CurrentUser\My\$($cert.Thumbprint)"
$securePassword = ConvertTo-SecureString -String $certPassword -Force -AsPlainText

Export-PfxCertificate -Cert $certPath -FilePath $certFile -Password $securePassword

Write-Host "✅ Certificate generated successfully!" -ForegroundColor Green
Write-Host "📁 Certificate saved to: $certFile" -ForegroundColor Cyan
Write-Host "🔑 Certificate password: $certPassword" -ForegroundColor Yellow
Write-Host "⚠️  This is a self-signed certificate for development only!" -ForegroundColor Red
Write-Host "   For production, you'll need a proper code signing certificate." -ForegroundColor Red

# Update package.json with the certificate password
$packageJsonPath = "frontend\package.json"
$packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
$packageJson.build.win.certificatePassword = $certPassword
$packageJson | ConvertTo-Json -Depth 10 | Set-Content $packageJsonPath

Write-Host "📝 Updated package.json with certificate password" -ForegroundColor Green