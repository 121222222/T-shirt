@echo off
chcp 65001 >nul
cd /d "e:\文化衫"

echo ========================================
echo   推送代码到 GitHub
echo ========================================
echo.

set /p msg=请输入提交说明: 

echo.
echo [1/3] 添加所有修改...
git add .

echo.
echo [2/3] 提交修改...
git commit -m "%msg%"

echo.
echo [3/3] 推送到远程 main 分支...
git push origin main

echo.
if %errorlevel% equ 0 (
    echo ========================================
    echo   推送成功！
    echo ========================================
) else (
    echo ========================================
    echo   推送失败，请检查网络或仓库权限
    echo ========================================
)

pause
