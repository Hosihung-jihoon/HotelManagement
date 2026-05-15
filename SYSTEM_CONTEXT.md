# 📋 SYSTEM_CONTEXT — Hotel Management ERP

> **Mục đích:** File này là "bộ nhớ" duy nhất cho toàn bộ dự án. Bất kỳ phiên làm việc mới nào (với AI hoặc thành viên mới) đều cần đọc file này trước tiên.
>
> **Cập nhật lần cuối:** 2026-04-07 (Sprint 4 — SQLite support, Inventory refactor)

---

## 1. Tổng Quan Dự Án

| Tiêu chí | Chi tiết |
|----------|---------| 
| **Tên** | Hệ thống Quản trị Khách sạn (Hotel ERP & Booking Portal) |
| **Mô hình** | Monorepo — Backend + Frontend cùng 1 repository |
| **Cách tiếp cận DB** | **Database First** (Không chạy auto-migrate EF Core lúc khởi động) |
| **Quy mô** | 6 Module nghiệp vụ · 28 Entity Model · 4 Actors · 6 thành viên |
| **Timeline** | 6 Sprint (10/03 – 20/04/2026) |
| **Trạng thái hiện tại** | 🚧 Sprint 5 đang chạy (Hoàn thiện UI/UX, Fixbugs, Tích hợp BE↔FE) |

### Actors & Phân quyền (RBAC)

| Actor | Vai trò |
|-------|--------|
| **Guest** | Tìm phòng, đặt phòng, dùng voucher, tích điểm, đánh giá, xem blog |
| **Receptionist** | Check-in/out, gán phòng, POS dịch vụ, thu tiền |
| **Housekeeping** | Cập nhật trạng thái dọn phòng, báo cáo vật tư hư hỏng/thiếu minibar |
| **Manager/Admin** | Toàn quyền: danh mục, doanh thu, nhân sự, Audit Log |

---

## 2. Tech Stack

```
┌─────────── Frontend ───────────┐   ┌─────────── Backend ────────────┐
│  ReactJS (Vite)                │   │  .NET 8 Web API                │
│  Ant Design (antd)             │   │  Entity Framework Core 8       │
│  Zustand (global state)        │   │  Repository Pattern (Generic)  │
│  Axios + Interceptors          │   │  JWT Auth (BCrypt)             │
│  React Router DOM              │   │  Cloudinary (Image storage)    │
│  SignalR Client (@microsoft/   │   │  SignalR Hub (NotificationHub) │
│    signalr)                    │   │  Swagger / Postman             │
│  Context API (AuthContext)     │   │  Visual Studio 2022            │
│  VS Code                       │   │  🆕 SQLite (dev nhẹ)          │
└────────────────────────────────┘   └────────────────────────────────┘
                    │                            │
                    └─ SQL Server (SSMS) / SQLite ┘
                             GitHub (Monorepo)
```

> 🆕 **Dual Database:** Backend hỗ trợ cả SQL Server và SQLite. Xem `SQLITE_GUIDE.md` để biết cách chuyển đổi.

### Ports đang chạy

| Service | URL |
|---------|-----|
| **Frontend** | `http://localhost:5173` (Vite dev server) |
| **Backend** | `http://localhost:5261` (ASP.NET Core) |
| **Swagger** | `http://localhost:5261/swagger` |
| **SignalR Hub** | `http://localhost:5261/notificationHub` |

---

## 3. Quy Tắc Kỹ Thuật Bắt Buộc

### 3.1. Soft Delete — KHÔNG BAO GIỜ xóa cứng

```csharp
// Mỗi entity cần có cột:
[Column("is_active")]
public bool IsActive { get; set; } = true;

// Khi "xóa": entity.IsActive = false;
// Khi query: .Where(x => x.IsActive)
```

> **Lý do:** Bảo toàn lịch sử, không phá vỡ FK. Tất cả GET API phải lọc `is_active = true`.

### 3.2. Cloudinary — Lưu ảnh trên Cloud

| Quy tắc | Chi tiết |
|---------|---------|
| **Lifecycle** | Singleton (`builder.Services.AddSingleton<ICloudinaryService>()`) |
| **Upload** | Qua Stream, tự động crop `500x500px` |
| **Update ảnh** | Xóa ảnh cũ trên Cloudinary trước → upload ảnh mới |
| **Soft Delete có ảnh** | Xóa mềm bản ghi → xóa ảnh trên Cloud (dọn rác) |
| **Dùng cho** | Avatar user, Room Images, Blog thumbnails |

### 3.3. SEO & Slug

- Tự động sinh **slug** từ tiêu đề bài viết: `"Khám Phá Đà Nẵng"` → `kham-pha-da-nang`
- Xóa dấu tiếng Việt, thay khoảng trắng bằng `-`, thêm hậu tố nếu trùng.

### 3.4. Bảo Mật

| Hạng mục | Cách xử lý |
|---------|-----------|
| **Password** | BCrypt hash (KHÔNG lưu plaintext) |
| **Auth** | JWT Token, thời hạn 8h (~1 ca trực) |
| **IDOR** | KHÔNG nhận `userId` từ client — luôn giải mã từ Token Claims |
| **RBAC** | `User → Role → Permission` (động, gán realtime) |
| **Phân quyền N-N** | Chiến lược "Xóa và Ghi đè" (Delete-then-Insert) |

### 3.5. Price Locking

> Giá phòng **phải được khóa** tại thời điểm đặt (`price_per_night` trong `Booking_Details`), không thay đổi theo giá hiện tại của `Room_Types`.

### 3.6. Backend Pattern Bắt Buộc

```
Controller → Service → Repository → DbContext → Database
     ↕            ↕
   DTOs      Business Logic
```

> **Tạo module mới:** Copy mẫu `RoomType` (Controller + Service + IService + Repository) rồi đổi tên entity.

### 3.7. Database First Approach

> Dự án áp dụng phương pháp **Database First**. Schema database được quy định tử trước, và model Entity Framework phải được ánh xạ tay hoặc tự sinh (scaffold) đúng theo DB. **Tuyệt đối KHÔNG CHẠY `db.Database.Migrate()` lúc runtime** vì các bảng đã tồn tại sẵn trong CSDL rồi.

---

## 4. Cấu Trúc Database (28 Entity Models)

### Sơ đồ Module

```
Module 6: Auth & System          Module 2: Booking & CRM
┌──────────────────────┐         ┌──────────────────────┐
│ Users                │         │ Bookings             │
│ Roles                │         │ BookingDetails       │
│ Permissions          │         │ Vouchers             │
│ RolePermissions      │         │ Memberships          │
│ AuditLogs            │         └──────────────────────┘
│ Notifications        │
└──────────────────────┘         Module 5: Payment
                                 ┌──────────────────────┐
Module 3: Room & Inventory       │ Invoices             │
┌──────────────────────┐         │ Payments             │
│ RoomTypes            │         │ OrderServices        │
│ Rooms                │         │ OrderServiceDetails  │
│ RoomImages           │         └──────────────────────┘
│ RoomInventories      │
│ RoomTypeAmenities    │         Module 1: CMS & Content
│ Amenities            │         ┌──────────────────────┐
│ LossAndDamages       │         │ Articles             │
└──────────────────────┘         │ ArticleCategories    │
                                 │ Attractions          │
Module 4: Service & POS          │ Reviews              │
┌──────────────────────┐         └──────────────────────┘
│ Services             │
│ ServiceCategories    │
└──────────────────────┘
```

### Quan hệ quan trọng

| Quan hệ | Mô tả |
|---------|-------|
| `Bookings` → `BookingDetails` → `Rooms` | 1 booking có nhiều phòng (multi-room) |
| `BookingDetails` → `OrderServices` → `OrderServiceDetails` | Dịch vụ gắn theo từng phòng |
| `Bookings` → `Invoices` → `Payments` | 1 booking = 1 hóa đơn, nhiều lần thanh toán |
| `RoomTypes` ↔ `Amenities` (N-N qua `RoomTypeAmenities`) | Loại phòng có nhiều tiện nghi |
| `Users` → `Roles` → `Permissions` (N-N qua `RolePermissions`) | RBAC động |
| `Rooms` → `RoomInventories` → `LossAndDamages` | Kiểm kê vật tư, tính phạt |

### Unique Constraints

- `Users.email` · `Bookings.booking_code` · `Vouchers.code` · `Articles.slug`

---

## 5. Business Logic Quan Trọng

### 5.1. Thuật toán tìm phòng trống (Overlap Check — De Morgan)

```sql
-- Phòng BỊ TRÙNG nếu:
NOT (new_checkout <= existing_checkin OR new_checkin >= existing_checkout)

-- Tương đương: phòng TRỐNG nếu:
new_checkout <= existing_checkin OR new_checkin >= existing_checkout
```

> ⚠️ Cần xử lý **Race Condition** bằng cơ chế Locking khi 2 khách đặt cùng phòng cùng lúc.

### 5.2. Công thức Check-out

```
Final_Total = Tổng Tiền Phòng
            + Tổng Dịch Vụ (OrderServices)
            + Phạt Vật Tư (LossAndDamages)
            - Giảm Giá (Voucher + Membership)
```

### 5.3. Trạng thái phòng (Room Status)

```
Available → Occupied (Check-in)
Occupied  → Cleaning (Check-out)
Cleaning  → Available (Housekeeping hoàn tất)
*         → Maintenance (Bảo trì)
```

> Lễ tân chỉ gán phòng khi: `status = 'Available'` VÀ phòng đã `Clean`.

### 5.4. Membership & Loyalty

| Hạng | Điểm tối thiểu | Giảm giá |
|------|----------------|---------| 
| Bronze | 0 | 0% |
| Silver | 500 | 5% |
| Gold | 2000 | 10% |

> Tích điểm: **1 điểm / 10,000 VNĐ** thanh toán. Nâng/hạ hạng tự động.

### 5.5. Booking Status Flow

```
Pending → Confirmed → Checked-in → Checked-out
                   ↘ Cancelled
```

---

## 6. Phân Công Thành Viên

### Ma trận phân công

| Thành viên | Vai trò | Độ khó | Module phụ trách | Backend chính | Frontend chính |
|-----------|---------|--------|-----------------|--------------|---------------|
| **L** (Leader) | Kiến trúc sư & Full-stack | ⭐⭐⭐⭐⭐ | M6: Auth, Nhân sự, Dashboard | Auth API (JWT, RBAC), Dashboard API, NotificationHub | Layout, AuthContext, LoginPage, Dashboard, SignalR |
| **M1** | Backend & Frontend | ⭐⭐⭐⭐ | M2: Đặt phòng & CRM | Bookings, Vouchers (Overlap logic, Race condition) | Trang đặt phòng, Admin quản lý Booking |
| **M2** | Backend & Frontend | ⭐⭐⭐⭐ | M5: Thanh toán + M4 DV | Invoices, Payments, OrderServices (Check-out logic) | Trang hóa đơn, Form dịch vụ |
| **J1** | Backend & Frontend (CRUD) | ⭐⭐⭐ | M3: Quỹ phòng | RoomTypes, Rooms, RoomImages (CRUD, Cloudinary) | Admin quản lý Loại phòng, Phòng |
| **J2** | Backend & Frontend (CRUD) | ⭐⭐ | Danh mục chung | Services, Amenities, Memberships (CRUD) | Admin Dịch vụ, Tiện nghi, Membership |
| **J3** | Backend & Frontend (CRUD) | ⭐⭐ | M1: CMS & Vật tư | Articles, Attractions, Reviews, RoomInventory, LossAndDamages | Blog, Điểm tham quan, Đánh giá |

### API quan trọng theo thành viên

#### L (Leader) — Module Auth & Dashboard

```
POST   /api/Auth/login                  → JWT Token
POST   /api/Auth/register               → Tạo tài khoản
GET    /api/UserManagement              → Danh sách users (admin)
PUT    /api/UserManagement/{id}/role    → Gán role
GET    /api/UserProfile                 → Profile user hiện tại (từ JWT)
PUT    /api/UserProfile                 → Cập nhật profile + avatar
GET    /api/Dashboard/revenue           → Thống kê doanh thu
GET    /api/Dashboard/occupancy         → Tỷ lệ lấp đầy
GET    /api/Roles                       → Danh sách vai trò
POST   /api/Roles/{id}/permissions      → Gán quyền cho role
CRUD   /api/Notifications               → Thông báo realtime
SignalR /notificationHub                → Hub realtime
```

#### M1 — Module Booking & Voucher

```
POST   /api/Bookings/search             → Tìm phòng trống (Overlap Algorithm)
POST   /api/Bookings                    → Tạo booking (multi-room, price lock)
PUT    /api/Bookings/{id}/status        → Confirm / Cancel
PUT    /api/Bookings/{id}/checkin       → Check-in (gán phòng thực tế)
CRUD   /api/Vouchers                    → Quản lý mã giảm giá
```

#### M2 — Module Payment & Invoice

```
POST   /api/Bookings/{id}/checkout      → Check-out (tính tổng bill)
GET    /api/Invoices/{bookingId}        → Xem hóa đơn
POST   /api/Payments                    → Ghi nhận thanh toán (Cash/Bank/VNPay)
CRUD   /api/OrderServices               → Thêm dịch vụ cho khách (POS)
CRUD   /api/ServiceCategories           → Danh mục dịch vụ
```

#### J1 — Module Room

```
CRUD   /api/RoomTypes                   → Loại phòng (có template mẫu sẵn)
CRUD   /api/Rooms                       → Phòng vật lý
POST   /api/Rooms/bulk                  → Tạo hàng loạt phòng
CRUD   /api/RoomImages                  → Ảnh phòng (Cloudinary)
```

#### J2 — Module Service & Amenity

```
CRUD   /api/Services                    → Dịch vụ (F&B, giặt ủi, tour)
CRUD   /api/ServiceCategories           → Danh mục dịch vụ
CRUD   /api/Amenities                   → Tiện nghi phòng
CRUD   /api/Memberships                 → Hạng thành viên
```

#### J3 — Module CMS & Inventory

```
CRUD   /api/Articles                    → Bài viết blog (Slug tự động)
CRUD   /api/ArticleCategories           → Danh mục bài viết
CRUD   /api/Attractions                 → Điểm tham quan
CRUD   /api/Reviews                     → Đánh giá (chỉ sau checkout)
CRUD   /api/RoomInventories             → Vật tư phòng
POST   /api/LossAndDamages              → Báo cáo hư hỏng/mất mát
```

---

## 7. Kiến Trúc Code Hiện Tại

```
📁 backend/HotelManagement.API/
├── Controllers/           ← 21 API Controllers (ĐÃ TẠO ĐẦY ĐỦ)
│   ├── AuthController.cs
│   ├── UserManagementController.cs
│   ├── UserProfileController.cs
│   ├── RolesController.cs
│   ├── DashboardController.cs
│   ├── NotificationsController.cs
│   ├── BookingsController.cs
│   ├── VouchersController.cs
│   ├── InvoicesController.cs
│   ├── PaymentsController.cs
│   ├── OrderServicesController.cs
│   ├── RoomTypesController.cs
│   ├── RoomsController.cs
│   ├── AmenitiesController.cs
│   ├── ServicesController.cs
│   ├── ServiceCategoriesController.cs
│   ├── MembershipsController.cs
│   ├── ArticlesController.cs
│   ├── ArticleCategoriesController.cs
│   ├── AttractionsController.cs
│   └── RoomInventoriesController.cs
├── Models/                ← 28 Entity classes (ĐÃ TẠO, KHÔNG SỬA)
├── Data/HotelDbContext.cs ← EF Core context (ĐÃ TẠO)
├── DTOs/                  ← Request/Response objects
├── Repositories/          ← GenericRepository<T> (CRUD base)
├── Services/              ← 42 files (21 Interface + 21 Implementation)
├── Hubs/NotificationHub.cs← SignalR Hub (realtime notifications)
├── Middleware/            ← Custom middleware
└── Program.cs             ← DI, Swagger, CORS, SignalR

📁 frontend/src/
├── api/axiosClient.js     ← Axios + JWT interceptor (base URL: port 5261)
├── components/
│   ├── Layout/            ← Sidebar + Header (MainLayout)
│   └── PrivateRoute.jsx   ← Route guard (kiểm tra JWT)
├── context/AuthContext.jsx← Auth state (login/logout/user)
├── hooks/useSignalR.js    ← SignalR hook (kết nối NotificationHub)
├── pages/                 ← 17 page modules (xem bảng bên dưới)
├── utils/                 ← Helper functions
└── App.jsx                ← React Router + 8 routes chính
```

### Các trang Frontend đã có

| Route | Page Component | Trạng thái |
|-------|---------------|-----------|
| `/login` | `LoginPage` | ✅ Hoàn thành |
| `/` | `DashboardPage` | ✅ UI hiện đại (charts, KPIs) |
| `/rooms` | `RoomsPage` | ✅ CRUD đầy đủ |
| `/room-types` | `RoomTypesPage` | ✅ CRUD đầy đủ |
| `/inventory` | `InventoryPage` | ✅ **Refactor toàn cục** — gộp tất cả vật tư theo tên, không theo phòng |
| `/losses` | `LossesPage` | ✅ CRUD đầy đủ |
| `/housekeeping` | `HousekeepingPage` | ✅ UI dọn phòng |
| `/bookings` | `BookingsPage` | ✅ CRUD đầy đủ |
| `/users` | `UsersPage` | ✅ Quản lý nhân sự |
| `/roles` | `RolesPage` | ✅ RBAC phân quyền |
| `/vouchers` | `VouchersPage` | ✅ Quản lý mã giảm giá |
| `/audit-logs` | `AuditLogPage` | ✅ Nhật ký hệ thống |
| `/articles/*` | `ArticlesPage`, `ArticleEditor` | ✅ Quản lý bài viết blog |
| `/locations/*` | `LocationsPage`, `LocationMap` | ✅ Điểm tham quan |
| `/members` | `MembersPage` | ✅ Quản lý thành viên |
| `/front-desk/*` | `TodayArrivals`, `CurrentGuests`, `Checkout` | ✅ Quầy lễ tân, deep-link navigation |
| `/services` | `ServicesPage` | ✅ Quản lý dịch vụ |
| `/amenities` | `AmenitiesPage` | ✅ Quản lý tiện nghi |
| `/membership` (Client) | `MembershipPage` | ✅ Giao diện hạng thành viên cho khách hàng |
| — | `Invoices`, `Reviews` | 🚧 Đã tạo folder, đang phát triển |

---

## 8. Tài Liệu Tham Chiếu

| File | Mô tả |
|------|-------|
| `GETTING_STARTED.md` | Hướng dẫn setup sau khi clone repo |
| `GIT_GUIDELINE.md` | Quy trình Git & branching |
| `SQLITE_GUIDE.md` | 🆕 Hướng dẫn dùng SQLite thay SQL Server |
| `API_DOCUMENTATION.md` | Chi tiết API endpoints |
| `erd.mmd` | Sơ đồ ERD (Mermaid, màu theo thành viên) |
| `database/HotelManagement.sql` | Script tạo DB + seed data |
| `database/export_to_sqlite.py` | 🆕 Script export SQL Server → SQLite |
| `site.html` | API reference tĩnh (HTML) |

---

## 9. Sprint Timeline

| Sprint | Thời gian | Mục tiêu | Trạng thái |
|--------|----------|---------|-----------| 
| **1** | 10-16/03 | Setup base: Monorepo, DB, API mẫu, Git guideline | ✅ Hoàn thành |
| **2** | 17-23/03 | Backend CRUD cơ bản (mỗi người làm API của module mình) | ✅ Hoàn thành |
| **3** | 24-30/03 | Backend logic nâng cao (Overlap, Check-out, Dashboard, SignalR) | ✅ Hoàn thành |
| **4** | 31/03-06/04 | Frontend UI (Layout, CRUD pages, Forms) + SQLite support | ✅ Hoàn thành |
| **5** | 07-13/04 | Tích hợp BE↔FE, Fix bugs, Test E2E | 🚧 Đang chạy |
| **6** | 14-20/04 | Tài liệu, Swagger docs, Slide, Demo | ⏳ Chờ |

### Đã hoàn thành trong Sprint 3

- ✅ 21 Backend Controllers (toàn bộ module)
- ✅ 42 Service files (Interface + Implementation)
- ✅ 28 Entity Models
- ✅ NotificationHub (SignalR realtime)
- ✅ DashboardService (doanh thu, tỷ lệ lấp đầy)
- ✅ BookingService (Overlap check, multi-room)
- ✅ InvoiceService & PaymentService (Check-out logic)
- ✅ CloudinaryService (upload/delete ảnh)
- ✅ AuthService (JWT + BCrypt)
- ✅ Frontend: MainLayout, AuthContext, PrivateRoute, useSignalR hook
- ✅ Frontend: 9 trang Admin (Dashboard, Rooms, Inventory, Losses, Housekeeping, Bookings, Users, Roles, Login)

### Đã hoàn thành trong Sprint 4

- ✅ **SQLite dual-database support** — chuyển đổi bằng biến môi trường `$env:DatabaseProvider`
- ✅ **EF Core Migrations** — tạo đủ migration cho cả SQL Server và SQLite
- ✅ **Script export** `database/export_to_sqlite.py` — chuyển toàn bộ data SQL Server → `hotel.db`
- ✅ **SQLITE_GUIDE.md** — tài liệu hướng dẫn đầy đủ cho thành viên dùng SQLite
- ✅ **Inventory refactor (toàn cục)** — gộp vật tư theo tên trên toàn khách sạn, không theo từng phòng
- ✅ **RoomInventoryDTOs** cập nhật phù hợp với model toàn cục
- ✅ **RoomInventoryService** refactor logic tổng hợp số lượng, hư hỏng  
- ✅ **InventoryPage.jsx** + CSS — UI mới hiển thị danh sách vật tư toàn cục
- ✅ **HotelDbContext.cs** — cấu hình dual-provider, Check Constraint tương thích SQLite/SQL Server
- ✅ **Program.cs** — DI dynamic theo `DatabaseProvider` (SqlServer / Sqlite)
- ✅ `.gitignore` cập nhật — loại trừ `*.db`, `*.db-shm`, `*.db-wal`

### Đã hoàn thành trong Sprint 5 (Đang cập nhật)

- ✅ **Chuẩn hóa UI component:** Cập nhật đồng bộ `CustomSelect` cho tất cả dropdown (Users, Vouchers, Audit Log, Rooms).
- ✅ **Fix critical backend bug:** Thêm logic bắt buộc gọi validation thanh toán (`TotalAmount - PaidAmount <= 0`) trong `BookingService.cs` trước khi cập nhật trạng thái Checkout, phòng tránh lỗi trạng thái booking cập nhật sai.
- ✅ **Deep-linking & Navigation:** Tích hợp tính năng trỏ nhanh từ Dashboard Lễ tân (`Today Arrivals`) trực tiếp đến modal chi tiết cụ thể (`BookingsPage`).
- ✅ **New Modules (Frontend):** Hoàn thành giao diện & tích hợp cho các trang `Vouchers`, `AuditLog`, `Articles`, `Locations`, `Members`, và module `Front Desk`.
- ✅ **New Client Features:** Đã thêm trang Hạng Thành Viên (`MembershipPage`) hiển thị thông tin các bậc thẻ khách hàng thân thiết.
- ✅ **New Admin Modules:** Hoàn thiện tích hợp hiển thị danh sách Dịch Vụ (`Services`) và Tiện Nghi (`Amenities`) vào Admin Portal để giải quyết lỗi tải dữ liệu trên UI.

---

> **Ghi chú cho AI:** Khi nhận prompt về dự án này, hãy đọc file `SYSTEM_CONTEXT.md` trước. Mọi code phải tuân thủ: Soft Delete, Cloudinary, Repository Pattern, DTO mapping, JWT auth. Tham chiếu section 6 để biết ai đang làm module nào.
>
> **Backend:** Chạy `dotnet run` tại `backend/HotelManagement.API/`. Mặc định dùng SQL Server. Dùng SQLite: `$env:DatabaseProvider = "Sqlite"; dotnet run`.
> **Frontend:** Chạy `npm run dev` tại `frontend/`. URL: `http://localhost:5173`.
> **SQLite:** Xem `SQLITE_GUIDE.md` · File `hotel.db` không commit lên Git, chia sẻ qua Google Drive.
