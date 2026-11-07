# 🎹 Học Piano

Ứng dụng web luyện đọc nốt nhạc piano. Toàn bộ app nằm trong **một file HTML**, mở bằng trình duyệt là dùng được, không cần cài đặt và không cần Internet.

**Tác giả:** ThanhNhon

## Các chế độ học

| Chế độ | Nội dung |
|---|---|
| 𝄞𝄢 Học nốt | Đoán tên nốt, chọn **Khóa Sol**, **Khóa Fa** hoặc **Hai khóa** (xen kẽ ngẫu nhiên). Cả 3 đều có đếm giờ (bật/tắt bằng ô ⏱ Đếm giờ). Chọn **tối đa 1–5 nốt**: mỗi lượt hiện ngẫu nhiên từ 1 đến số đó, đọc lần lượt từ trái sang phải. Đếm giờ: bắt đầu 20 giây/nốt, đúng hết bớt 0,5 giây (tối thiểu 1 giây), sai hoặc hết giờ về lại 20 giây; khuông từ 2 nốt trở lên có thời gian = thời gian 1 nốt × số nốt × 80% |
| ♬ Hợp âm | Nhận biết hợp âm trưởng, thứ, giảm, tăng, hợp âm 7 và các thể đảo |
| 🎧 Luyện nghe | Nghe nốt Đô chuẩn rồi nốt bí ẩn, đoán tên nốt |
| ♯ Ký hiệu | Nhận biết 41 ký hiệu âm nhạc và chức năng của chúng |

Tùy chọn: số dòng kẻ phụ (0–5, áp dụng cho cả trên và dưới khuông; từ 4 dòng có thể viết gọn bằng ký hiệu quãng tám 8va/8vb), nốt thăng/giáng (♯ ♭), phát âm thanh piano thật, tự chuyển câu (nút ⏸ Dừng tự chuyển / ▶ Tự chuyển).

**Phím tắt:**
- `1`–`7` hoặc `C D E F G A B`: chọn nốt
- `−` / `+`: chọn giáng / thăng
- `Space`: bật/tắt tự chuyển câu
- `Enter`: sang câu tiếp
- `R`: nghe lại

## Kết nối đàn piano điện qua MIDI

Cắm đàn vào máy tính bằng cáp USB (hoặc cáp MIDI qua bộ chuyển USB-MIDI), bật đàn, rồi bấm **🎹 Kết nối đàn (MIDI)** và chọn **Cho phép**. Sau đó trả lời bằng cách bấm trên đàn:

- **Học nốt:** bấm đúng phím; mặc định phải đúng quãng tám (bỏ chọn được bằng ô *Không cần đúng quãng tám*)
- **Luyện nghe:** bấm phím có cùng tên nốt với âm vừa nghe (quãng nào cũng được)
- **Hợp âm:** bấm đủ các nốt của hợp âm, thể đảo nào cũng được

Chạy được trên Chrome, Edge, Opera (máy tính và Android). Safari và iPhone/iPad chưa hỗ trợ Web MIDI.

Ô **Bàn phím** cho chọn cỡ bàn phím hiển thị trên màn hình theo đàn của bạn: 58 phím (mặc định, vừa đủ cho app), 25, 32, 37, 49, 61, 73, 76 hoặc 88 phím.

## Cấu trúc thư mục

```
PianoNoteRecognition.html        ← file hoàn chỉnh (được tạo bởi build.py), dùng để chia sẻ
index.html                       ← bản giống hệt, là trang chính của GitHub Pages
src/PianoNoteRecognition.src.html← mã nguồn (sửa ở đây)
assets/NotoMusic-music.woff2     ← font ký hiệu âm nhạc
assets/piano/*.mp3               ← mẫu âm thanh piano (3 giây/mẫu)
build.py                         ← nhúng font + âm thanh vào một file HTML
```

Sau khi sửa `src/`, chạy lệnh:

```
python build.py
```

## Ghi nhận

- Âm thanh piano: [Salamander Grand Piano V3](https://archive.org/details/SalamanderGrandPianoV3) của Alexander Holm, giấy phép [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/). Bản MP3 lấy từ bộ mẫu của Tone.js; ở đây được cắt còn 3 giây đầu mỗi mẫu.
- Font ký hiệu âm nhạc: [Noto Music](https://fonts.google.com/noto/specimen/Noto+Music), giấy phép [SIL Open Font License 1.1](https://openfontlicense.org).
