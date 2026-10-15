"""
민담 영상 자동 제작기 - 핵심 기능

하는 일:
  1. 이미지(약 140장)를 나레이션 길이에 맞게 나눠서 깔기
  2. 이미지마다 줌인 / 줌아웃 / 왼쪽→오른쪽 움직임 넣기 (랜덤, 같은 효과 연속 X)
  3. 나레이션(음성) 넣기
  4. 자막(SRT)을 한 줄 15자 이내로 잘라서 넣기 (흰 글씨 + 검정 외곽선, 화면 아래)
  5. 캡컷 '초안(프로젝트)'으로 저장 → 캡컷에서 열고 '내보내기'만 누르면 mp4 완성
"""

import math
import os
import random
import re
from dataclasses import dataclass
from typing import List, Optional

import pycapcut as cc
from pycapcut import KeyframeProperty, SEC, trange

# ── 기본 설정 (필요하면 숫자만 바꾸세요) ─────────────────────────
WIDTH, HEIGHT, FPS = 1920, 1080, 30

MAX_CHARS = 15          # 자막 한 줄 최대 글자 수 (띄어쓰기 포함)
SUBTITLE_SIZE = 10.0    # 자막 글자 크기 (캡컷 기본 자막은 5 정도)
BORDER_WIDTH = 60.0     # 검정 외곽선 두께 (기본 40, 클수록 진함)
SUBTITLE_Y = -0.8       # 자막 위치 (-1 = 맨 아래, 0 = 가운데)

ZOOM_SMALL = 1.0        # 줌 시작/끝 크기
ZOOM_BIG = 1.15         # 15% 확대
PAN_SCALE = 1.15        # 좌우 이동할 때 이미지 확대 크기 (가장자리가 안 보이게)
PAN_MOVE = 0.12         # 좌우 이동 거리 (화면 반폭 기준, 1.15배면 0.15까지 안전)

MOTIONS = ["줌인", "줌아웃", "좌→우"]

IMAGE_EXTS = (".png", ".jpg", ".jpeg", ".webp", ".bmp")


# ── 자막(SRT) 읽기 / 자르기 ──────────────────────────────────
@dataclass
class Cue:
    start: int   # 마이크로초 (1초 = 1,000,000)
    end: int
    text: str


def _parse_time(t: str) -> int:
    h, m, rest = t.strip().replace(".", ",").split(":")
    s, ms = rest.split(",")
    return ((int(h) * 60 + int(m)) * 60 + int(s)) * SEC + int(ms.ljust(3, "0")[:3]) * 1000


def read_srt(path: str) -> List[Cue]:
    """SRT 파일을 읽어서 자막 목록으로 바꿉니다. (한글 인코딩 자동 처리)"""
    raw = open(path, "rb").read()
    for enc in ("utf-8-sig", "cp949", "utf-16"):
        try:
            content = raw.decode(enc)
            break
        except UnicodeDecodeError:
            continue
    else:
        raise ValueError("자막 파일 글자 인코딩을 읽을 수 없습니다. UTF-8로 저장해 주세요.")

    cues = []
    for block in re.split(r"\n\s*\n", content.replace("\r\n", "\n").strip()):
        lines = [l for l in block.split("\n") if l.strip()]
        idx = next((i for i, l in enumerate(lines) if "-->" in l), None)
        if idx is None:
            continue
        start, end = lines[idx].split("-->")
        text = " ".join(l.strip() for l in lines[idx + 1:])
        text = re.sub(r"<[^>]+>", "", text)          # <i> 같은 태그 제거
        text = re.sub(r"\s+", " ", text).strip()
        if text:
            cues.append(Cue(_parse_time(start), _parse_time(end.split()[0]), text))
    if not cues:
        raise ValueError("자막 파일에서 자막을 하나도 찾지 못했습니다.")
    return cues


def split_text(text: str, max_chars: int = MAX_CHARS) -> List[str]:
    """긴 문장을 한 줄 max_chars 글자 이내로, 띄어쓰기 기준으로 고르게 나눕니다."""
    if len(text) <= max_chars:
        return [text]

    # 띄어쓰기로 나눈 단어 중 너무 긴 단어는 강제로 자르기
    words = []
    for w in text.split(" "):
        while len(w) > max_chars:
            words.append(w[:max_chars])
            w = w[max_chars:]
        if w:
            words.append(w)

    # 줄 수는 최소로, 그 안에서 줄 길이가 최대한 고르게 되도록 나누기
    n = len(words)
    best = [None] * (n + 1)   # best[i] = (줄 수, 고르지 않은 정도, 이전 위치)
    best[0] = (0, 0, -1)
    for i in range(1, n + 1):
        for j in range(i - 1, -1, -1):
            line = " ".join(words[j:i])
            if len(line) > max_chars:
                break
            if best[j] is None:
                continue
            cand = (best[j][0] + 1, best[j][1] + (max_chars - len(line)) ** 2, j)
            if best[i] is None or cand[:2] < best[i][:2]:
                best[i] = cand
    lines, i = [], n
    while i > 0:
        j = best[i][2]
        lines.append(" ".join(words[j:i]))
        i = j
    return lines[::-1]


def split_cues(cues: List[Cue], max_chars: int = MAX_CHARS) -> List[Cue]:
    """자막마다 15자 넘으면 여러 줄로 나누고, 시간은 글자 수 비율로 나눕니다."""
    result = []
    for cue in cues:
        parts = split_text(cue.text, max_chars)
        weights = [max(1, len(p.replace(" ", ""))) for p in parts]
        total = sum(weights)
        t = cue.start
        for k, (p, w) in enumerate(zip(parts, weights)):
            end = cue.end if k == len(parts) - 1 else t + (cue.end - cue.start) * w // total
            result.append(Cue(t, end, p))
            t = end
    return result


def write_srt(cues: List[Cue], path: str) -> None:
    """나눈 자막을 확인용 SRT로 저장 (유튜브 자막 업로드에도 쓸 수 있어요)"""
    def fmt(us: int) -> str:
        ms = us // 1000
        return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"
    with open(path, "w", encoding="utf-8") as f:
        for i, c in enumerate(cues, 1):
            f.write(f"{i}\n{fmt(c.start)} --> {fmt(c.end)}\n{c.text}\n\n")


# ── 이미지 시간 나누기 ──────────────────────────────────────
def natural_key(path: str):
    """1.png, 2.png, 10.png 순서로 정렬되도록 (10이 2보다 앞에 오지 않게)"""
    name = os.path.basename(path).lower()
    return [int(t) if t.isdigit() else t for t in re.split(r"(\d+)", name)]


def image_times(count: int, total: int, cues: List[Cue]) -> List[int]:
    """이미지 바뀌는 시점 목록(count+1개). 기본은 똑같이 나누되,
    가까운 자막 시작 시점에 맞춰서 문장 중간에 장면이 바뀌지 않게 합니다."""
    step = total / count
    starts = sorted({c.start for c in cues})
    times = [0]
    for k in range(1, count):
        ideal = k * step
        near = min(starts, key=lambda s: abs(s - ideal)) if starts else ideal
        t = near if abs(near - ideal) <= step * 0.4 else ideal
        # 앞 이미지가 너무 짧아지지 않게 (최소 길이 = 평균의 30%)
        t = max(t, times[-1] + step * 0.3)
        times.append(int(t))
    times.append(total)
    return times


def pick_motions(count: int, seed: Optional[int] = None) -> List[str]:
    """움직임을 랜덤으로 고르되, 같은 움직임이 연속으로 나오지 않게."""
    rng = random.Random(seed)
    result = []
    for _ in range(count):
        choices = [m for m in MOTIONS if not result or m != result[-1]]
        result.append(rng.choice(choices))
    return result


def apply_motion(seg: cc.VideoSegment, motion: str, duration: int) -> None:
    end = duration - 1
    if motion == "줌인":
        seg.add_keyframe(KeyframeProperty.uniform_scale, 0, ZOOM_SMALL)
        seg.add_keyframe(KeyframeProperty.uniform_scale, end, ZOOM_BIG)
    elif motion == "줌아웃":
        seg.add_keyframe(KeyframeProperty.uniform_scale, 0, ZOOM_BIG)
        seg.add_keyframe(KeyframeProperty.uniform_scale, end, ZOOM_SMALL)
    else:  # 좌→우 : 이미지가 왼쪽에서 오른쪽으로 이동
        seg.add_keyframe(KeyframeProperty.uniform_scale, 0, PAN_SCALE)
        seg.add_keyframe(KeyframeProperty.position_x, 0, -PAN_MOVE)
        seg.add_keyframe(KeyframeProperty.position_x, end, PAN_MOVE)


# ── 캡컷 초안 만들기 ────────────────────────────────────────
def make_draft(images: List[str], narration: str, srt: str, drafts_folder: str,
               draft_name: str, *, seed: Optional[int] = None,
               subtitle_size: float = SUBTITLE_SIZE, log=print) -> dict:
    if not os.path.isdir(drafts_folder):
        raise FileNotFoundError(f"캡컷 초안 폴더를 찾을 수 없습니다: {drafts_folder}")
    images = sorted((p for p in images if p.lower().endswith(IMAGE_EXTS)), key=natural_key)
    if not images:
        raise ValueError("이미지가 없습니다.")

    log(f"이미지 {len(images)}장, 자막 읽는 중...")
    cues = split_cues(read_srt(srt))
    write_srt(cues, os.path.splitext(srt)[0] + "_15자.srt")

    audio = cc.AudioMaterial(narration)
    total = max(audio.duration, cues[-1].end)
    log(f"나레이션 길이: {audio.duration / SEC:.1f}초, 자막 {len(cues)}줄")

    folder = cc.DraftFolder(drafts_folder)
    script = folder.create_draft(draft_name, WIDTH, HEIGHT, FPS, allow_replace=True)
    script.add_track(cc.TrackType.video, "이미지")
    script.add_track(cc.TrackType.audio, "나레이션")
    script.add_track(cc.TrackType.text, "자막")

    # 1) 이미지 + 움직임
    times = image_times(len(images), total, cues)
    motions = pick_motions(len(images), seed)
    for i, (img, motion) in enumerate(zip(images, motions)):
        dur = times[i + 1] - times[i]
        seg = cc.VideoSegment(cc.VideoMaterial(img), trange(times[i], dur))
        seg.add_background_filling("blur", 0.0625)  # 16:9가 아닌 그림이면 빈 곳을 흐린 배경으로
        apply_motion(seg, motion, dur)
        script.add_segment(seg, "이미지")
        if (i + 1) % 20 == 0:
            log(f"이미지 {i + 1}/{len(images)} 배치 완료")

    # 2) 나레이션
    script.add_segment(cc.AudioSegment(audio, trange(0, audio.duration)), "나레이션")

    # 3) 자막: 흰 글씨 + 굵은 검정 외곽선, 화면 아래, 한 줄
    style = cc.TextStyle(size=subtitle_size, bold=True, color=(1.0, 1.0, 1.0),
                         align=1, auto_wrapping=False)
    border = cc.TextBorder(color=(0.0, 0.0, 0.0), width=BORDER_WIDTH)
    clip = cc.ClipSettings(transform_y=SUBTITLE_Y)
    for c in cues:
        script.add_segment(cc.TextSegment(c.text, trange(c.start, c.end - c.start),
                                          style=style, border=border, clip_settings=clip), "자막")

    script.save()
    log(f"완료! 캡컷에서 '{draft_name}' 초안을 열고 내보내기(1080p, 30fps)를 누르세요.")
    return {
        "draft_name": draft_name,
        "images": len(images),
        "subtitles": len(cues),
        "seconds": round(total / SEC, 1),
        "motions": {m: motions.count(m) for m in MOTIONS},
    }
