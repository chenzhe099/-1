@echo off
chcp 65001 >nul
title 智慧农业 - 全栈启动
echo.
echo ╔════════════════════════════════╗
echo ║   智慧农业全栈一键启动        ║
echo ╚════════════════════════════════╝
echo.
set PROJECT=%~dp0-1

echo [1/3] 启动后端 (Java Spring Boot :9090)...
start "后端-9090" cmd /c "set JAVA_HOME=C:\Users\20731\maven\jdk-17\jdk-17.0.16+8 && cd /d %PROJECT%\backend && %JAVA_HOME%\bin\java -jar target\smartfarm-backend-1.0.0.jar --server.port=9090"
timeout /t 5 /nobreak >nul

echo [2/3] 启动AI服务 (FastAPI :8000)...
start "AI服务-8000" cmd /c "cd /d %PROJECT%\ai-service && C:\Users\20731\.workbuddy\binaries\python\versions\3.13.12\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000"
timeout /t 3 /nobreak >nul

echo [3/3] 启动前端 ( :8080)...
start "前端-8080" cmd /c "cd /d %PROJECT%\frontend && python -m http.server 8080"

echo.
echo ════════════════════════════════
echo  后端:   http://localhost:9090
echo  AI服务: http://localhost:8000/docs
echo  前端:   http://localhost:8080
echo ════════════════════════════════
echo.
echo 请稍候约30秒待后端完全启动...
timeout /t 25 /nobreak >nul
echo.
echo 后端启动完成! 按任意键打开前端...
pause >nul
start http://localhost:8080
