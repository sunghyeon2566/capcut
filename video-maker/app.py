"""
민담 영상 자동 제작기 - 웹 화면

실행하면 브라우저에서 http://127.0.0.1:5000 주소로 열립니다.
이미지 / 나레이션 / 자막(SRT)을 올리고 '영상 만들기'를 누르면 캡컷 초안이 만들어집니다.
"""

import json
import os
import re
import threading
import time
import webbrowser

from flask import Flask, jsonify, render_template, request

import maker

BASE = os.path.dirname(os.path.abspath(__file__))
WORK_DIR = os.path.join(BASE, "작업파일")          # 올린 파일이 저장되는 곳 (지우면 캡컷에서 그림이 안 보여요)
SETTINGS = os.path.join(BASE, "settings.json")
DEFAULT_DRAFTS = os.path.join(os.environ.get("LOCALAPPDATA", ""), "CapCut", "User Data",
                              "Projects", "com.lveditor.draft")

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 4 * 1024 ** 3   # 최대 4GB 업로드

jobs = {}   # 작업 진행 상황 저장


def load_settings() -> dict:
    if os.path.exists(SETTINGS):
        with open(SETTINGS, encoding="utf-8") as f:
            return json.load(f)
    return {"drafts_folder": DEFAULT_DRAFTS}


def save_settings(data: dict) -> None:
    with open(SETTINGS, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def safe_name(name: str) -> str:
    """파일 이름은 한글 그대로 두되 경로 문제를 일으키는 글자만 제거"""
    name = re.sub(r'[\\/:*?"<>|]', "_", os.path.basename(name)).strip()
    return name or "file"


@app.get("/")
def index():
    return render_template("index.html", settings=load_settings(),
                           default_name=time.strftime("민담_%Y%m%d_%H%M"))


@app.post("/make")
def make():
    draft_name = safe_name(request.form.get("draft_name") or time.strftime("민담_%Y%m%d_%H%M"))
    drafts_folder = request.form.get("drafts_folder", "").strip().strip('"')
    subtitle_size = float(request.form.get("subtitle_size") or maker.SUBTITLE_SIZE)
    images = request.files.getlist("images")
    narration = request.files.get("narration")
    srt = request.files.get("srt")
    script = request.form.get("script", "")

    if not images or not narration or not srt or not narration.filename or not srt.filename:
        return jsonify(error="이미지, 나레이션, 자막 파일을 모두 넣어 주세요."), 400
    if not os.path.isdir(drafts_folder):
        return jsonify(error=f"캡컷 초안 폴더가 없습니다: {drafts_folder}"), 400
    save_settings({"drafts_folder": drafts_folder})

    # 올린 파일 저장
    folder = os.path.join(WORK_DIR, draft_name)
    img_dir = os.path.join(folder, "이미지")
    os.makedirs(img_dir, exist_ok=True)
    image_paths = []
    for f in images:
        if f.filename and f.filename.lower().endswith(maker.IMAGE_EXTS):
            p = os.path.join(img_dir, safe_name(f.filename))
            f.save(p)
            image_paths.append(p)
    narration_path = os.path.join(folder, safe_name(narration.filename))
    srt_path = os.path.join(folder, safe_name(srt.filename))
    narration.save(narration_path)
    srt.save(srt_path)
    if script.strip():
        with open(os.path.join(folder, "대본.txt"), "w", encoding="utf-8") as f:
            f.write(script)

    job_id = str(int(time.time() * 1000))
    jobs[job_id] = {"log": [], "done": False, "error": None, "result": None}

    def run():
        job = jobs[job_id]
        try:
            job["result"] = maker.make_draft(image_paths, narration_path, srt_path, drafts_folder,
                                             draft_name, script_text=script,
                                             subtitle_size=subtitle_size,
                                             log=job["log"].append)
        except Exception as e:  # 오류 내용을 화면에 보여주기
            job["error"] = str(e)
        job["done"] = True

    threading.Thread(target=run, daemon=True).start()
    return jsonify(job_id=job_id)


@app.get("/status/<job_id>")
def status(job_id):
    return jsonify(jobs.get(job_id, {"error": "작업을 찾을 수 없습니다.", "done": True}))


if __name__ == "__main__":
    threading.Timer(1.5, lambda: webbrowser.open("http://127.0.0.1:5000")).start()
    app.run(host="127.0.0.1", port=5000)
