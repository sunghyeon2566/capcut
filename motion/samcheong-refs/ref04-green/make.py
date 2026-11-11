"""레퍼런스 4(어두운 초록 앱 소개) → 광고영상제작기의 '이미지파일 리뷰 홍보영상' 엔진으로 그린다.
    python3 make.py   (motion-video-maker 저장소가 /home/user/motion-video-maker 에 있어야 한다)"""
import json, os, shutil, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, "/home/user/motion-video-maker")
import render, soundtrack  # noqa: E402
spec = json.load(open(os.path.join(HERE, "spec.json"), encoding="utf-8"))
job, out = os.path.join(HERE, "job"), os.path.join(HERE, "out")
os.makedirs(job, exist_ok=True); os.makedirs(out, exist_ok=True)
for f in os.listdir(os.path.join(HERE, "..", "_lib", "assets")):   # 사진 · 지도는 공용 폴더에서 가져온다
    if not os.path.exists(os.path.join(job, f)):
        shutil.copyfile(os.path.join(HERE, "..", "_lib", "assets", f), os.path.join(job, f))
info = render.get_info({**spec, "orient": "h"}, job)
wav = os.path.join(out, "sound.wav")
soundtrack.synth_promo(info["duration"], wav, has_badge=True, timeline=info.get("timeline"))
vid = os.path.join(out, "video.mp4")
render.render_video({**spec, "orient": "h"}, job, vid, workers=4)
render.mux_audio(vid, wav, os.path.join(out, "삼청동수제비_레퍼런스04_초록앱_16x9.mp4"), info["duration"])
os.remove(vid)
print("done", info["duration"])
