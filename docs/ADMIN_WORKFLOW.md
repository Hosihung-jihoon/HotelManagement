# Hướng dẫn Quy trình Hoạt động Admin Site (User Workflow)

Tài liệu này mô tả chi tiết các luồng nghiệp vụ và thao tác của người dùng (Admin/Manager/Staff) trên hệ thống quản trị Hotel Management.

---

## 1. Truy cập & Xác thực (Authentication)
- **Đăng nhập (Login)**: 
  - Người dùng truy cập vào trang quản trị (`/login`).
  - Nhập Email và Mật khẩu do quản trị viên cấp.
  - Hệ thống kiểm tra và chuyển hướng vào trang chủ Dashboard nếu đăng nhập thành công. Tùy thuộc vào Phân quyền (Role), người dùng sẽ chỉ nhìn thấy các menu chức năng tương ứng mà mình được phép.
- **Quên mật khẩu**:
  - Tại trang đăng nhập, người dùng nhấn "Quên mật khẩu", nhập Email để nhận link hoặc mã đặt lại mật khẩu của mình.

---

## 2. Tổng quan Bảng điều khiển (Dashboard)
- Giao diện đầu tiên hiển thị các chỉ số tổng quan quan trọng nhất của khách sạn trong ngày/tháng:
  - Tổng số phòng hiện đang trống / phòng đang có khách sử dụng.
  - Tổng số lượt Nhận phòng (Check-in) và Trả phòng (Check-out) dự kiến trong ngày.
  - Các thống kê nhanh về doanh thu và hoạt động.
- **Thao tác**: Người quản lý xem báo cáo biểu đồ nhanh trước khi đi sâu vào xem chi tiết ở các module khác.

---

## 3. Luồng Quản lý Buồng phòng (Rooms & Housekeeping)
Đây là nghiệp vụ cốt lõi hoạt động song song giữa Ban giám đốc/Lễ tân và Bộ phận buồng phòng.

- **Quản lý Hạng phòng & Phòng (Room Types & Rooms)**:
  - **Hạng phòng (Room Types)**: Quản trị viên định nghĩa các hạng phòng (Standard, Superior, VIP, Suite...), thiết lập mô tả, số giường và giá cơ bản.
  - **Phòng (Rooms)**: Tạo các phòng thực tế và gán vào từng hạng phòng (VD: Phòng 101, 102 thuộc hạng Standard).
- **Luồng Dọn phòng (Housekeeping)**:
  - Nhân viên Buồng phòng truy cập menu **Housekeeping**.
  - Xem danh sách sơ đồ các phòng cần dọn dẹp hoặc chờ kiểm tra.
  - Thực hiện cập nhật "Trạng thái làm sạch" (Clean Status) khớp với thực tế:
    - *Dirty* (Bẩn): Khách vừa trả phòng hoặc đến chu kỳ dọn.
    - *Cleaning* (Đang dọn): Nhân viên bắt đầu vào thao tác nghiệp vụ.
    - *Inspecting* (Chờ kiểm tra): Dọn xong, chờ Tổ trưởng buồng phòng kiểm tra lại.
    - *Clean* (Sạch sẽ): Hoàn tất.
  - Trạng thái đồng bộ theo thời gian thực (Real-time). Lễ tân lập tức biết phòng nào có trạng thái `Clean` để sắp xếp cho khách mời check-in.

---

## 4. Luồng Đặt phòng và Voucher (Bookings)
Nghiệp vụ dành cho bộ phận Lễ tân (Front Desk) và Kế toán kinh doanh.

- **Tạo Booking mới (Lễ tân/Admin)**:
  - Lễ tân nhấp tạo Booking, nhập khoảng thời gian lưu trú (Check-in date & Check-out date).
  - Chọn hạng phòng mong muốn của khách.
  - Hệ thống kiểm tra và chỉ thả xuống danh sách các phòng trống trong khoảng thời gian trên (tính năng Room Selection phụ thuộc vào Room Category). Lễ tân chọn gán phòng cụ thể.
  - Nhập thông tin Khách hàng (Người đại diện đặt phòng).
- **Áp dụng Voucher**:
  - Nhập mã ưu đãi (Voucher) do khách cung cấp.
  - Hệ thống tính toán và hiển thị rõ số tiền được giảm trừ trước khi chốt đơn (chiết khấu theo % tỷ lệ hoặc số tiền tĩnh). Số tiền giảm được trừ trực tiếp vào Tổng tiền phòng.
- **Vòng đời trạng thái Booking**:
  - **Pending**: Đặt phòng đang chờ xác nhận (thường áp dụng cho booking tới từ website tự phục vụ).
  - **Confirmed**: Xác nhận giữ chỗ. Phòng đã được xếp.
  - **Checked In**: Khi khách đến, Lễ tân thực hiện Check-in. Trạng thái phòng khách sạn lúc này tự động đổi thành *Occupied* (Đang sử dụng).
  - **Checked Out**: Khách trả phòng, xác nhận trả tiền. Trạng thái phòng đổi về *Dirty* truyền xuống bộ phận Housekeeping.
  - **Cancelled**: Khách hàng hủy đặt chỗ.

---

## 5. Quản lý Tài sản và Thất thoát (Inventory & Losses)
Luồng nghiệp vụ xử lý chi phí ngoài lề và vật trang thiết bị trong khách sạn.

- **Kho vật tư (Inventory)**:
  - Theo dõi danh mục các vật dụng hiện có của khách sạn (khăn tắm, nước suối, dầu gội, dụng cụ vệ sinh...).
  - Quản thủ kho thao tác nhập mới tài sản, cập nhật số lượng nhập/xuất để luôn theo dõi giới hạn tồn kho cảnh báo.
- **Ghi nhận Thất thoát & Đền bù (Losses)**:
  - Khi có sự cố vỡ, rách, mất mát tài sản từ phía nhân viên sơ suất hoặc khách hàng gây ra.
  - User lập phiếu ghi nhận chi tiết (Ví dụ: "Hỏng tivi phòng 204", "Rách ga giường").
  - Kèm theo phiếu là các chi phí đền bù quy đổi, giúp thống kê hoặc tính cộng gộp vào hóa đơn của booking đó ở khâu Check-out.

---

## 6. Người dùng và Phân quyền (Users & Roles)
Tính năng dành cho Admin/HR để quản lý nhóm hệ thống.

- **Quản lý Nhân sự (Users)**:
  - Admin tạo hồ sơ nhân viên mới, nhập email và cung cấp mật khẩu lần đầu.
  - Định dạng thông tin nhân sự và gán vào một vai trò (Role) cụ thể.
- **Vai trò và Phân quyền (Roles & Permissions)**:
  - Module cho phép tạo và tùy chỉnh các Role. 
  - (VD: Vai "Lễ tân" được gán quyền xem/tạo sửa Bookings, Rooms; Vai "Buồng phòng" chỉ có quyền xem/sửa trạng thái Housekeeping). Người dùng thuộc Role nào thì giao diện tự ẩn đi các module họ không có quyền.

---

## 7. Khách hàng thân thiết (Members)
- Đóng vai trò như một mini-CRM trên Admin Site.
- Hệ thống lưu trữ hồ sơ và database các khách hàng từng ở khách sạn.
- Lượt xem chi tiết cấp độ thành viên (Tier) và lịch sử các chuyến đặt phòng cũ của khách đo lường mức độ thân thiết.

---

## 8. Quản trị Nội dung và Hệ thống (Articles & Locations)
- **Hệ thống Chi nhánh (Locations)**:
  - Áp dụng khi kinh doanh chuỗi, cho phép Admin định nghĩa các cơ sở khách sạn khác nhau.
- **Nội dung (Articles)**:
  - Hệ thống Content Management lưu trữ danh sách các danh mục và bài viết.
  - Admin tạo đăng tin tức, khuyến mãi, chính sách lưu trú để đưa nội dung lên hiển thị trên Website cho khách hàng cuối xem.
