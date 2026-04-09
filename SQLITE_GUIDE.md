# 🗄️ Hướng dẫn dùng SQLite thay SQL Server

> Dành cho thành viên không đủ dung lượng để cài đặt SQL Server.  
> Cả 2 database đều được hỗ trợ song song — chỉ cần đổi 1 dòng cấu hình.

---

## 📋 Tổng quan

| | SQL Server | SQLite |
|---|---|---|
| **Dung lượng cài đặt** | ~500MB — 2GB | **Không cần cài** (file `.db` ~vài MB) |
| **Phù hợp với** | Người phát triển chính / Deploy | Thành viên phát triển nhẹ |
| **Config key** | `"DatabaseProvider": "SqlServer"` | `"DatabaseProvider": "Sqlite"` |
| **Chia sẻ file DB** | Qua SQL Server | **Google Drive / OneDrive** |

---

## 🚀 Cách dùng SQLite (dành cho thành viên)

### Bước 1 — Lấy file `hotel.db`

- Nhận file `hotel.db` từ nhóm trưởng qua **Google Drive / OneDrive** (không có trên GitHub)
- Đặt file vào đúng thư mục: **`database/hotel.db`**

> ⚠️ File `hotel.db` **không được commit lên Git** (đã có `*.db` trong `.gitignore`).  
> Luôn chia sẻ qua Google Drive / OneDrive.

### Bước 2 — Chạy backend với SQLite

Mở terminal tại thư mục `backend/HotelManagement.API/`, chạy:

```powershell
$env:DatabaseProvider = "Sqlite"
dotnet run
```

> Biến môi trường `$env:DatabaseProvider` chỉ có hiệu lực trong session PowerShell hiện tại — không lo commit nhầm, không cần sửa bất kỳ file nào.

---

## 📁 Vị trí file trong dự án

```
web_hotelmanagement_t7/
├── database/
│   ├── hotel.db              ← ✅ Đặt file hotel.db vào đây
│   ├── hotel.sql
│   ├── HotelManagement.sql
│   └── export_to_sqlite.py
└── backend/HotelManagement.API/
    ├── appsettings.json       (SqliteConnection trỏ về ../../database/hotel.db)
    └── appsettings.Sqlite.json
```

---

## 📤 Export dữ liệu từ SQL Server → SQLite

> Chỉ người đang dùng SQL Server mới cần làm bước này, sau đó chia sẻ file `hotel.db` cho team.

### Yêu cầu

- Python 3.8+
- ODBC Driver 17 for SQL Server: https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server

```powershell
pip install pyodbc
```

### Các bước thực hiện

```powershell
# Bước 1: Tạo schema SQLite (chạy tại backend/HotelManagement.API/)
$env:DatabaseProvider = "Sqlite"
dotnet ef database update
# → Tạo file database/hotel.db với đầy đủ bảng

# Bước 2: Export toàn bộ data vào hotel.db (chạy tại database/)
cd ..\..\database
python export_to_sqlite.py
# → File database/hotel.db đã có đầy đủ dữ liệu

# Bước 3: Upload file database/hotel.db lên Google Drive và chia sẻ cho team
```

---

## ⚠️ Hạn chế khi dùng SQLite

| Tính năng | Hành vi với SQLite |
|---|---|
| Ghi đồng thời | Chỉ 1 writer tại một thời điểm (OK cho dev local) |
| SignalR | Hoạt động bình thường |
| Stored Procedures | Không có (dự án không dùng SP) |
| Performance | Đủ dùng cho môi trường dev |

---

## 🔄 Khi có migration mới

Mỗi khi team thêm EF Core migration mới, người dùng SQLite cần chạy:

```powershell
# Chạy tại backend/HotelManagement.API/
$env:DatabaseProvider = "Sqlite"
dotnet ef database update
```

---

## 🆘 Xử lý lỗi thường gặp

| Lỗi | Giải pháp |
|---|---|
| `hotel.db not found` | Đặt file vào `database/hotel.db` (nhận từ Google Drive) |
| `no such table: ...` | Chạy `dotnet ef database update` với `$env:DatabaseProvider = "Sqlite"` |
| `database is locked` | Đóng tất cả ứng dụng đang kết nối `hotel.db` rồi thử lại |
| `unable to open database file` | Kiểm tra thư mục `database/` đã tồn tại chưa |
