# 🚀 Getting Started - Hướng Dẫn Bắt Đầu Cho Thành Viên

> Sau khi clone repo về máy, hãy thực hiện các bước dưới đây **theo đúng thứ tự**.

---

## 📋 Yêu Cầu Cài Đặt (Prerequisites)

Đảm bảo máy đã cài sẵn:

| Phần mềm | Phiên bản | Dùng cho |
|----------|-----------|---------|
| **Visual Studio 2022** | Community trở lên | Backend (.NET) |
| **VS Code** | Mới nhất | Frontend (React) |
| **.NET 8 SDK** | 8.0+ | Chạy Backend API |
| **Node.js** | 18+ | Chạy Frontend React |
| **SQL Server** | 2019+ | Database |
| **SSMS** | Mới nhất | Quản lý Database |
| **Git** | Mới nhất | Quản lý code |
| **Postman** (tuỳ chọn) | Mới nhất | Test API |

---

## 🗄️ Bước 1: Tạo Database

1. Mở **SSMS**, kết nối đến SQL Server local.
2. Nhấn **New Query**, mở file `database/HotelManagement.sql`.
3. **Chạy toàn bộ script** (nhấn F5) → Database `HotelManagementDB` sẽ được tạo kèm dữ liệu mẫu.
4. Kiểm tra: Trong Object Explorer → Databases → `HotelManagementDB` → Tables → phải có **22 bảng**.

> ⚠️ **Ghi nhớ tên SQL Server instance** của bạn (VD: `localhost`, `localhost\SQLEXPRESS`, `.\MSSQLSERVER01`). Bước sau sẽ cần.

---

## ⚙️ Bước 2: Cấu Hình & Chạy Backend

### 2.1. Cập nhật Connection String

Mở file `backend/HotelManagement.API/appsettings.json`, tìm dòng `ConnectionStrings` và **sửa tên Server** cho khớp máy bạn:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=TÊN_SERVER_CỦA_BẠN;Database=HotelManagementDB;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

**Ví dụ phổ biến:**
- `Server=localhost` (mặc định)
- `Server=localhost\\SQLEXPRESS` (SQL Express)
- `Server=.\\MSSQLSERVER01` (Named Instance)

> ⚠️ **KHÔNG commit file này** nếu chỉ thay đổi tên Server cá nhân. File này đã có trong `.gitignore` phần dev.

### 2.2. Restore packages & Chạy

```bash
cd backend/HotelManagement.API
dotnet restore
dotnet run
```

### 2.3. Kiểm tra

- Mở trình duyệt: `http://localhost:5059/swagger`
- Nếu thấy **Swagger UI** với API `RoomTypes` → ✅ Backend OK!
- Thử **GET** `/api/RoomTypes` → phải trả về 10 loại phòng mẫu.

> 💡 Nếu port khác 5059, xem terminal output dòng `Now listening on: http://localhost:XXXX`.

---

## 🎨 Bước 3: Cấu Hình & Chạy Frontend

```bash
cd frontend
npm install
npm run dev
```

- Mở trình duyệt: `http://localhost:5173`
- Nếu thấy **Sidebar + Header + trang Dashboard** → ✅ Frontend OK!
- Click menu **"Loại Phòng"** → thấy bảng dữ liệu (cần Backend đang chạy).

> 💡 Nếu trang Loại Phòng báo lỗi, kiểm tra Backend đã chạy ở cổng 5059 chưa. Nếu port Backend khác, sửa `baseURL` trong file `frontend/src/api/axiosClient.js`.

---

## 📂 Bước 4: Hiểu Cấu Trúc Dự Án

```
📁 backend/HotelManagement.API/
├── Controllers/     ← API endpoints (mỗi người 1-2 file)
├── Models/          ← Entity classes (đã tạo sẵn, KHÔNG SỬA)
├── DTOs/            ← Request/Response objects
├── Data/            ← DbContext (đã tạo sẵn, KHÔNG SỬA)
├── Repositories/    ← Truy vấn database
├── Services/        ← Business logic
└── Program.cs       ← Đăng ký DI (thêm service mới vào đây)

📁 frontend/src/
├── api/             ← Axios client (dùng chung)
├── components/      ← Components dùng chung (Layout,...)
├── pages/           ← Mỗi module 1 folder (mỗi người 1-3 folder)
├── hooks/           ← Custom hooks
├── context/         ← React Context (state toàn cục)
└── App.jsx          ← Routing (thêm Route mới vào đây)
```

---

## 🧑‍💻 Bước 5: Bắt Đầu Code Theo Module Của Bạn

### Backend — Copy theo mẫu RoomType:

1. **Tạo Repository** — copy `Repositories/IRoomTypeRepository.cs` → đổi tên entity
2. **Tạo Repository Impl** — copy `Repositories/RoomTypeRepository.cs`
3. **Tạo DTOs** — copy `DTOs/RoomTypeDTOs.cs` → đổi fields theo bảng của bạn
4. **Tạo Service** — copy `Services/IRoomTypeService.cs` + `RoomTypeService.cs`
5. **Tạo Controller** — copy `Controllers/RoomTypesController.cs`
6. **Đăng ký DI** — thêm 2 dòng vào `Program.cs`:
   ```csharp
   builder.Services.AddScoped<ITenRepository, TenRepository>();
   builder.Services.AddScoped<ITenService, TenService>();
   ```

### Frontend — Copy theo mẫu RoomTypesPage:

1. Copy folder `pages/RoomTypes/` → `pages/TenModuleCuaBan/`
2. Đổi API endpoint trong `axiosClient.get('/TenController')`
3. Đổi tên columns trong bảng cho khớp
4. Thêm Route vào `App.jsx`

---

## 🌿 Bước 6: Quy Trình Git (Quan Trọng!)

> Chi tiết đầy đủ xem file `GIT_GUIDELINE.md`

**Tóm tắt nhanh:**

```bash
# 1. Luôn cập nhật develop trước
git checkout develop
git pull origin develop

# 2. Tạo nhánh riêng
git checkout -b ten-ban/feat/mo-ta-ngan
# VD: an/feat/api-rooms

# 3. Code xong → commit
git add .
git commit -m "feat: mo ta ngan gon"

# 4. Push & tạo Pull Request
git push origin ten-ban/feat/mo-ta-ngan
# → Vào GitHub tạo PR vào develop → Tag Leader review
```

---

## ❓ Gặp Lỗi Thường Gặp?

| Lỗi | Nguyên nhân | Cách sửa |
|-----|------------|---------|
| `Cannot connect to database` | Sai tên Server | Sửa `appsettings.json` |
| `Port already in use` | Đang chạy app khác trên cùng port | Tắt app cũ hoặc đổi port |
| `npm ERR!` | Chưa install packages | Chạy `npm install` trong folder `frontend/` |
| `dotnet: command not found` | Chưa cài .NET SDK | Cài [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) |
| `CORS error` trên frontend | Backend chưa chạy hoặc sai port | Kiểm tra Backend + sửa `baseURL` trong `axiosClient.js` |
| `Conflict khi merge` | 2 người sửa cùng file | Xem phần Conflict trong `GIT_GUIDELINE.md` |

---

**Nếu vẫn gặp vấn đề, hãy hỏi ngay trên nhóm chat để Leader hỗ trợ.** 💪
