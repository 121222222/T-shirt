@echo off
chcp 65001 >nul
echo ========================================
echo   文化衫 H5 - 导出镜像文件
echo ========================================
echo.

set IMAGE_NAME=tshirt-h5
set IMAGE_TAG=latest
set OUTPUT_FILE=tshirt-h5.tar

echo [1/2] 正在导出镜像到 %OUTPUT_FILE% ...
docker save -o %OUTPUT_FILE% %IMAGE_NAME%:%IMAGE_TAG%

if %errorlevel% neq 0 (
    echo.
    echo [错误] 导出失败！请先运行 docker-build.bat 构建镜像
    pause
    exit /b 1
)

echo.
echo [2/2] 导出成功！
echo.
echo 文件信息：
dir %OUTPUT_FILE%

echo.
echo ========================================
echo 使用说明：
echo.
echo 在目标服务器上加载镜像：
echo   docker load -i %OUTPUT_FILE%
echo.
echo 然后运行容器：
echo   docker run -d -p 8080:80 --name tshirt-h5 %IMAGE_NAME%:%IMAGE_TAG%
echo ========================================
pause
