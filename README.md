# 🎹 Học Piano

Ứng dụng web luyện đọc nốt nhạc piano. Toàn bộ app nằm trong **một file HTML**, mở bằng trình duyệt là dùng được, không cần cài đặt và không cần Internet.

**Tác giả:** ThanhNhon

## Các chế độ học

| Chế độ | Nội dung |
|---|---|
| 𝄞𝄢 Học nốt | Đoán tên nốt, chọn **Khóa Sol**, **Khóa Fa** hoặc **Hai khóa** (xen kẽ ngẫu nhiên). Cả 3 đều có đếm giờ (bật/tắt bằng ô ⏱ Đếm giờ). Chọn **tối đa 1–5 nốt**: mỗi lượt hiện ngẫu nhiên từ 1 đến số đó, đọc lần lượt từ trái sang phải. Đếm giờ: bắt đầu 20 giây/nốt, đúng hết bớt 0,5 giây (tối thiểu 1 giây), sai hoặc hết giờ về lại 20 giây; khuông từ 2 nốt trở lên có thời gian = thời gian 1 nốt × số nốt × 80% |
| ♬ Hợp âm | Nhận biết hợp âm trưởng, thứ, giảm, tăng, hợp âm 7 và các thể đảo |
| 🎧 Luyện nghe | Nghe 1 nốt (phát 3 lần, cách nhau 1 giây) trong 7 nốt Đô4 → Si4, chọn đúng tên nốt |
| ♯ Ký hiệu | Nhận biết 41 ký hiệu âm nhạc và chức năng của chúng |
| 🖐 Luyện ngón | 12 bài tập có ghi số ngón, chọn **tay phải** (khóa Sol), **tay trái** (khóa Fa) hoặc **hai tay** (khuông đôi): 5 ngón (vị trí Đô, Sol, Rê), quãng 3, Hanon số 1, gam Đô / Sol / Rê / Fa trưởng, La thứ, hợp âm rải, gam 2 quãng tám |
| 🎵 Bài hát | 9 bài phổ biến, chọn **tay phải** (giai điệu), **tay trái** (đệm bass; Für Elise rải hợp âm như bản gốc) hoặc **hai tay** (đã hết bản quyền / dân gian): Mary Had a Little Lamb, Twinkle Twinkle, Kìa con bướm vàng, Ode to Joy, Jingle Bells, London Bridge, Happy Birthday, Silent Night, Für Elise |

Ở **Luyện ngón** và **Bài hát**, khuông nhạc là một dòng dài: đầu bài nốt đứng yên, khung sáng chạy theo nốt cần bấm; tới giữa khuông thì dải nốt trượt dần sang trái. Nốt cần bấm được tô xanh, bấm đúng phím mới sang nốt tiếp (sai thì nháy đỏ và tính lỗi). Bấm bằng phím trên màn hình, đàn MIDI hoặc bàn phím máy tính (`A S D F G H J K` = Đô → Đô, `W E T Y U` = phím đen; chế độ hai tay: hàng `Q 2 W 3 E R 5 T 6 Y 7 U I` cho tay phải, hàng `Z S X D C V G B H N J M ,` cho tay trái). Ở chế độ **hai tay**, các nốt hai tay bắt đầu cùng lúc phải bấm đủ (cùng lúc hoặc lần lượt) mới đi tiếp. Có **Nghe mẫu** (phát cả bài theo nhịp; bài hát phát cả hai tay), **Gợi ý phím** (tô phím và số ngón trên bàn phím), **Tên nốt**. Chơi xong được chấm 1–3 sao (3 sao = không sai nốt nào), số sao cao nhất lưu trên máy.

Tùy chọn: số dòng kẻ phụ (0–5, áp dụng cho cả trên và dưới khuông; từ 4 dòng có thể viết gọn bằng ký hiệu quãng tám 8va/8vb), dấu hóa (bật lên là có tất cả: ♯ ♭ ngẫu nhiên, hóa biểu ngẫu nhiên đầu khuông, dấu bình ♮ và dấu hóa “đánh lừa”), phát âm thanh piano thật, tự chuyển câu (nút ⏸ Dừng tự chuyển / ▶ Tự chuyển).

**Phím tắt:**
- `1`–`7` hoặc `C D E F G A B`: chọn nốt
- `−` / `+`: chọn giáng / thăng
- `Space`: bật/tắt tự chuyển câu
- `Enter`: sang câu tiếp
- `R`: nghe lại (Luyện ngón / Bài hát: chơi lại)
- `Space` ở Luyện ngón / Bài hát: nghe mẫu

## Kết nối đàn piano điện qua MIDI

Cắm đàn vào máy tính bằng cáp USB (hoặc cáp MIDI qua bộ chuyển USB-MIDI), bật đàn, rồi bấm **🎹 Kết nối đàn (MIDI)** và chọn **Cho phép**. Sau đó trả lời bằng cách bấm trên đàn:

- **Học nốt:** bấm đúng chính xác phím của nốt (đúng cả quãng tám)
- **Luyện nghe:** bấm đúng chính xác phím vừa nghe
- **Hợp âm:** bấm đủ các nốt của hợp âm, thể đảo nào cũng được
- **Luyện ngón / Bài hát:** bấm lần lượt từng nốt của bài

Chạy được trên Chrome, Edge, Opera (máy tính và Android). Safari và iPhone/iPad chưa hỗ trợ Web MIDI.

Ô **Bàn phím** cho chọn cỡ bàn phím hiển thị trên màn hình theo đàn của bạn: 58 phím (mặc định, vừa đủ cho app), 25, 32, 37, 49, 61, 73, 76 hoặc 88 phím.

## Thống kê sử dụng (chỉ bản web)

Bản web dùng [GoatCounter](https://nhonpiano.goatcounter.com) (không cookie, không thu thập thông tin cá nhân). Ngoài lượt truy cập `/piano`, app gửi các sự kiện:

| Sự kiện | Ý nghĩa |
|---|---|
| `dung-1-phut` … `dung-60-phut` | Đã luyện thật sự 1 / 5 / 15 / 30 / 60 phút trong một lần mở |
| `mo-lan-1`, `mo-lan-2`, `mo-lan-3-5`, … | Lần mở app thứ mấy trên cùng máy (cách nhau ≥ 30 phút) |
| `so-ngay-1`, `so-ngay-2`, `so-ngay-3-5`, … | Đã dùng app bao nhiêu ngày khác nhau |
| `tra-loi-10` … `tra-loi-200` | Số câu đã trả lời trong một lần mở |
| `tab-hoc-not`, `tab-hop-am`, `tab-luyen-nghe`, `tab-ky-hieu`, `tab-luyen-ngon`, `tab-bai-hat` | Chế độ được dùng |
| `xong-song-twinkle`, `xong-finger-scale-c`, … | Đã chơi xong bài nào |

File `PianoNoteRecognition.html` gửi riêng không chứa phần thống kê.

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
