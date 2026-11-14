// ===================== Bản local: "Bài của tôi" (nhập bài từ file MusicXML / MIDI) =====================
// Chỉ có trong PianoLocal.html (build.py chèn file này vào), không có trong bản web / bản gửi người khác.
// Nguồn bài: (1) file đặt trong thư mục my-songs/ rồi chạy build.py; (2) nút "📂 Thêm bài" (lưu trong trình duyệt).
const MY_FILES = /*__MY_FILES__*/[];
WIDE_PRAC = true; // khuông nhạc + bàn phím dài theo màn hình rộng (chỉ bản local)
// Bài có sẵn được giữ lại trong bản local (các bài khác ẩn đi, bản web vẫn đủ). Để trống [] = giữ tất cả.
const KEEP_SONGS = ["birthday"];
if (KEEP_SONGS.length) for (let i = SONGS.length - 1; i >= 0; i--) if (!KEEP_SONGS.includes(SONGS[i].id)) SONGS.splice(i, 1);

// ---- Trường độ: chọn hình nốt gần nhất với số phách thực tế ----
const NOTE_TYPES = [[6, "whole", 1], [4, "whole", 0], [3, "half", 1], [2, "half", 0], [1.5, "quarter", 1], [1, "quarter", 0],
  [0.75, "eighth", 1], [0.5, "eighth", 0], [0.375, "sixteenth", 1], [0.25, "sixteenth", 0]];
function typeOf(beats) {
  let best = NOTE_TYPES[0], bd = Infinity;
  NOTE_TYPES.forEach(t => { const dd = Math.abs(Math.log(beats / t[0])); if (dd < bd) { bd = dd; best = t; } });
  return best;
}
function finishNote(n) {
  const [, type, dot] = typeOf(n.beats);
  n.type = type; n.dot = !!dot;
  if (!n.rest) n.midi = midiOf(n.d, n.acc);
  return n;
}

// ---- Từ danh sách nốt (thời điểm + độ dài, tính bằng phách) ra một làn nốt có dấu lặng và ô nhịp ----
// evs: [{ on, dur, d, acc, fing }], mStarts: thời điểm bắt đầu từng ô nhịp + thời điểm kết thúc bài
function buildLane(evs, mStarts) {
  if (!evs.length) return null;
  const EPS = 1e-4, endAll = mStarts[mStarts.length - 1], out = [];
  const barOf = t => { let i = 0; while (i + 1 < mStarts.length - 1 && mStarts[i + 1] <= t + EPS) i++; return i; };
  const REST_V = [4, 3, 2, 1.5, 1, 0.75, 0.5, 0.25];
  const rest = (a, b) => {
    while (a < b - EPS) {
      const bar = barOf(a), segEnd = Math.min(b, mStarts[bar + 1] != null && mStarts[bar + 1] > a + EPS ? mStarts[bar + 1] : b);
      let left = segEnd - a;
      while (left > EPS) {
        const v = REST_V.find(x => x <= left + EPS) || left;
        out.push(finishNote({ rest: true, beats: v, bar }));
        a += v; left -= v;
      }
      a = Math.max(a, segEnd);
    }
  };
  const groups = new Map();
  evs.forEach(e => { const k = Math.round(e.on * 1000) / 1000; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(e); });
  const ons = [...groups.keys()].sort((x, y) => x - y);
  let t = 0;
  ons.forEach((on, k) => {
    if (on > t + EPS) rest(t, on);
    const g = groups.get(on), next = k + 1 < ons.length ? ons[k + 1] : Infinity;
    let end = Math.min(next, on + Math.max(...g.map(e => e.dur)));
    if (end - on < 0.05) end = Math.min(next, on + 0.25);
    const seen = new Set(), bar = barOf(on);
    g.sort((x, y) => x.d - y.d).forEach(e => {
      const m = midiOf(e.d, e.acc);
      if (seen.has(m)) return;
      out.push(finishNote({ d: e.d, acc: e.acc, beats: end - on, fing: e.fing || 0, bar, chord: seen.size > 0 }));
      seen.add(m);
    });
    t = end;
  });
  if (endAll > t + EPS) rest(t, endAll);
  return out;
}
// Đặt tên nốt cho phím MIDI theo hóa biểu (giọng giáng thì dùng ♭)
function spellNote(m, key) {
  const s = spellMidi(m, key < 0 ? -1 : 1);
  return { d: (Math.floor(m / 12) - 1) * 7 + s.li, acc: s.acc };
}

// ---- MIDI (.mid) ----
function parseMidiFile(buf) {
  const b = new Uint8Array(buf);
  let p = 0;
  const u32 = () => ((b[p++] << 24) | (b[p++] << 16) | (b[p++] << 8) | b[p++]) >>> 0;
  const u16 = () => (b[p++] << 8) | b[p++];
  const str = n => { const x = String.fromCharCode(...b.subarray(p, p + n)); p += n; return x; };
  const vlq = () => { let v = 0, c; do { c = b[p++]; v = (v << 7) | (c & 0x7f); } while (c & 0x80 && p < b.length); return v; };
  if (str(4) !== "MThd") throw new Error("Không phải file MIDI");
  const hl = u32(); u16(); const ntr = u16(), div = u16();
  p = 8 + hl;
  if (div & 0x8000) throw new Error("File MIDI dạng SMPTE chưa hỗ trợ");
  const notes = [], tsigs = [];
  let key = null, tempo = null;
  for (let tr = 0; tr < ntr && p + 8 <= b.length; tr++) {
    const id = str(4), len = u32(), end = Math.min(b.length, p + len);
    if (id !== "MTrk") { p = end; continue; }
    let tick = 0, rs = 0;
    const open = {};
    while (p < end) {
      tick += vlq();
      let st = b[p];
      if (st & 0x80) p++; else st = rs;
      if (st === 0xff) {
        const type = b[p++], l = vlq(), data = b.subarray(p, p + l);
        p += l;
        if (type === 0x51 && tempo == null && l >= 3) tempo = (data[0] << 16) | (data[1] << 8) | data[2];
        else if (type === 0x58 && l >= 2) tsigs.push({ on: tick / div, num: data[0], den: 1 << data[1] });
        else if (type === 0x59 && key == null && l >= 1) key = (data[0] << 24) >> 24;
      } else if (st === 0xf0 || st === 0xf7) { p += vlq(); }
      else {
        rs = st;
        const cmd = st & 0xf0, ch = st & 15, a = b[p++], v = cmd === 0xc0 || cmd === 0xd0 ? 0 : b[p++];
        if (ch === 9) continue; // kênh trống
        const k = ch * 128 + a;
        if (cmd === 0x90 && v > 0) (open[k] = open[k] || []).push(notes.push({ on: tick / div, end: null, m: a, src: tr * 16 + ch }) - 1);
        else if (cmd === 0x80 || cmd === 0x90) { const q = open[k]; if (q && q.length) notes[q.shift()].end = tick / div; }
      }
    }
    Object.values(open).forEach(q => q.forEach(i => { notes[i].end = tick / div; }));
    p = end;
  }
  if (!notes.length) throw new Error("File MIDI không có nốt nào");
  // Lượng tử hóa về lưới móc kép hoặc chùm ba
  const qz = x => { const a = Math.round(x * 4) / 4, c = Math.round(x * 3) / 3; return Math.abs(a - x) <= Math.abs(c - x) ? a : c; };
  notes.forEach(n => { n.on = qz(n.on); n.dur = Math.max(0.25, qz(n.end) - n.on); });
  // Chia tay: nếu có ≥ 2 track/kênh thì track cao hơn là tay phải; chỉ 1 track thì chia ở Đô giữa
  const srcs = {};
  notes.forEach(n => { (srcs[n.src] = srcs[n.src] || []).push(n.m); });
  const avg = a => a.reduce((x, y) => x + y, 0) / a.length;
  const ids = Object.keys(srcs).sort((x, y) => srcs[y].length - srcs[x].length);
  let handOf;
  if (ids.length >= 2) {
    const [r, l] = [ids[0], ids[1]].sort((x, y) => avg(srcs[y]) - avg(srcs[x])), ar = avg(srcs[r]), al = avg(srcs[l]);
    handOf = n => n.src == r ? "rh" : n.src == l ? "lh" : Math.abs(n.m - ar) < Math.abs(n.m - al) ? "rh" : "lh";
  } else handOf = n => n.m >= 60 ? "rh" : "lh";
  key = key == null ? 0 : Math.max(-7, Math.min(7, key));
  // Ô nhịp theo số chỉ nhịp
  const last = Math.max(...notes.map(n => n.on + n.dur));
  if (!tsigs.length || tsigs[0].on > 0) tsigs.unshift({ on: 0, num: 4, den: 4 });
  const mStarts = [];
  let t = 0, si = 0;
  while (t < last - 1e-4) {
    while (si + 1 < tsigs.length && tsigs[si + 1].on <= t + 1e-4) si++;
    mStarts.push(t);
    t += tsigs[si].num * 4 / tsigs[si].den;
  }
  mStarts.push(t);
  const ev = h => notes.filter(n => handOf(n) === h).map(n => ({ on: n.on, dur: n.dur, ...spellNote(n.m, key) }));
  return { title: "", key, bpm: tempo ? Math.round(60e6 / tempo) : 100, rh: buildLane(ev("rh"), mStarts), lh: buildLane(ev("lh"), mStarts),
    bars: mStarts.length - 1, src: "MIDI" };
}

// ---- MusicXML (.musicxml / .xml / .mxl nén) ----
async function unzipFirstScore(buf) {
  const dv = new DataView(buf), u8 = new Uint8Array(buf), files = {};
  let e = buf.byteLength - 22;
  while (e >= 0 && dv.getUint32(e, true) !== 0x06054b50) e--;
  if (e < 0) throw new Error("File .mxl bị hỏng");
  let p = dv.getUint32(e + 16, true);
  for (let i = dv.getUint16(e + 10, true); i > 0; i--) {
    if (dv.getUint32(p, true) !== 0x02014b50) break;
    const method = dv.getUint16(p + 10, true), size = dv.getUint32(p + 20, true), nl = dv.getUint16(p + 28, true);
    const xl = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), off = dv.getUint32(p + 42, true);
    const name = new TextDecoder().decode(u8.subarray(p + 46, p + 46 + nl));
    const start = off + 30 + dv.getUint16(off + 26, true) + dv.getUint16(off + 28, true);
    files[name] = { method, data: u8.slice(start, start + size) };
    p += 46 + nl + xl + cl;
  }
  const read = async f => {
    if (f.method === 0) return f.data.buffer;
    if (typeof DecompressionStream === "undefined") throw new Error("Trình duyệt chưa giải nén được .mxl – hãy xuất file .musicxml");
    return new Response(new Blob([f.data]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).arrayBuffer();
  };
  let path = null;
  if (files["META-INF/container.xml"]) {
    const c = new DOMParser().parseFromString(decodeText(await read(files["META-INF/container.xml"])), "application/xml");
    const rf = c.querySelector("rootfile");
    path = rf && rf.getAttribute("full-path");
  }
  if (!path || !files[path]) path = Object.keys(files).find(n => !n.startsWith("META-INF") && /\.(musicxml|xml)$/i.test(n));
  if (!path) throw new Error("Không tìm thấy bản nhạc trong file .mxl");
  return decodeText(await read(files[path]));
}
function decodeText(buf) {
  const u = new Uint8Array(buf);
  if (u[0] === 0xff && u[1] === 0xfe) return new TextDecoder("utf-16le").decode(u);
  if (u[0] === 0xfe && u[1] === 0xff) return new TextDecoder("utf-16be").decode(u);
  return new TextDecoder().decode(u);
}
function parseMusicXml(text) {
  const doc = new DOMParser().parseFromString(text, "application/xml");
  if (doc.querySelector("parsererror")) throw new Error("File MusicXML bị lỗi");
  if (doc.querySelector("score-timewise")) throw new Error("MusicXML dạng timewise chưa hỗ trợ – hãy xuất lại bằng MuseScore");
  const kids = (el, tag) => [...el.children].filter(c => c.tagName === tag);
  const kid = (el, tag) => kids(el, tag)[0];
  const num = (el, tag, def = 0) => { const c = el && el.querySelector(tag); return c ? +c.textContent : def; };
  const parts = [...doc.querySelectorAll("score-partwise > part")];
  if (!parts.length) throw new Error("Không có bè nào trong bản nhạc");
  const staves = pt => Math.max(1, ...[...pt.querySelectorAll("attributes > staves")].map(x => +x.textContent || 1));
  // Ưu tiên bè piano (2 khuông): khuông 1 = tay phải, khuông 2 = tay trái; không có thì bè 1 = phải, bè 2 = trái
  const piano = parts.find(pt => staves(pt) >= 2);
  const plan = piano ? [[piano, "rh"], [piano, "lh"]] : parts.slice(0, 2).map((pt, i) => [pt, i ? "lh" : "rh"]);
  let key = null, tempo = null, mStarts = null;
  const evs = { rh: [], lh: [] };
  const used = new Set();
  plan.forEach(([pt, hand]) => {
    if (used.has(pt)) return;
    used.add(pt);
    let div = 1, t0 = 0;
    const starts = [], open = {};
    kids(pt, "measure").forEach(ms => {
      starts.push(t0);
      let pos = 0, maxPos = 0, lastOn = 0;
      [...ms.children].forEach(c => {
        if (c.tagName === "attributes") {
          if (kid(c, "divisions")) div = +kid(c, "divisions").textContent || 1;
          const f = c.querySelector("key > fifths");
          if (f && key == null) key = +f.textContent;
        } else if (c.tagName === "direction" || c.tagName === "sound") {
          const snd = c.tagName === "sound" ? c : c.querySelector("sound");
          if (tempo == null && snd && snd.getAttribute("tempo")) tempo = +snd.getAttribute("tempo");
          const pm = c.querySelector("metronome > per-minute");
          if (tempo == null && pm && +pm.textContent) tempo = +pm.textContent;
        } else if (c.tagName === "backup") pos -= num(c, "duration") / div;
        else if (c.tagName === "forward") { pos += num(c, "duration") / div; maxPos = Math.max(maxPos, pos); }
        else if (c.tagName === "note") {
          if (kid(c, "grace") || kid(c, "cue")) return; // bỏ nốt hoa mỹ
          const dur = num(c, "duration") / div, isChord = !!kid(c, "chord");
          const on = isChord ? lastOn : pos;
          if (!isChord) { lastOn = pos; pos += dur; maxPos = Math.max(maxPos, pos); }
          const pitch = kid(c, "pitch");
          if (!pitch || kid(c, "rest")) return;
          const staff = +(kid(c, "staff") || { textContent: 1 }).textContent || 1;
          const h = piano ? (staff >= 2 ? "lh" : "rh") : hand;
          const step = pitch.querySelector("step").textContent.trim(), oct = num(pitch, "octave", 4);
          let acc = Math.round(num(pitch, "alter", 0)), d = oct * 7 + LETTERS.indexOf(step);
          const m = midiOf(d, acc);
          if (Math.abs(acc) > 1) ({ d, acc } = spellNote(m, key || 0)); // thăng kép / giáng kép: đổi sang tên khác
          const ties = [...c.querySelectorAll(":scope > tie")].map(x => x.getAttribute("type"));
          const absOn = t0 + on, tk = h + m;
          if (ties.includes("stop") && open[tk]) { // nốt nối: kéo dài nốt trước, không phải bấm lại
            open[tk].dur = absOn + dur - open[tk].on;
            if (!ties.includes("start")) delete open[tk];
            return;
          }
          const fg = c.querySelector("notations technical fingering");
          const fing = fg ? +(fg.textContent.match(/[1-5]/) || [0])[0] : 0;
          const e = { on: absOn, dur, d, acc, fing };
          evs[h].push(e);
          if (ties.includes("start")) open[tk] = e;
        }
      });
      t0 += maxPos > 0 ? maxPos : 4;
    });
    starts.push(t0);
    if (!mStarts) mStarts = starts;
  });
  const title = (doc.querySelector("work > work-title") || doc.querySelector("movement-title") ||
    doc.querySelector("credit > credit-words") || { textContent: "" }).textContent.trim();
  key = Math.max(-7, Math.min(7, key || 0));
  return { title, key, bpm: tempo ? Math.round(tempo) : 100, rh: buildLane(evs.rh, mStarts), lh: buildLane(evs.lh, mStarts),
    bars: mStarts.length - 1, src: "MusicXML" };
}

async function parseScoreFile(name, buf) {
  const u = new Uint8Array(buf, 0, Math.min(4, buf.byteLength)), sig = String.fromCharCode(...u);
  let r;
  if (sig !== "MThd" && !sig.startsWith("PK") && !/\.(musicxml|xml)$/i.test(name))
    throw new Error("chỉ nhận file MusicXML (.musicxml, .mxl) hoặc MIDI (.mid)");
  if (sig === "MThd") r = parseMidiFile(buf);
  else if (sig.startsWith("PK")) r = parseMusicXml(await unzipFirstScore(buf));
  else r = parseMusicXml(decodeText(buf));
  if (!r.rh && !r.lh) throw new Error("Không đọc được nốt nào");
  const base = name.replace(/\.[^.]+$/, "");
  const hands = r.rh && r.lh ? "hai tay" : r.rh ? "chỉ có tay phải" : "chỉ có tay trái";
  return { name: r.title && r.title.length > 1 ? r.title : base, key: r.key, bpm: Math.max(40, Math.min(200, r.bpm)),
    rh: r.rh, lh: r.lh, user: true, desc: `Bài của tôi · ${base} (${r.src}) · ${r.bars} ô nhịp · ${hands}` };
}

// ---- Lưu bài đã nhập trong trình duyệt (dạng gọn) ----
const encLane = ns => ns && ns.map(n => [n.rest ? -1 : n.d, n.acc || 0, +n.beats.toFixed(4), n.fing || 0, n.bar, n.chord ? 1 : 0]);
const decLane = a => a && a.map(([d, acc, beats, fing, bar, chord]) =>
  finishNote(d < 0 ? { rest: true, beats, bar } : { d, acc, beats, fing, bar, chord: !!chord }));
const myStore = () => lsGet("mySongs", []);
function addMySong(pc, stored) {
  pc.user = true;
  if (stored) pc.stored = true;
  SONGS.push(pc);
  return SONGS.length - 1;
}
function selectSong(i) {
  state.pieceIdx.song = i;
  lsSet("pracPiece", state.pieceIdx);
  if (state.phase === "song") startPractice("song");
}

// ---- Giao diện: nút Thêm bài / Xóa bài, kéo thả file vào trang ----
(function initLocal() {
  const css = document.createElement("style");
  css.textContent = `.myopts { display: inline-flex; gap: 8px; align-items: center; flex-wrap: wrap; justify-content: center; }
  .myopts button { border: 1px solid var(--border); background: var(--card); color: var(--ink); padding: 8px 12px; border-radius: 10px;
    cursor: pointer; font: inherit; }
  .myopts .msg { font-size: .85rem; color: var(--muted, inherit); max-width: 340px; }
  .myopts .msg.bad { color: var(--bad); }
  body.dropping { outline: 3px dashed var(--accent); outline-offset: -8px; }`;
  document.head.appendChild(css);
  const box = document.createElement("span");
  box.className = "myopts"; box.id = "myOpts";
  box.innerHTML = '<button id="importBtn" title="Thêm bài từ file MusicXML (.musicxml, .mxl) hoặc MIDI (.mid) – có thể kéo thả file vào trang">📂 Thêm bài</button>' +
    '<button id="delSongBtn" title="Xóa bài này khỏi Bài của tôi">🗑 Xóa bài</button>' +
    '<input type="file" id="importFile" accept=".mid,.midi,.mxl,.musicxml,.xml" multiple hidden><span class="msg" id="myMsg"></span>';
  $("practiceOpts").appendChild(box);
  const msg = (t, bad) => { $("myMsg").textContent = t; $("myMsg").className = "msg" + (bad ? " bad" : ""); };
  const refresh = () => {
    const song = state.phase === "song", pc = song && state.prac && state.prac.piece;
    box.style.display = song ? "" : "none";
    $("delSongBtn").style.display = pc && pc.stored ? "" : "none";
  };
  const _view = view, _start = startPractice;
  view = function (name) { _view(name); refresh(); };
  startPractice = function (kind) { _start(kind); refresh(); };

  async function importFiles(files) {
    let last = -1, ok = 0;
    const errs = [], list = myStore();
    for (const f of files) {
      try {
        const pc = await parseScoreFile(f.name, await f.arrayBuffer());
        pc.id = "u" + Date.now().toString(36) + ok;
        list.push({ id: pc.id, name: pc.name, desc: pc.desc, key: pc.key, bpm: pc.bpm, rh: encLane(pc.rh), lh: encLane(pc.lh) });
        last = addMySong(pc, true); ok++;
      } catch (e) { errs.push(f.name + ": " + e.message); }
    }
    try { localStorage.setItem("mySongs", JSON.stringify(list)); }
    catch (e) { errs.push("Bộ nhớ trình duyệt đã đầy – hãy chép file vào thư mục my-songs rồi chạy build.py"); }
    if (last >= 0) { if (state.phase !== "song") setMode("song"); selectSong(last); }
    msg((ok ? `Đã thêm ${ok} bài. ` : "") + errs.join(" · "), errs.length > 0);
  }
  $("importBtn").onclick = () => $("importFile").click();
  $("importFile").onchange = () => { const f = [...$("importFile").files]; $("importFile").value = ""; if (f.length) importFiles(f); };
  $("delSongBtn").onclick = () => {
    const pc = state.prac && state.prac.piece;
    if (!pc || !pc.stored || !confirm(`Xóa bài “${pc.name}” khỏi Bài của tôi?`)) return;
    lsSet("mySongs", myStore().filter(x => x.id !== pc.id));
    SONGS.splice(SONGS.indexOf(pc), 1);
    selectSong(Math.max(0, state.pieceIdx.song - 1));
    msg("Đã xóa bài.");
  };
  // Kéo thả file vào trang
  let depth = 0;
  document.addEventListener("dragenter", e => { if (e.dataTransfer && [...e.dataTransfer.types].includes("Files")) { depth++; document.body.classList.add("dropping"); } });
  document.addEventListener("dragleave", () => { if (--depth <= 0) { depth = 0; document.body.classList.remove("dropping"); } });
  document.addEventListener("dragover", e => e.preventDefault());
  document.addEventListener("drop", e => {
    e.preventDefault(); depth = 0; document.body.classList.remove("dropping");
    const f = [...(e.dataTransfer ? e.dataTransfer.files : [])];
    if (f.length) importFiles(f);
  });

  // Bài trong thư mục my-songs (nhúng sẵn lúc build) + bài đã thêm bằng nút
  myStore().forEach(x => {
    try { addMySong({ id: x.id, name: x.name, desc: x.desc, key: x.key, bpm: x.bpm, rh: decLane(x.rh), lh: decLane(x.lh) }, true); }
    catch (e) { console.warn("Bỏ qua bài lỗi", x.name, e); }
  });
  (async () => {
    const at = SONGS.findIndex(x => x.stored); // bài trong thư mục xếp trước bài thêm bằng nút
    const fromFiles = [];
    for (const f of MY_FILES) {
      try {
        const bin = Uint8Array.from(atob(f.data), c => c.charCodeAt(0));
        const pc = await parseScoreFile(f.name, bin.buffer);
        pc.id = "f-" + f.name; pc.user = true;
        fromFiles.push(pc);
      } catch (e) { console.warn("Không đọc được", f.name, e); fromFiles.push(null); msg(f.name + ": " + e.message, true); }
    }
    const ok = fromFiles.filter(Boolean);
    if (!ok.length) return;
    const cur = PRAC.song[state.pieceIdx.song];
    SONGS.splice(at < 0 ? SONGS.length : at, 0, ...ok);
    const saved = lsGet("pracPiece", {}).song; // giữ bài đang chọn lần trước (kể cả bài trong thư mục)
    state.pieceIdx.song = saved != null && saved < SONGS.length ? saved : Math.max(0, SONGS.indexOf(cur));
    if (state.phase === "song") startPractice("song");
  })();
  refresh();
})();
