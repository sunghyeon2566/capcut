#!/usr/bin/env bash
# Google Fonts에서 정적 TTF를 받아 <fonts_dir>에 저장한다(SIL OFL 라이선스 텍스트도 함께).
#
#   bash fetch_fonts.sh <fonts_dir> "Noto Sans KR:500,700,900" "Black Han Sans:400" "JetBrains Mono:400,700"
#
# 파일 이름: <Family공백제거>-<weight>.ttf  (예: NotoSansKR-900.ttf)
# 기본 curl UA로 css2 API를 부르면 글꼴 전체가 든 TTF 주소가 온다(브라우저 UA는 쪼개진 woff2를 준다).
set -euo pipefail
DIR="$1"; shift
mkdir -p "$DIR"
for spec in "$@"; do
  fam="${spec%%:*}"; weights="${spec#*:}"
  q="family=$(echo "$fam" | sed 's/ /+/g'):wght@$(echo "$weights" | tr ',' ';')"
  css=$(curl -sS -f "https://fonts.googleapis.com/css2?${q}&display=swap") || { echo "실패: $fam (네트워크 또는 이름 확인)"; continue; }
  base=$(echo "$fam" | tr -d ' ')
  echo "$css" | awk '/font-weight/{w=$2; gsub(";","",w)} /src: url/{match($0,/https:[^)]*/); print w, substr($0,RSTART,RLENGTH)}' |
  while read -r w url; do
    curl -sS -f -o "$DIR/${base}-${w}.ttf" "$url" && echo "$DIR/${base}-${w}.ttf"
  done
  slug=$(echo "$fam" | tr -d ' ' | tr 'A-Z' 'a-z')
  curl -sS -f -o "$DIR/OFL-${base}.txt" "https://raw.githubusercontent.com/google/fonts/main/ofl/${slug}/OFL.txt" 2>/dev/null || true
done
