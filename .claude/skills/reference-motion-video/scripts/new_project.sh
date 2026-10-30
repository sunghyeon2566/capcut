#!/usr/bin/env bash
# 새 모션 프로젝트 폴더를 만든다: 템플릿 index.html·sound.py, 렌더러, 사운드 도구, 기본 폰트.
#
#   bash new_project.sh <project_dir> [--no-fonts]
#
# 만든 뒤 바로 확인:  node <project_dir>/render.mjs <project_dir> --stills 1,5,10
set -euo pipefail
P="$1"
HERE="$(cd "$(dirname "$0")" && pwd)"
SKILL="$(dirname "$HERE")"
if [ -e "$P/index.html" ]; then echo "이미 프로젝트가 있습니다: $P/index.html"; exit 1; fi
mkdir -p "$P/out" "$P/fonts" "$P/assets"
cp "$SKILL/assets/template/index.html" "$SKILL/assets/template/sound.py" "$P/"
cp "$HERE/render.mjs" "$HERE/sound_kit.py" "$P/"
printf 'out/*\n!out/*.mp4\n__pycache__/\n' > "$P/.gitignore"
if [ "${2:-}" != "--no-fonts" ]; then
  bash "$HERE/fetch_fonts.sh" "$P/fonts" \
    "Noto Sans KR:500,700,900" "Black Han Sans:400" "Montserrat:600,800" "JetBrains Mono:400,700" || \
    echo "폰트를 받지 못했습니다. 네트워크가 막혀 있으면 TTF를 직접 $P/fonts 에 넣으세요(파일 이름 규칙은 index.html @font-face 참고)."
fi
echo "프로젝트 준비됨 → $P"
