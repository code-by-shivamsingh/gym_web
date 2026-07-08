# Setup Monorepo Script
# Run this script in PowerShell from the project root directory (d:\gym\gym_web) to restructure files.

$ErrorActionPreference = "Stop"

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Starting Gym Web Monorepo Restructuring..." -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# 1. Create frontend directory
if (-not (Test-Path -Path "frontend")) {
    Write-Host "Creating 'frontend' directory..." -ForegroundColor Green
    New-Item -ItemType Directory -Path "frontend" | Out-Null
}

# 2. Move frontend directories
$foldersToMove = @("app", "src", "public", "utils")
foreach ($folder in $foldersToMove) {
    if (Test-Path -Path $folder) {
        Write-Host "Moving folder '$folder' to 'frontend/$folder'..." -ForegroundColor Green
        Move-Item -Path $folder -Destination "frontend" -Force
    }
}

# 3. Move frontend configuration files
$filesToMove = @("tsconfig.json", "next.config.ts", "postcss.config.mjs", "eslint.config.mjs", "next-env.d.ts", "package.json", "yarn.lock")
foreach ($file in $filesToMove) {
    if (Test-Path -Path $file) {
        Write-Host "Moving file '$file' to 'frontend/$file'..." -ForegroundColor Green
        Move-Item -Path $file -Destination "frontend" -Force
    }
}

# 3b. Copy env files to both frontend and backend
$envFiles = @(".env", ".env.example")
foreach ($envFile in $envFiles) {
    if (Test-Path -Path $envFile) {
        Write-Host "Copying env file '$envFile' to frontend and backend..." -ForegroundColor Green
        Copy-Item -Path $envFile -Destination "frontend/$envFile" -Force
        Move-Item -Path $envFile -Destination "backend/$envFile" -Force
    }
}

# 4. Create root package.json
Write-Host "Creating root package.json..." -ForegroundColor Green
$rootPackageJson = @'
{
  "name": "gym-management-monorepo",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "frontend": "npm run dev --prefix frontend",
    "backend": "npm run dev --prefix backend",
    "dev": "concurrently \"npm run backend\" \"npm run frontend\"",
    "build": "npm run build --prefix frontend",
    "install:all": "npm install && npm install --prefix frontend && npm install --prefix backend"
  },
  "dependencies": {
    "concurrently": "^10.0.3"
  }
}
'@
Set-Content -Path "package.json" -Value $rootPackageJson -Encoding UTF8

# 5. Create root .gitignore
Write-Host "Updating root .gitignore..." -ForegroundColor Green
$rootGitignore = @'
# dependencies
/node_modules
/frontend/node_modules
/backend/node_modules

# next.js build
/frontend/.next/
/frontend/out/

# env files
.env*
/frontend/.env*
/backend/.env*

# production builds
/build
/frontend/build
/backend/build

# logs & misc
.DS_Store
*.pem
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*
*.tsbuildinfo
next-env.d.ts

# Local backend database and uploaded assets
/backend/data/
/backend/public/uploads/
/backend/mongo_log.txt
/backend/mongo_log_utf8.txt
'@
Set-Content -Path ".gitignore" -Value $rootGitignore -Encoding UTF8

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Restructuring Complete!" -ForegroundColor Cyan
Write-Host "Please run the following commands next:" -ForegroundColor Yellow
Write-Host "1. npm install" -ForegroundColor Yellow
Write-Host "2. npm run install:all (to install subfolder dependencies)" -ForegroundColor Yellow
Write-Host "3. npm run dev (to start both frontend and backend concurrently)" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Cyan
