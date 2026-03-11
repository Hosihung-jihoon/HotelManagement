# 🚀 Hướng Dẫn Bắt Đầu Cho Thành Viên

> Tài liệu này hướng dẫn từng bước sau khi clone repo để có thể bắt đầu code.

---

## 📋 Yêu Cầu Cài Đặt

Đảm bảo máy bạn đã cài đủ các phần mềm sau:

| Phần mềm | Link tải | Ghi chú |
|----------|---------|---------|
| **Visual Studio 2022** | [Download](https://visualstudio.microsoft.com/) | Chọn workload **ASP.NET and web development** |
| **Visual Studio Code** | [Download](https://code.visualstudio.com/) | Dùng cho Frontend (ReactJS) |
| **SQL Server** | [Download](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) | Bản Developer (miễn phí) |
| **SSMS** | [Download](https://learn.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms) | Quản lý database |
| **Node.js** | [Download](https://nodejs.org/) | Phiên bản LTS (≥ 18.x) |
| **.NET 8 SDK** | [Download](https://dotnet.microsoft.com/en-us/download/dotnet/8.0) | Kiểm tra: `dotnet --version` |
| **Git** | [Download](https://git-scm.com/) | Kiểm tra: `git --version` |

---

## 🔽 Bước 1: Clone Repo

```bash
git clone https://github.com/Hosihung-jihoon/HotelManagement.git
```

Sau khi clone xong, chuyển sang nhánh `develop`:

```bash
git checkout develop
git pull origin develop
```

---

## 🗄️ Bước 2: Tạo Database

1. Mở **SSMS**, kết nối vào SQL Server local.
2. Tạo database mới tên: `HotelManagementDB`
   ```sql
   CREATE DATABASE HotelManagementDB;
   ```
3. Mở file `database/HotelManagement.sql` trong SSMS.
4. **Chạy toàn bộ file SQL** → dữ liệu mẫu sẽ được tạo sẵn.
5. Kiểm tra: mở rộng database → Tables → xem đủ **22 bảng** là OK.

---

## ⚙️ Bước 3: Chạy Backend (.NET 8)

### 3.1. Cấu hình Connection String

Mở file `backend/HotelManagement.API/appsettings.json`, **sửa `Server=`** cho đúng tên SQL Server trên máy bạn:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=TÊN_MÁY\\TÊN_INSTANCE;Database=HotelManagementDB;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

> **Cách tìm tên Server:** Mở SSMS → tên Server hiện ở ô kết nối (ví dụ: `DESKTOP-ABC\SQLEXPRESS`, `localhost\MSSQLSERVER01`).

### 3.2. Restore packages & Chạy

```bash
cd backend/HotelManagement.API
dotnet restore
dotnet run
```

### 3.3. Kiểm tra

- Mở trình duyệt → vào `http://localhost:xxxx/swagger`
- Nếu thấy **Swagger UI** hiện danh sách API → ✅ Backend OK!
- Thử bấm **GET /api/RoomTypes** → **Try it out** → **Execute** → phải trả về dữ liệu.


---

## 🎨 Bước 4: Chạy Frontend (ReactJS)

```bash
cd frontend
npm install
npm run dev
```

- Mở trình duyệt → vào `http://localhost:5173`
- Nếu thấy **giao diện có Sidebar + Header** → ✅ Frontend OK!
- Bấm vào menu **Loại Phòng** → nếu hiện bảng dữ liệu → Frontend kết nối Backend thành công.

> ⚠️ **Backend phải đang chạy** thì Frontend mới lấy được dữ liệu.

---

## 🌿 Bước 5: Tạo Nhánh Và Bắt Đầu Code

Xem chi tiết quy trình Git tại file [GIT_GUIDELINE.md](./GIT_GUIDELINE.md).

**Tóm tắt nhanh:**

```bash
# 1. Đảm bảo đang ở develop và đã pull mới nhất
git checkout develop
git pull origin develop

# 2. Tạo nhánh riêng (thay tên-bạn và tên-tính-năng)
git checkout -b ten-ban/feat/ten-tinh-nang
# Ví dụ: an/feat/rooms-crud-api

# 3. Code xong → commit
git add .
git commit -m "feat: mo ta ngan gon"

# 4. Push và tạo Pull Request
git push origin ten-ban/feat/ten-tinh-nang
# Lên GitHub → tạo PR vào develop → tag Leader review
```

---

## 📖 Bước 6: Cách Tạo API Mới (Copy Từ Mẫu)

Tham khảo mẫu **RoomTypes** đã có sẵn, các bạn làm theo 6 bước:

### Backend (mở bằng Visual Studio 2022):

| Bước | File cần tạo | Copy từ |
|------|-------------|---------|
| 1 | `Models/` | Đã có sẵn (22 models), **KHÔNG cần tạo thêm** |
| 2 | `Repositories/IXxxRepository.cs` | Copy từ `IRoomTypeRepository.cs` |
| 3 | `Repositories/XxxRepository.cs` | Copy từ `RoomTypeRepository.cs` |
| 4 | `DTOs/XxxDTOs.cs` | Copy từ `RoomTypeDTOs.cs` |
| 5 | `Services/IXxxService.cs` + `XxxService.cs` | Copy từ `IRoomTypeService.cs` + `RoomTypeService.cs` |
| 6 | `Controllers/XxxController.cs` | Copy từ `RoomTypesController.cs` |

> **Sau khi tạo xong**, mở file `Program.cs` và đăng ký DI:
> ```csharp
> builder.Services.AddScoped<IXxxRepository, XxxRepository>();
> builder.Services.AddScoped<IXxxService, XxxService>();
> ```

### Frontend (mở bằng VS Code):

| Bước | Thao tác |
|------|---------|
| 1 | Copy folder `src/pages/RoomTypes/` → `src/pages/TenModule/` |
| 2 | Đổi tên component, API endpoint trong file mới |
| 3 | Mở `src/App.jsx` → thêm Route mới  |

---

## 🏗️ Cấu Trúc Thư Mục

```
web_hotelmanagement_t7/
├── backend/                        ← Mở bằng Visual Studio 2022
│   ├── HotelManagement.sln
│   └── HotelManagement.API/
│       ├── Controllers/            ← API endpoints
│       ├── Models/                 ← Entity đã có sẵn (KHÔNG SỬA)
│       ├── DTOs/                   ← Request/Response models
│       ├── Repositories/           ← Truy vấn database
│       ├── Services/               ← Business logic
│       ├── Data/HotelDbContext.cs   ← Đã có sẵn (KHÔNG SỬA)
│       ├── Program.cs              ← Đăng ký DI ở đây
│       └── appsettings.json        ← Connection string
│
├── frontend/                       ← Mở bằng VS Code
│   └── src/
│       ├── api/axiosClient.js      ← Đã cấu hình (KHÔNG SỬA)
│       ├── components/Layout/      ← Sidebar + Header (KHÔNG SỬA)
│       ├── pages/                  ← Thêm trang mới ở đây
│       └── App.jsx                 ← Thêm Route mới ở đây
│
├── database/HotelManagement.sql    ← Script tạo DB
├── GIT_GUIDELINE.md                ← Quy trình Git
└── GETTING_STARTED.md              ← File này
```

> **Ghi chú:** Các file ghi "KHÔNG SỬA" là file dùng chung. Nếu cần sửa, hãy thông báo Leader trước.

---

## ❓ FAQ — Lỗi Thường Gặp

### Backend không chạy được?
- **Lỗi connection string**: Kiểm tra lại tên Server trong `appsettings.json`.
- **Lỗi thiếu package**: Chạy `dotnet restore` trong folder `backend/HotelManagement.API`.
- **Port bị trùng**: Tắt app khác đang dùng cùng port, hoặc đổi port trong `Properties/launchSettings.json`.

### Frontend không hiện dữ liệu?
- Kiểm tra **Backend đang chạy** (terminal phải đang mở).
- Kiểm tra port backend trong `frontend/src/api/axiosClient.js` ← `baseURL` phải trùng với port backend.

### Git bị conflict?
- Xem hướng dẫn ở mục **Xử lý Xung đột** trong [GIT_GUIDELINE.md](./GIT_GUIDELINE.md).

---

**Chúc team code vui! Nếu gặp lỗi, hãy nhắn Leader ngay.** 🚀
