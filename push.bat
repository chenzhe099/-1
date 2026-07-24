@echo off
cd /d "c:\Users\24247\SmartFarm\chenzhe099--1-dee9bad"
"C:\Program Files\Git\cmd\git.exe" config user.name "chenzhe099"
"C:\Program Files\Git\cmd\git.exe" config user.email "chenzhe099@users.noreply.github.com"
"C:\Program Files\Git\cmd\git.exe" add .
"C:\Program Files\Git\cmd\git.exe" commit -m "feat: AI集成 - DeepSeek LLM + Agent + RAG + AI对话 + 智能农业全模块"
"C:\Program Files\Git\cmd\git.exe" push -u origin ai-integration
echo Done
