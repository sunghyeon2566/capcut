@echo off
chcp 65001 > nul
cd /d "%~dp0"
echo [1/2] 프로그램 설치 공간을 만드는 중...
python -m venv .venv 2> nul
if not exist .venv\Scripts\python.exe py -m venv .venv
if not exist .venv\Scripts\python.exe (
  echo 파이썬을 찾을 수 없어요. 사용설명서 1단계를 먼저 해 주세요.
  pause
  exit /b
)
echo [2/2] 필요한 도구 설치 중... (1~2분)
.venv\Scripts\python -m pip install -r requirements.txt
echo.
echo 설치 끝! 이제 "2_실행하기.bat" 을 더블클릭하세요.
pause
