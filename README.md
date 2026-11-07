# 🎹 Piano – Nhận diện nốt nhạc

Ứng dụng web luyện đọc nốt nhạc piano. Toàn bộ app nằm trong **một file HTML**, mở bằng trình duyệt là dùng được, không cần cài đặt và không cần Internet.

**Tác giả:** ThanhNhon

## Các chế độ học

| Chế độ | Nội dung |
|---|---|
| 𝄞𝄢 Học nốt | Đoán tên nốt, chọn **Khóa Sol**, **Khóa Fa** hoặc **Hai khóa** (xen kẽ ngẫu nhiên, có đếm giờ: bắt đầu 10 giây/nốt, đúng thì bớt 0,5 giây (tối thiểu 1 giây), sai hoặc hết giờ thì về lại 10 giây) |
| ♬ Hợp âm | Nhận biết hợp âm trưởng, thứ, giảm, tăng, hợp âm 7 và các thể đảo |
| 🎧 Luyện nghe | Nghe nốt Đô chuẩn rồi nốt bí ẩn, đoán tên nốt |
| ♯ Ký hiệu | Nhận biết 41 ký hiệu âm nhạc và chức năng của chúng |

Tùy chọn: dòng kẻ phụ, nốt thăng/giáng (♯ ♭), phát âm thanh piano thật, tự chuyển câu (nút ⏸ Dừng tự chuyển / ▶ Tự chuyển).

**Phím tắt:**
- `1`–`7` hoặc `C D E F G A B`: chọn nốt
- `−` / `+`: chọn giáng / thăng
- `Space`: bật/tắt tự chuyển câu
- `Enter`: sang câu tiếp
- `R`: nghe lại

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
