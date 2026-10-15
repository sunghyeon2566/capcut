"""
민담 영상 자동 제작기 - 핵심 기능

하는 일:
  1. 이미지(약 140장)를 나레이션 길이에 맞게 나눠서 깔기
  2. 이미지마다 줌인 / 줌아웃 / 왼쪽→오른쪽 움직임 넣기 (랜덤, 같은 효과 연속 X)
  3. 나레이션(음성) 넣기
  4. 자막(SRT)을 한 줄 15자 이내로 잘라서 넣기 (흰 글씨 + 검정 외곽선, 화면 아래)
  5. (선택) 대본에 [1] [2] 처럼 이미지 번호를 표시해 주면, 그 문장이 나올 때 정확히 장면 전환
  6. 캡컷 '초안(프로젝트)'으로 저장 → 캡컷에서 열고 '내보내기'만 누르면 mp4 완성
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
    num: int = 0  # SRT 파일에 적힌 자막 번호


def _parse_time(t: str) -> int:
    """'00:01:23,500' 또는 '01:23' 같은 시간을 마이크로초로"""
    parts = t.strip().replace(".", ",").split(":")
    sec, _, ms = parts[-1].partition(",")
    h, m = ([0, 0] + [int(x) for x in parts[:-1]])[-2:]
    return ((h * 60 + m) * 60 + int(sec)) * SEC + int((ms or "0").ljust(3, "0")[:3]) * 1000


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
        num = int(lines[0].strip()) if idx > 0 and lines[0].strip().isdigit() else len(cues) + 1
        text = " ".join(l.strip() for l in lines[idx + 1:])
        text = re.sub(r"<[^>]+>", "", text)          # <i> 같은 태그 제거
        text = re.sub(r"\s+", " ", text).strip()
        if text:
            cues.append(Cue(_parse_time(start), _parse_time(end.split()[0]), text, num))
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
            result.append(Cue(t, end, p, cue.num))
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


def parse_script(text: str) -> List[tuple]:
    """이미지 번호가 표시된 대본 읽기.
    [1] 옛날 옛적 ...   ← 1번 이미지는 이 문장부터
    [2] 하루는 ...      ← 2번 이미지는 이 문장부터
    [이미지 3], [장면 3], [그림 3번] 처럼 써도 됩니다. 첫 표시 앞의 글(제목 등)은 무시해요.
    결과: [(이미지번호, 그 이미지 구간의 대본), ...]"""
    parts = re.split(r"\[\s*(?:이미지|장면|그림|씬|scene)?\s*(\d+)\s*번?\s*\]", text, flags=re.I)
    result = [(int(parts[i]), parts[i + 1].strip()) for i in range(1, len(parts) - 1, 2)]
    if not result:
        raise ValueError("대본에서 [1], [2] 같은 이미지 번호 표시를 찾지 못했습니다.")
    return result


def _norm(text: str) -> str:
    """비교용: 띄어쓰기, 문장부호를 빼고 글자만 남기기"""
    return re.sub(r"[^0-9A-Za-z가-힣]", "", text)


def script_anchors(script: str, cues: List[Cue], count: int, log=print) -> dict:
    """대본의 이미지 표시 위치를 자막(SRT)에서 찾아서 이미지 시작 시간을 정합니다.
    나레이션/자막을 다른 곳에서 만들어서 글자가 조금 달라도 비슷한 부분을 찾아 맞춰요.
    결과: {이미지 순서(0부터): 시작 시간}"""
    from difflib import SequenceMatcher

    # 자막 글자 하나하나가 몇 초에 나오는지 (자막 구간 안에서 글자 수로 나눔)
    srt_chars, char_time, char_cue, cue_first = [], [], [], []
    for ci, c in enumerate(cues):
        t = _norm(c.text)
        cue_first.append(len(srt_chars))
        for k, ch in enumerate(t):
            srt_chars.append(ch)
            char_time.append(c.start + (c.end - c.start) * k // max(1, len(t)))
            char_cue.append(ci)
    srt_text = "".join(srt_chars)

    # 대본 글자 이어붙이기 + 각 이미지가 시작하는 글자 위치 기억
    script_text, marks = "", []
    for img, part in parse_script(script):
        if not 1 <= img <= count:
            raise ValueError(f"대본에 [{img}] 표시가 있는데 이미지는 {count}장입니다.")
        marks.append((img, len(script_text)))
        script_text += _norm(part)

    matcher = SequenceMatcher(None, script_text, srt_text, autojunk=False)
    blocks = [m for m in matcher.get_matching_blocks() if m.size >= 2]
    ratio = sum(m.size for m in blocks) / max(1, len(script_text))
    log(f"대본과 자막 일치율: {ratio * 100:.0f}%")
    if ratio < 0.5:
        raise ValueError("대본과 자막 내용이 너무 많이 다릅니다. 같은 이야기의 대본과 SRT인지 확인해 주세요.")

    def srt_pos(p: int) -> Optional[int]:
        for m in blocks:            # p가 일치 구간 안이면 그 위치, 아니면 바로 다음 일치 구간 시작
            if p < m.a + m.size:
                return m.b + max(0, p - m.a)
        return None

    anchors, last = {}, -1
    for img, p in marks:
        q = srt_pos(p)
        if q is None or q >= len(srt_text):
            log(f"⚠ {img}번 이미지 문장을 자막에서 못 찾아서 자동으로 배치해요")
            continue
        ci = char_cue[q]
        # 자막 줄 맨 앞(2글자 이내)에서 시작하면 그 자막 시작 시간에 딱 맞추기
        t = cues[ci].start if q - cue_first[ci] <= 2 else char_time[q]
        if t <= last:
            log(f"⚠ {img}번 이미지 위치가 앞 이미지보다 빨라서 자동으로 배치해요")
            continue
        anchors[img - 1], last = t, t
    return anchors


def image_times(count: int, total: int, cues: List[Cue], anchors: Optional[dict] = None) -> List[int]:
    """이미지 바뀌는 시점 목록(count+1개).
    대본에 표시된(anchors) 이미지는 그 시점에 정확히 바꾸고,
    나머지는 사이 구간을 똑같이 나누되 가까운 자막 시작 시점에 맞춰
    문장 중간에 장면이 바뀌지 않게 합니다."""
    anchors = dict(anchors or {})
    anchors[0] = 0          # 첫 이미지는 항상 0초부터 (앞에 검은 화면이 없게)
    anchors[count] = total  # 마지막 이미지는 끝까지
    keys = sorted(anchors)
    for a, b in zip(keys, keys[1:]):
        if anchors[b] <= anchors[a]:
            if b == count:
                raise ValueError(f"{a + 1}번 이미지 시작 시점이 나레이션 끝보다 늦습니다. 대본을 확인해 주세요.")
            raise ValueError(f"{b + 1}번 이미지 시작 시점이 {a + 1}번 이미지보다 빠르거나 같습니다. 대본을 확인해 주세요.")

    starts = sorted({c.start for c in cues})
    times = [0] * (count + 1)
    for a, b in zip(keys, keys[1:]):
        t0, t1 = anchors[a], anchors[b]
        step = (t1 - t0) / (b - a)
        times[a] = t0
        for k in range(a + 1, b):
            ideal = t0 + (k - a) * step
            near = min(starts, key=lambda s: abs(s - ideal)) if starts else ideal
            t = near if abs(near - ideal) <= step * 0.4 else ideal
            # 앞 이미지가 너무 짧아지지 않게 (최소 길이 = 평균의 30%)
            t = max(t, times[k - 1] + step * 0.3)
            times[k] = int(t)
    times[count] = total
    return times


def write_scene_report(images: List[str], times: List[int], cues: List[Cue], path: str) -> None:
    """이미지마다 언제 나오고 어떤 자막과 함께 시작하는지 확인용 파일로 저장"""
    with open(path, "w", encoding="utf-8") as f:
        f.write("이미지\t시작\t길이(초)\t첫 자막\n")
        for i, img in enumerate(images):
            t = times[i]
            first = next((c for c in cues if c.end > t), None)
            label = f"[{first.num}번] {first.text}" if first else ""
            f.write(f"{os.path.basename(img)}\t{t // SEC // 60:02d}:{t // SEC % 60:02d}"
                    f"\t{(times[i + 1] - t) / SEC:.1f}\t{label}\n")


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
               draft_name: str, *, script_text: Optional[str] = None, seed: Optional[int] = None,
               subtitle_size: float = SUBTITLE_SIZE, log=print) -> dict:
    if not os.path.isdir(drafts_folder):
        raise FileNotFoundError(f"캡컷 초안 폴더를 찾을 수 없습니다: {drafts_folder}")
    images = sorted((p for p in images if p.lower().endswith(IMAGE_EXTS)), key=natural_key)
    if not images:
        raise ValueError("이미지가 없습니다.")

    log(f"이미지 {len(images)}장, 자막 읽는 중...")
    original_cues = read_srt(srt)
    cues = split_cues(original_cues)
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
    anchors = None
    if script_text and script_text.strip():
        anchors = script_anchors(script_text, original_cues, len(images), log)
        log(f"대본 맞춤: {len(anchors)}장 이미지를 대본 위치에 맞춤 (나머지는 자동)")
    times = image_times(len(images), total, cues, anchors)
    write_scene_report(images, times, original_cues,
                       os.path.join(os.path.dirname(srt), "장면_확인표.txt"))
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
        "matched": len(anchors) if anchors else 0,
        "motions": {m: motions.count(m) for m in MOTIONS},
    }
