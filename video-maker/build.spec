# PyInstaller 설정 - 윈도우용 exe 만들기 (GitHub Actions에서 자동 실행)
from PyInstaller.utils.hooks import collect_all, copy_metadata

datas, binaries, hidden = [("templates", "templates")], [], []
for pkg in ("pycapcut", "pymediainfo"):
    d, b, h = collect_all(pkg)
    datas += d; binaries += b; hidden += h
datas += copy_metadata("imageio")

a = Analysis(["app.py"], datas=datas, binaries=binaries, hiddenimports=hidden + ["imageio"])
pyz = PYZ(a.pure)
exe = EXE(pyz, a.scripts, [], exclude_binaries=True, name="민담영상제작기", console=True)
coll = COLLECT(exe, a.binaries, a.datas, name="민담영상제작기")
