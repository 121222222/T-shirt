@echo off
chcp 65001 >nul
echo ========================================
echo   文化衫 H5 - Docker 镜像构建脚本
echo ========================================
echo.

:: 设置镜像名称和标签
set IMAGE_NAME=tshirt-h5
set IMAGE_TAG=latest

echo [1/3] 正在构建 Docker 镜像...
docker build -t %IMAGE_NAME%:%IMAGE_TAG% .

if %errorlevel% neq 0 (
    echo.
    echo [错误] 镜像构建失败！
    pause
    exit /b 1
)

echo.
echo [2/3] 镜像构建成功！
echo.
echo 镜像信息：
docker images %IMAGE_NAME%:%IMAGE_TAG%

echo.
echo [3/3] 可选操作：
echo.
echo   运行容器：
echo     docker run -d -p 8080:80 --name tshirt-h5 %IMAGE_NAME%:%IMAGE_TAG%
echo.
echo   使用 docker-compose：
echo     docker-compose up -d
echo.
echo   导出镜像文件：
echo     docker save -o tshirt-h5.tar %IMAGE_NAME%:%IMAGE_TAG%
echo.
echo   推送到镜像仓库：
echo     docker tag %IMAGE_NAME%:%IMAGE_TAG% your-registry/%IMAGE_NAME%:%IMAGE_TAG%
echo     docker push your-registry/%IMAGE_NAME%:%IMAGE_TAG%
echo.
echo ========================================
pause
