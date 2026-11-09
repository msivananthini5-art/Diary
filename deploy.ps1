# SABI Diary - Quick Deploy Script
# This script helps you deploy to Netlify via GitHub

Write-Host "🚀 SABI Diary - Deployment Setup" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is installed
try {
    $gitVersion = git --version
    Write-Host "✅ Git is installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed!" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📋 Prerequisites Checklist:" -ForegroundColor Yellow
Write-Host "1. Create a GitHub account (if you don't have one): https://github.com/signup" -ForegroundColor White
Write-Host "2. Create a Netlify account: https://app.netlify.com/signup" -ForegroundColor White
Write-Host ""

# Ask for GitHub repository URL
Write-Host "Please follow these steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "STEP 1: Create GitHub Repository" -ForegroundColor Green
Write-Host "1. Go to: https://github.com/new" -ForegroundColor White
Write-Host "2. Repository name: sabi-diary" -ForegroundColor White
Write-Host "3. Keep it PRIVATE (your diary is personal!)" -ForegroundColor White
Write-Host "4. Do NOT initialize with README" -ForegroundColor White
Write-Host "5. Click 'Create repository'" -ForegroundColor White
Write-Host ""

$repoUrl = Read-Host "Enter your GitHub repository URL (e.g., https://github.com/username/sabi-diary.git)"

if ([string]::IsNullOrWhiteSpace($repoUrl)) {
    Write-Host "❌ Repository URL is required!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔧 Initializing Git repository..." -ForegroundColor Cyan

# Initialize git
git init
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to initialize git" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Git initialized" -ForegroundColor Green

# Add all files
Write-Host "📦 Adding files..." -ForegroundColor Cyan
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to add files" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Files added" -ForegroundColor Green

# Commit
Write-Host "💾 Creating commit..." -ForegroundColor Cyan
git commit -m "Initial commit - SABI Diary with beautiful scrapbook design"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to commit" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Commit created" -ForegroundColor Green

# Add remote
Write-Host "🔗 Adding remote repository..." -ForegroundColor Cyan
git remote add origin $repoUrl
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Remote might already exist, trying to update..." -ForegroundColor Yellow
    git remote set-url origin $repoUrl
}

Write-Host "✅ Remote added" -ForegroundColor Green

# Rename branch to main
Write-Host "🌿 Setting up main branch..." -ForegroundColor Cyan
git branch -M main

# Push to GitHub
Write-Host "📤 Pushing to GitHub..." -ForegroundColor Cyan
Write-Host "You may be asked to login to GitHub..." -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to push to GitHub" -ForegroundColor Red
    Write-Host "Please check your GitHub credentials and repository URL" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "✅ ✅ ✅ Code pushed to GitHub successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "STEP 2: Deploy on Netlify" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Go to: https://app.netlify.com/" -ForegroundColor White
Write-Host "2. Click 'Add new site' → 'Import an existing project'" -ForegroundColor White
Write-Host "3. Choose 'GitHub' and authorize Netlify" -ForegroundColor White
Write-Host "4. Select your 'sabi-diary' repository" -ForegroundColor White
Write-Host "5. Build settings:" -ForegroundColor White
Write-Host "   - Build command: (leave empty)" -ForegroundColor Yellow
Write-Host "   - Publish directory: ." -ForegroundColor Yellow
Write-Host "6. Click 'Deploy site'" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Your site will be live in a few seconds!" -ForegroundColor Green
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "STEP 3: Configure Supabase" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "After deployment, update Supabase settings:" -ForegroundColor White
Write-Host "1. Go to: https://supabase.com/dashboard" -ForegroundColor White
Write-Host "2. Select your project" -ForegroundColor White
Write-Host "3. Go to Authentication → URL Configuration" -ForegroundColor White
Write-Host "4. Add your Netlify URL to allowed URLs" -ForegroundColor White
Write-Host ""
Write-Host "📖 See DEPLOYMENT-GUIDE.md for detailed instructions!" -ForegroundColor Cyan
Write-Host ""
Write-Host "✨ Happy deploying! ✨" -ForegroundColor Magenta
