# SignBridge MSIX Packaging Guide

This guide explains how to package SignBridge as an MSIX file for submission to the Microsoft Store.

## Prerequisites

### Required Software
1. **Node.js** (v16 or later)
   ```powershell
   winget install OpenJS.NodeJS
   ```

2. **ImageMagick** (for icon generation)
   ```powershell
   winget install ImageMagick.ImageMagick
   ```

3. **Windows SDK** (for MSIX packaging)
   - Install Visual Studio 2022 with Windows 11 SDK
   - Or install Windows SDK separately

### Development Certificate
For development/testing, we generate a self-signed certificate. For production, you'll need a proper code signing certificate from a trusted Certificate Authority.

## Quick Start

### 1. Generate Icons and Certificate
```powershell
# Generate application icons
.\scripts\generate_icons.ps1

# Generate development certificate
.\scripts\generate_certificate.ps1
```

### 2. Build MSIX Package
```powershell
# Build complete MSIX package
.\scripts\build_msix.ps1
```

### 3. Manual Build Steps
```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Build frontend
npm run build:frontend

# Build MSIX package
npm run build:msix
```

## Package Configuration

### MSIX Settings
The MSIX package is configured in `frontend/package.json`:

```json
{
  "msix": {
    "identityName": "SignBridgeTeam.SignBridge",
    "publisher": "CN=SignBridge Team",
    "displayName": "SignBridge",
    "publisherDisplayName": "SignBridge Team",
    "description": "Voice-to-Sign Translation Application",
    "capabilities": [
      "internetClient",
      "microphone",
      "webcam"
    ],
    "isStoreApp": true,
    "store": "msStore"
  }
}
```

### Capabilities Required
- `internetClient`: For API calls to Groq and other services
- `microphone`: For audio recording and speech-to-text
- `webcam`: For pose detection (if implemented)

## Microsoft Store Submission

### 1. Prepare for Submission
1. **App Identity**: Update the `identityName` and `publisher` in package.json
2. **Publisher Certificate**: Replace the self-signed certificate with a proper one
3. **App Icons**: Ensure all required icon sizes are generated
4. **Screenshots**: Prepare screenshots for the store listing

### 2. Required Store Assets
- **App Icon**: 300x300 PNG
- **Screenshots**: 1920x1080 PNG (at least 1, up to 10)
- **Store Logo**: 50x50 PNG
- **Wide Store Logo**: 310x150 PNG
- **Package Logo**: 200x200 PNG

### 3. Store Listing Information
- **App Name**: SignBridge
- **Publisher**: Your company name
- **Category**: Productivity or Education
- **Description**: Voice-to-Sign Translation Application
- **Keywords**: sign language, translation, accessibility, voice

### 4. Submission Process
1. Go to [Microsoft Partner Center](https://partner.microsoft.com/)
2. Create a new app submission
3. Upload the MSIX package
4. Fill in store listing details
5. Submit for certification

## Troubleshooting

### Common Issues

#### 1. Certificate Errors
```
Error: Certificate not found or invalid
```
**Solution**: Ensure the certificate file exists and the password is correct in package.json

#### 2. Icon Generation Fails
```
Error: ImageMagick not found
```
**Solution**: Install ImageMagick using winget or download from official website

#### 3. Build Fails
```
Error: electron-builder not found
```
**Solution**: Run `npm install` in the frontend directory

#### 4. MSIX Validation Errors
```
Error: Package validation failed
```
**Solution**: Check that all required capabilities are declared and the package structure is correct

### Debug Commands
```powershell
# Check Node.js version
node --version

# Check npm version
npm --version

# Check ImageMagick installation
magick -version

# List generated files
Get-ChildItem frontend\dist-electron -Filter "*.msix"

# Validate MSIX package (requires Windows SDK)
makeappx validate -f frontend\dist-electron\*.msix
```

## Production Considerations

### 1. Code Signing Certificate
For production, you need a proper code signing certificate:
- Purchase from a trusted Certificate Authority (DigiCert, Sectigo, etc.)
- Install the certificate on your build machine
- Update the certificate path in package.json

### 2. App Identity
- Register your app identity in Microsoft Partner Center
- Use the correct publisher name and identity
- Ensure the identity matches your developer account

### 3. Store Policies
- Review Microsoft Store policies for accessibility apps
- Ensure your app meets accessibility guidelines
- Test on different Windows versions

### 4. Updates
- Plan for automatic updates
- Use semantic versioning
- Test update scenarios

## File Structure
```
Sign-bridge/
├── frontend/
│   ├── public/
│   │   ├── icon.svg
│   │   ├── icon.ico
│   │   ├── icon-*.png
│   │   └── icon.icns
│   ├── certificates/
│   │   └── signbridge.p12
│   ├── dist-electron/
│   │   └── *.msix
│   └── package.json
├── scripts/
│   ├── generate_icons.ps1
│   ├── generate_certificate.ps1
│   └── build_msix.ps1
└── MSIX_PACKAGING.md
```

## Support

For issues with MSIX packaging:
1. Check the troubleshooting section above
2. Review Microsoft's MSIX documentation
3. Check electron-builder documentation
4. Contact the development team

## License

This packaging configuration is part of the SignBridge project and follows the same license terms.
