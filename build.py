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

# Thống kê lượt truy cập (GoatCounter) – CHỈ gắn vào bản web (index.html),
# không gắn vào file PianoNoteRecognition.html dùng để gửi riêng.
GOATCOUNTER = "nhonpiano"
WEB_ONLY = """
<!-- Thống kê lượt truy cập: GoatCounter (không dùng cookie) – chỉ có ở bản web -->
<script data-goatcounter="https://__GC__.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>
<script>
// Hiện số người đã truy cập ngay trên tiêu đề; lỗi hoặc bị chặn thì giữ ẩn
// Số lượt của trang /piano từ đầu (TOTAL.json chỉ tính một khoảng ngắn gần đây)
fetch("https://__GC__.goatcounter.com/counter/%2Fpiano.json")
  .then(r => r.ok ? r.json() : null)
  .then(d => {
    if (!d || d.count == null) return;
    const n = String(d.count).replace(/[^0-9]/g, "");
    if (!n || n === "0") return;
    const el = document.getElementById("visitors");
    el.innerHTML = '<span class="sep"> – </span>' + Number(n).toLocaleString("vi-VN") + " người đã truy cập";
    el.hidden = false;
  })
  .catch(() => {});

// ---- Mức độ sử dụng (sự kiện GoatCounter, không cookie, không thông tin cá nhân) ----
// dung-N-phut : đã luyện thật sự N phút trong một lần mở (tab đang hiện + có thao tác trong 60 giây gần nhất)
// mo-lan-X    : đây là lần mở app thứ mấy trên máy này (cách nhau >= 30 phút mới tính lần mới)
// so-ngay-X   : đã dùng app bao nhiêu ngày khác nhau
// tra-loi-N   : số câu đã trả lời trong một lần mở
// tab-...     : chế độ được dùng (mỗi lần mở chỉ gửi 1 lần cho mỗi tab)
(function () {
  const sent = new Set();
  function ev(name) {
    if (sent.has(name)) return;
    sent.add(name);
    let tries = 0;
    (function send() {
      const gc = window.goatcounter;
      if (gc && gc.count) gc.count({ path: name, title: name, event: true });
      else if (tries++ < 20) setTimeout(send, 1500);
    })();
  }
  const ls = {
    get(k, d) { try { const v = localStorage.getItem("hp_" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("hp_" + k, JSON.stringify(v)); } catch (e) {} },
  };
  const bucket = (n, edges) => { for (const [max, name] of edges) if (n <= max) return name; return edges[edges.length - 1][1]; };

  // Lần mở thứ mấy / số ngày dùng
  const now = Date.now(), today = new Date().toISOString().slice(0, 10);
  if (now - ls.get("lastSeen", 0) > 30 * 60 * 1000) {
    const opens = ls.get("opens", 0) + 1;
    ls.set("opens", opens);
    ev("mo-lan-" + bucket(opens, [[1, "1"], [2, "2"], [5, "3-5"], [10, "6-10"], [20, "11-20"], [Infinity, "tren-20"]]));
  }
  if (ls.get("lastDay", "") !== today) {
    const days = ls.get("days", 0) + 1;
    ls.set("days", days); ls.set("lastDay", today);
    ev("so-ngay-" + bucket(days, [[1, "1"], [2, "2"], [5, "3-5"], [10, "6-10"], [30, "11-30"], [Infinity, "tren-30"]]));
  }
  ls.set("lastSeen", now);

  // Thời gian luyện thật sự
  let lastAct = 0, active = 0, answers = 0;
  const touch = () => { lastAct = Date.now(); ls.set("lastSeen", lastAct); };
  ["pointerdown", "keydown"].forEach(t => document.addEventListener(t, touch, { passive: true }));
  setInterval(() => {
    if (document.visibilityState !== "visible" || Date.now() - lastAct > 60000) return;
    active += 15;
    for (const m of [1, 5, 15, 30, 60]) if (active >= m * 60) ev("dung-" + m + "-phut");
  }, 15000);

  const TABS = { note: "tab-hoc-not", chord: "tab-hop-am", ear: "tab-luyen-nghe", sym: "tab-ky-hieu" };
  window.__appTrack = function (type, data) {
    if (type === "answer") {
      touch();
      answers++;
      for (const m of [10, 50, 100, 200]) if (answers >= m) ev("tra-loi-" + m);
    } else if (type === "tab" && TABS[data]) ev(TABS[data]);
  };
  ev(TABS.note); // app luôn mở ở tab Học nốt (trước khi đoạn này chạy)
})();
</script>
""".replace("__GC__", GOATCOUNTER)

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
    if html.count("</body>") != 1:
        raise SystemExit("Không tìm thấy </body> để gắn thống kê")
    INDEX.write_text(html.replace("</body>", WEB_ONLY + "</body>"), encoding="utf-8", newline="\n")
    print(f"{OUT.name}: {OUT.stat().st_size / 1024:.0f} KB, {len(samples)} mẫu piano "
          f"(midi {min(samples)}–{max(samples)})")


if __name__ == "__main__":
    main()
