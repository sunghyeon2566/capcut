#!/usr/bin/env bash
# 레퍼런스 영상을 한 번에 훑어본다: 규격, 컷 시점, 2fps 콘택트 시트, 키 프레임, (있으면) 소리 프로필.
#
#   bash analyze_reference.sh <video> <out_dir>
#
# 결과:
#   probe.txt          해상도·fps·길이·스트림
#   cuts.txt           장면 전환 시점(초) — 부드러운 전환은 안 잡힐 수 있으니 시트로 확인
#   sheet_*.jpg        2fps(긴 영상은 더 성기게) 콘택트 시트, 각 칸 왼쪽 위에 시각 표시
#   frames/f_<t>.jpg   2초마다 + 각 컷 직후의 원본 비율 키 프레임(가로 960)
#   audio.txt          0.5초 단위 음량 막대, 추정 템포(BPM), 강한 온셋 시각
set -euo pipefail
V="$1"
O="$2"
HERE="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$O/frames"

ffprobe -v error -show_entries format=duration:stream=codec_type,codec_name,width,height,r_frame_rate,sample_rate,channels -of compact "$V" | tee "$O/probe.txt"
DUR=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$V")

ffmpeg -v info -i "$V" -vf "select='gt(scene,0.25)',showinfo" -an -f null - 2>&1 \
  | grep -o "pts_time:[0-9.]*" | cut -d: -f2 > "$O/cuts.txt" || true
echo "cuts: $(tr '\n' ' ' < "$O/cuts.txt")"

# 콘택트 시트: 한 장에 6x10=60칸. 2fps로 2분까지, 더 길면 간격을 늘린다.
FPS=$(python3 -c "d=float('$DUR'); print(2 if d<=120 else round(240/d,4))")
ffmpeg -v error -y -i "$V" -vf "fps=$FPS,scale=320:-2,drawtext=text='%{pts\:hms}':x=4:y=4:fontsize=14:fontcolor=white:box=1:boxcolor=black@0.7,tile=6x10:padding=2" "$O/sheet_%02d.jpg"

# 키 프레임: 2초마다 + 컷 직후
python3 - "$DUR" "$O/cuts.txt" > "$O/frames/times.txt" <<'EOF'
import sys
dur = float(sys.argv[1])
ts = {round(x * 2.0, 2) for x in range(int(dur // 2) + 1)}
for line in open(sys.argv[2]):
    if line.strip():
        ts.add(round(min(dur - 0.05, float(line) + 0.15), 2))
print("\n".join(f"{t:.2f}" for t in sorted(ts) if t < dur))
EOF
while read -r t; do
  ffmpeg -nostdin -v error -y -ss "$t" -i "$V" -frames:v 1 -vf "scale=960:-2" "$O/frames/f_${t}.jpg"
done < "$O/frames/times.txt"

if ffprobe -v error -select_streams a -show_entries stream=codec_type -of csv=p=0 "$V" | grep -q audio; then
  ffmpeg -v error -y -i "$V" -vn -ac 1 -ar 22050 "$O/audio.wav"
  python3 "$HERE/audio_profile.py" "$O/audio.wav" | tee "$O/audio.txt"
else
  echo "(영상에 소리 트랙 없음)" | tee "$O/audio.txt"
fi
echo "done → $O"
