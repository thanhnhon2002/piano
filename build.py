"""Ghép mã nguồn + font + mẫu âm thanh piano thành MỘT file HTML chạy độc lập.

Dùng:  python build.py
Kết quả:
  PianoNoteRecognition.html  – file duy nhất để gửi cho người khác / đưa lên GitHub Pages
  index.html                 – bản giống hệt, dùng làm trang chính của GitHub Pages
"""
import base64
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src" / "PianoNoteRecognition.src.html"
FONT = ROOT / "assets" / "NotoMusic-music.woff2"
PIANO_DIR = ROOT / "assets" / "piano"
OUT = ROOT / "PianoNoteRecognition.html"
INDEX = ROOT / "index.html"

NOTE_SEMI = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}


def midi_of(stem):
    """'A1' -> 33, 'Ds4' -> 63, 'Fs2' -> 42"""
    m = re.fullmatch(r"([A-G])(s?)(-?\d)", stem)
    if not m:
        raise ValueError(f"Tên mẫu không hợp lệ: {stem}")
    letter, sharp, octave = m.groups()
    return 12 * (int(octave) + 1) + NOTE_SEMI[letter] + (1 if sharp else 0)


def b64(path):
    return base64.b64encode(path.read_bytes()).decode("ascii")


def main():
    html = SRC.read_text(encoding="utf-8")

    html = html.replace("__NOTO_MUSIC_WOFF2__", b64(FONT))

    samples = {midi_of(p.stem): b64(p) for p in sorted(PIANO_DIR.glob("*.mp3"))}
    samples = dict(sorted(samples.items()))
    body = ",\n".join(f"  {m}: {json.dumps(data)}" for m, data in samples.items())
    marker = "{/*__PIANO_SAMPLES__*/}"
    if marker not in html:
        raise SystemExit("Không tìm thấy chỗ nhúng mẫu âm thanh trong file nguồn")
    html = html.replace(marker, "{\n" + body + "\n}")

    if "__NOTO_MUSIC_WOFF2__" in html:
        raise SystemExit("Chưa nhúng được font")

    OUT.write_text(html, encoding="utf-8", newline="\n")
    # Bản web: app nằm ngay ở link gốc của GitHub Pages (link ngắn, không chuyển hướng)
    INDEX.write_text(html, encoding="utf-8", newline="\n")
    print(f"{OUT.name}: {OUT.stat().st_size / 1024:.0f} KB, {len(samples)} mẫu piano "
          f"(midi {min(samples)}–{max(samples)})")


if __name__ == "__main__":
    main()
