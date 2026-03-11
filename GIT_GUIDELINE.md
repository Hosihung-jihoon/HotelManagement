# 🚀 Git Workflow & Guideline - Team Project

Tài liệu này quy định quy trình làm việc với Git dành cho team nhằm đảm bảo code luôn sạch sẽ, dễ quản lý và an toàn cho các buổi demo.

## 🏗 1. Mô hình nhánh (Branching Model)

Chúng ta sử dụng mô hình Git Flow rút gọn với 2 nhánh chính vĩnh viễn:

- **main**: Nhánh chứa code ổn định nhất. Chỉ gộp code từ develop vào đây khi đến hạn báo cáo/demo.
- **develop**: Nhánh trung tâm của dự án. Tất cả các tính năng mới sau khi hoàn thành sẽ được tập kết tại đây để kiểm tra sự tương thích.
- **feature/**: Nhánh tạm thời để phát triển từng tính năng. Được tạo từ develop và xóa sau khi đã gộp vào develop.

## 🔄 2. Quy trình làm việc hàng ngày (Workflow)

Mỗi khi bắt đầu một Task (tính năng) mới, hãy tuân thủ 6 bước sau:

### Bước 1: Cập nhật code mới nhất

Trước khi làm gì, hãy đảm bảo máy bạn có code mới nhất từ team.

```bash
git checkout develop
git pull origin develop
```

### Bước 2: Tạo nhánh tính năng (Feature Branch)

Tạo nhánh mới từ develop với tên riêng của bạn.

```bash
git checkout -b <tên_của_bạn>/feat/<tên_tính_năng>
# Ví dụ: an/feat/login-screen
```

### Bước 3: Phát triển và Commit

Làm việc trên nhánh này. Chia nhỏ các lần lưu (commit) để dễ quản lý.

> ⚠️ **CHÚ Ý QUAN TRỌNG (Đặc biệt lưu ý):**
> **Bắt buộc** phải đảm bảo dự án đã có file `.gitignore` chuẩn TRƯỚC KHI chạy lệnh `git add .`.
> Việc này để tránh đẩy nhầm các thư mục rác, file tạm, hoặc code chứa mật khẩu (ví dụ: `node_modules/`, `bin/`, `obj/`, `.env`...) lên GitHub.

- **Thêm các file đã thay đổi (Staging):**

  ```bash
  git add <tên-file-cụ-thể>
  # hoặc ít nhất kiểm tra trước
  git status
  git add .
  ```

- **Lưu lại thay đổi kèm theo mô tả rõ ràng:**

  ```bash
  git commit -m "feat: mô tả ngắn gọn nội dung vừa làm"
  ```

### Bước 4: Đẩy nhánh lên Server (GitHub)

Đưa nhánh chứa tính năng mới của bạn từ máy cá nhân lên GitHub:

```bash
# Trước khi push, đồng bộ với develop
git pull origin develop --rebase
# Rồi mới push
git push origin <tên_nhánh_vừa_tạo>
```

### Bước 5: Tạo Pull Request (PR)

1. Truy cập vào GitHub của dự án.
2. Tạo một Pull Request so sánh nhánh của bạn với nhánh develop.
3. Tag Nhóm trưởng (hoặc thành viên khác) vào phần Reviewers.
4. Chờ Review. Nếu có yêu cầu sửa (Request Changes), hãy sửa ngay trên nhánh đó và push lại.

### Bước 6: Merge & Dọn dẹp

Sau khi được Approve (Phê duyệt), Nhóm trưởng sẽ nhấn Merge. Bạn có thể xóa nhánh cục bộ cho sạch máy:

```bash
git checkout develop
git pull origin develop
git branch -d <tên_nhánh_cũ>
```

## 📝 3. Quy tắc đặt tên (Naming Conventions)

### Nhánh (Branches)

**Cấu trúc:** `<tên-người>/<loại-task>/<mô-tả-ngắn>`

- `feat/`: Tính năng mới 
- `fix/`: Sửa lỗi 
- `refactor/`: Cấu trúc lại code hiện có để sạch hơn, dễ đọc hơn nhưng không thay đổi tính năng. 
- `chore/`: Các công việc "vặt" liên quan đến cấu hình hệ thống, công cụ, không ảnh hưởng đến code chức năng.   
  - ví dụ thực tế:
    + Cài đặt thêm thư viện (npm install, nuget package).
    + Cấu hình file `.gitignore` hoặc `appsettings.json`.
- `test/`: Viết code để kiểm tra xem các chức năng có chạy đúng không. 
  - ví dụ thực tế:
    + Viết Unit test cho hàm tính tổng tiền giỏ hàng.
    + Viết integration Test để kiểm tra kết nối giữa Backend và Database.
- `docs/`: Cập nhật các loại tài liệu hướng dẫn. 
  - ví dụ thực tế:
    + Viết file README.md hướng dẫn cách chạy project.
    + Cập nhật chú thích (comments) cho các API phức tạp để sếp/đồng nghiệp dễ hiểu.
    + Cấu hình Swagger cho API Dotnet.
- `style/`: Thay đổi về "ngoại hình" của code hoặc giao diện mà không đụng đến logic xử lý. 

### Commit Messages

Ví dụ:

- `feat: làm màn hình đăng nhập`
- `fix: sửa lỗi api không trả về dữ liệu`
- `style: căn giữa logo và đổi màu button`
- `docs: hướng dẫn chạy project trong readme`
- `refactor: tách logic xử lý giỏ hàng ra file riêng`
- `chore: cài đặt thư viện, cập nhật .gitignore`
- `test: viết unit test cho thanh toán`

Lưu ý quan trọng:
- Viết bằng tiếng việt có dấu (hoặc tiếng anh) rõ nghĩa
- Không viết chung chung như: "update", "fix bug", "xong".
- Không gộp quá nhiều loại việc vào 1 commit (ví dụ: vừa sửa lỗi vừa thêm tính năng mới -> hãy tách thành 2 commit riêng).

## ⚠️ 4. Xử lý Xung đột (Conflict Resolution)

Xung đột (Conflict) là bình thường khi làm việc nhóm. Khi gặp lỗi không thể Merge:

1. Tại nhánh tính năng của bạn, chạy: `git pull origin develop`.
2. Mở VS Code, tìm các file bị lỗi (màu đỏ).
3. Chọn code đúng (Accept Current/Incoming/Both).
4. Lưu file, `git add .`, `git commit` và `git push` lại.

## 👑 5. Vai trò của Nhóm trưởng (Gatekeeper)

- Kiểm soát chất lượng code trong các PR vào develop.
- Thực hiện Merge từ develop vào main trước mỗi buổi Demo.
- Tuyệt đối không để code lỗi hoặc "code rác" (console.log dư thừa) lọt vào main.

---

**Hãy tuân thủ quy trình này để team chúng ta làm việc hiệu quả nhất!**