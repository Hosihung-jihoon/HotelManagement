# Hotel Management API - Tài liệu Hướng dẫn & Workflow

Tài liệu này hướng dẫn bạn cách khởi động, kiểm thử và nắm bắt luồng hoạt động (workflow) của các API trong dự án Hotel Management (ASP.NET Core 8 Web API).

## 1. Yêu cầu Hệ thống và Môi trường
Trước khi bắt đầu, đảm bảo rằng:
1. SQL Server đang chạy và chuỗi kết nối (Connection String) trong `appsettings.json` là chính xác.
2. Các Role và Permission đã được seed vào database bằng file `database/seed_data.sql` hoặc Migration `HasData` (có sẵn trong `HotelDbContext`).
3. .NET 8 SDK / .NET 10 SDK đã được cài đặt trên máy.

---

## 2. Cách Khởi động API

**Chạy qua Terminal (Command Line):**
1. Mở terminal, trỏ đường dẫn tới thư mục chứa project API:
   ```bash
   cd d:\Individual\web_hotelmanagement_t7\backend\HotelManagement.API
   ```
2. Chạy ứng dụng bằng lệnh:
   ```bash
   dotnet run
   ```
3. Terminal sẽ hiển thị: `Now listening on: http://localhost:5280`. Đây là địa chỉ gốc (Base URL) của API.

**Chạy qua IDE (Visual Studio / VS Code):**
- **Visual Studio**: Chọn profile `http` trong dropdown cấu hình chạy (chỗ nút Play xanh lá) và nhấn "Start Debugging" (F5).
- Trình duyệt sẽ không tự động mở do cấu hình `"launchBrowser": false`, nên bạn cần mở thủ công như hướng dẫn bên dưới.

---

## 3. Workflow: Cách kiểm thử API bằng Swagger

Hệ thống đã tích hợp sẵn **Swagger** để mô phỏng và kiểm thử trực quan các endpoint mà không cần dùng Postman (mặc dù dùng Postman vẫn hoàn toàn khả thi). Dưới đây là luồng kiểm thử (Workflow) cơ bản:

### Bước 3.1: Mở giao diện Swagger
- Sau khi chạy API thành công, mở trình duyệt và truy cập: 
  **[http://localhost:5280/swagger](http://localhost:5280/swagger)**

### Bước 3.2: Đăng ký tài khoản (Register)
Vì hệ thống dùng JWT Token để bảo mật, bạn cần một tài khoản trước tiên.
1. Kéo xuống phần `Auth`.
2. Bấm vào **`POST /api/Auth/register`**.
3. Chọn nút **"Try it out"**.
4. Điền thông tin JSON đăng ký vào ô Request Body (ví dụ: `email`, `password`, `firstName`, `lastName`, v.v.).
5. Nhấn **"Execute"**. Nếu thành công, Server sẽ trả về status code `200`.

*Lưu ý: Tùy theo logic dự án, người dùng đăng ký mới có thể mặc định được gán Role là `Guest`. Nếu cần quyền `Admin` để test các API nâng cao, bạn có thể chỉnh sửa trực tiếp RoleId trong SQL Server sau khi đăng ký.*

### Bước 3.3: Đăng nhập (Login) và lấy Token
1. Trong Swagger, bấm vào **`POST /api/Auth/login`**.
2. Chọn nút **"Try it out"**.
3. Cung cấp JSON `email` và `password` vừa đăng ký.
4. Nhấn **"Execute"**.
5. Kéo xuống phần "Server response". Bạn sẽ thấy một nội dung JSON được trả về bao gồm thông tin user và đặc biệt là chuỗi **`token`** (chuỗi ký tự rất dài dạng `eyJhb...`).
6. **Copy phần giá trị của chuỗi `token` này** (KHÔNG copy dấu ngoặc kép bọc quanh nó).

### Bước 3.4: Gắn Token vào Header (Authorize)
Đây là thao tác "mở khóa" cho mọi API bảo mật khác:
1. Cuộn màn hình Swagger lên trên cùng, bạn sẽ thấy nút **"Authorize"** (có biểu tượng ổ khóa).
2. Nhấn vào nút đó, một bảng popup mở ra.
3. Trong ô trường Value, dán dải `token` vừa copy kèm theo tiền tố `Bearer `. Phải có **MỘT KHOẢNG TRẮNG** ở giữa.
   - **Ví dụ nhập:** `Bearer eyJhbGciOiJIUzI...`
4. Bấm **"Authorize"** -> Bấm **"Close"**. 
5. Lúc này, mọi request tiếp theo từ Swagger sẽ tự động nhúng token này vào header.

### Bước 3.5: Gọi API và kiểm tra kết quả
Bạn đã có thể tự do test các API trong danh sách.
1. Ví dụ Test API lấy danh sách phòng: Nhấn vào **`GET /api/Rooms`**.
2. Chọn **"Try it out"** và đẩy tham số lọc (nếu có).
3. Bấm **"Execute"**.
4. Response sẽ trả về dữ liệu danh sách phòng (`200 OK`) hoặc `401 Unauthorized` nếu cấu hình token ở bước trên sai/token đã hết hạn, hoặc `403 Forbidden` nếu bạn không đủ quyền (Permission) truy cập.

---

## 4. Tóm lược các Nhóm API Chính (Controllers)

Dưới đây là một số Controller tiêu biểu trong hệ thống mà bạn có thể test:

- **Auth**: Đăng nhập (`login`), Đăng ký (`register`).
- **Users / Roles / Permissions**: Các endpoint nội bộ để cấp quyền và quản trị account (Ví dụ: `RolesController`, `UserManagementController`).
- **Rooms & RoomTypes**: Lấy danh sách phòng, xem loại phòng, giá, trạng thái, tạo thêm phòng (Dành riêng cho Staff/Admin).
- **Bookings**: Đặt phòng, quản lý giao dịch booking của khách hàng.
- **Amenities / Services / ServiceCategories**: Dịch vụ cộng thêm, tiện ích đi kèm khách sạn.
- **Invoices / Payments**: Quản lý xuất hóa đơn, ghi nhận trạng thái thanh toán.
- **Notifications**: Lấy danh sách thông báo gửi cho người dùng (có tích hợp SignalR cho tính năng Real-time notification).

---

## 5. Kết nối Frontend với API

Nếu bạn chạy frontend (React/Vite) cùng lúc:
- Frontend sẽ chạy ở: `http://localhost:5173`.
- API đã cấu hình sẵn thư viện `CORS` để chấp nhận mọi request từ port `5173` này tới HTTP Backend `5280`. Do đó luồng gọi từ thư viện fetch/axios ở Frontend hoạt động tương tự như khi thao tác bằng Swagger (nạp Bearer token vào HTTP Headers).
- Với luồng Socket (SignalR), Frontend sẽ kết nối tới `ws://localhost:5280/hubs/notification`.
