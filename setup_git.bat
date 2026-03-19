@echo off
chcp 65001 >nul
echo ========================================
echo   初始化 Git 仓库并推送到 GitHub
echo ========================================
echo.

cd /d "e:\文化衫"

echo [1/6] 初始化本地仓库...
git init

echo.
echo [2/6] 添加所有文件...
git add .

echo.
echo [3/6] 创建首次提交...
git commit -m "first commit: TEG文化衫H5及管理后台"

echo.
echo [4/6] 设置主分支为 main...
git branch -M main

echo.
echo [5/6] 添加远程仓库...
git remote add origin git@github.com:121222222/T-shirt.git

echo.
echo [6/6] 推送到远程仓库...
git push -u origin main

echo.
if %errorlevel% equ 0 (
    echo ========================================
    echo   推送成功！
    echo   仓库地址: https://github.com/121222222/T-shirt
    echo ========================================
) else (
    echo ========================================
    echo   推送失败，请检查：
    echo   1. 是否已配置 SSH Key
    echo   2. 网络是否正常
    echo   3. 仓库地址是否正确
    echo ========================================
)

pause
