# Emberfall — Ánh lửa cuối cùng

Game 3D nhỏ: khám phá sân cổ đổ nát, thu thập **năm ember**, giữ ánh đèn và đi vào cổng cổ để đánh thức nó.

## Mở và chơi

**Chơi online:** [damhieu.github.io/emberfall](https://damhieu.github.io/emberfall/). Trên iPhone, mở liên kết bằng **Safari** → chạm **Chia sẻ** → **Thêm vào Màn hình chính** → **Thêm**. Biểu tượng Emberfall sẽ mở toàn màn hình như một game riêng; các bước này cũng có trong màn hình mở đầu và pause của game.

**Máy tính:** mở `Emberfall.html` bằng Edge hoặc Chrome, hoặc nhấp đúp `Play Emberfall.cmd` trên Windows. Không cần Node.js, cài thư viện, mạng hay server để chơi file HTML này. Chọn **Bắt đầu hành trình**.

`Emberfall-Local.zip` chứa bản chơi, hướng dẫn, ảnh chụp và giấy phép; giải nén trước khi mở. HTML khoảng 24 MB vì đã chứa toàn bộ mã và texture.

## Điều khiển

| Thao tác | Điều khiển |
|---|---|
| Di chuyển theo hướng camera | WASD hoặc phím mũi tên |
| Xoay camera | Kéo trên cảnh |
| Zoom | Cuộn chuột; chụm hai ngón trên điện thoại |
| Đẩy bóng tối | SPACE hoặc nút lửa bên phải |
| Tạm dừng / tiếp tục | ESC hoặc nút Ⅱ |
| Chơi lại ngay | R hoặc nút Chơi lại |
| Âm thanh | Bật/tắt trong bảng mở đầu hoặc tạm dừng |
| Điện thoại | Cần trái để đi; nút lửa bên phải; kéo/chụm để chỉnh camera |

Ember tự được nhặt khi đến gần và hồi ánh đèn. Xung miễn phí, đẩy bóng gần đó ra xa và hồi sau 7 giây. Bóng tối ở sát người làm cạn đèn. Đèn về 0 là thua. Đủ năm ember thì đi vào vòm cổng phát sáng để thắng.

## Kiểm thử đã thực hiện

- Chơi bằng đầu vào bàn phím thật qua Playwright/Edge, đọc trạng thái để quan sát; không dịch chuyển tức thời hoặc sửa trạng thái game.
- Đi qua đủ năm ember và thắng trong cả ba vòng; kiểm tra cổng vẫn đóng khi chưa đủ ember.
- Chủ động nhận sát thương, đẩy bóng ra ở cự ly sát, né và đi tiếp, để đèn cạn đến màn thua, restart bằng R và nút.
- Kiểm tra pause đóng băng trạng thái, phím mũi tên, orbit/zoom, đi vòng quanh vật cản, giữ nhân vật trong khung khi zoom gần.
- Kiểm tra cảm ứng mô phỏng: joystick, nút xung, pinch zoom; pinch cuối không làm xoay camera ngoài ý muốn. Bố cục 390×844 và 844×390 mở được và nút bắt đầu hoạt động.
- Bật âm thanh: AudioContext chạy, không có lỗi. Chưa có đánh giá nghe trên thiết bị thật.
- Bản HTML mở trực tiếp bằng `file://` trong browser offline; chỉ yêu cầu chính file HTML, không gọi mạng, không có lỗi JavaScript trong các kiểm tra.
- Build production thành công. Cảnh báo kích thước bundle lớn là do cố ý nhúng texture để chơi bằng một file.

Đo cảnh gần cuối khoảng **22 FPS ở 1440×900 trong Edge headless**. Đây là một phép đo ngắn, không phải cam kết FPS trên mọi máy.

## Kết quả Dream Loop và phần còn thiếu

Dream Loop đã được cài và dùng theo quy trình Plus; 13 lượt dựng bằng worker riêng, gameplay do agent điều phối kiểm tra, hình ảnh do critic riêng so với ảnh đích.

| Vòng | Điểm hình ảnh của critic | Kết luận |
|---|---:|---|
| 1 | 3/10 | Chưa đạt ảnh đích |
| 7 | 6,8/10 | Chưa đạt ảnh đích |
| 10 | 7,1/10 | Chưa đạt ảnh đích |
| 12 | 7,2/10 | Chưa đạt ảnh đích |
| 13 | 7,7/10 | Chưa đạt ảnh đích |

Sau 13 vòng, visual critic vẫn kết luận **chưa đạt độ trung thực hình ảnh của target**. Bản cuối đã cải thiện cổng đổ vỡ bất đối xứng, relief đá, rêu, nước mưa và cảnh núi, nhưng vẫn thiếu mật độ điêu khắc, sương thể tích, vật liệu tự nhiên và bóng tối có thể tích như target. Cần tối ưu để đạt 60 FPS ổn định và thử trên điện thoại thật; hiện mới mô phỏng cảm ứng và kích thước màn hình.

Không có khóa Fal image-to-3D; hạn chế đã được báo trước, sau đó dùng mô hình dựng bằng mã cùng texture do Imagegen tạo, đúng nhánh dự phòng của skill. Xem `ASSET_NOTES.md` cho nguồn, prompt và vật liệu.

## Mã nguồn và chạy qua HTTP

Mã nguồn: `main.js`, `style.css`, `index.html`, `assets/`.

- `npm install` — chuẩn bị môi trường phát triển nếu chưa có dependencies.
- `npm start` — chạy bản nguồn trên localhost.
- `npm run build` — tạo `dist/` và `Emberfall.html` tự chứa.
- `npm run preview` — phục vụ bản build tại `http://127.0.0.1:4173`.

Muốn thử điện thoại thật trong cùng mạng Wi-Fi, có thể chạy `npm start -- --host 0.0.0.0` và mở địa chỉ LAN của máy tính với cổng được Vite hiển thị. Chưa kiểm tra cách mở file HTML trực tiếp trên từng hệ điều hành điện thoại.

Ảnh đích, ảnh mỗi vòng, báo cáo critic và log gameplay nằm trong `.dream-loop/`. `window.emberfall` là bản chụp trạng thái chỉ đọc dùng khi kiểm thử.

## Video giới thiệu Facebook

Sau khi Pages hoạt động, mở `promo-render.html` từ website và chọn **Tạo video giới thiệu**. Trình duyệt sẽ kết xuất video 1080p dài 20 giây với nhạc ambient nguyên bản và tải file `Emberfall-Facebook-Intro.webm` về máy. File WebM phù hợp với Facebook; có thể chuyển MP4 trong ứng dụng chỉnh sửa video nếu cần.
