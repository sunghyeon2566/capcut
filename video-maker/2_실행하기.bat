@echo off
chcp 65001 > nul
cd /d "%~dp0"
echo 민담 영상 제작기를 켜는 중... 브라우저가 자동으로 열려요.
echo (이 검은 창을 닫으면 프로그램이 꺼져요)
.venv\Scripts\python app.py
pause
