# Azure Horizon — Client Site

Giao diện khách hàng cho hệ thống đặt phòng khách sạn Azure Horizon, được thiết kế theo design system **"The Atmospheric Horizon"** — một trải nghiệm cao cấp, editorial, không giống bất kỳ booking engine nào khác.

## 🎨 Design Philosophy

- **No-Line Rule**: Không dùng border 1px cứng nhắc, chỉ dùng tonal layering
- **Glassmorphism**: Navigation và booking bar dùng backdrop-blur
- **Typography**: Noto Serif (headlines) + Manrope (body)
- **Tonal Depth**: Surface hierarchy thay vì drop shadow
- **White Space as Luxury**: Padding rộng rãi, asymmetric layouts

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start dev server
npm run dev
```

Frontend sẽ chạy tại `http://localhost:5173`

Backend API cần chạy tại `http://localhost:5280`

## 📦 Tech Stack

- **React 18** + **Vite 7**
- **React Router DOM 7** — routing
- **Axios** — API client
- **Lucide React** — icons
- **CSS Modules** — scoped styling

## 🗂️ Structure

```
src/
├── api/              # API client (axios)
├── components/
│   ├── booking/      # DateRangePicker, BookingBar, BookingForm
│   ├── layout/       # Navbar, Footer
│   ├── rooms/        # RoomCard
│   └── ui/           # Button, Input (design system primitives)
├── context/          # AuthContext
├── pages/            # HomePage, SearchResultsPage, RoomDetailPage, etc.
└── styles/           # tokens.css, global.css
```

## 🎯 Features Implemented

### ✅ Booking Flow
- **Home Search**: Glassmorphic booking bar trên hero
- **Search Results**: Bộ lọc giá, số khách, sắp xếp
- **Date Range Picker**: Custom calendar với selected range
- **Room Detail**: Gallery, amenities, policies, booking panel
- **Booking Form**: Guest info, special requests, price breakdown
- **Confirmation**: Success page với booking details

### ✅ Design System
- Tonal layering (surface hierarchy)
- Ambient shadows (max 6% opacity)
- Ghost borders (outline-variant 15% opacity)
- Gradient CTAs (primary → primary-container)
- Minimalist tray inputs (bottom border only)
- Typography scale (display, headline, title, body, label)

### ✅ Responsive
- Mobile-first approach
- Hamburger menu cho mobile
- Sidebar filters với overlay
- Adaptive typography (clamp)

## 🔌 API Integration

Tất cả endpoints đều qua `src/api/client.js`:

- `GET /RoomTypes` — danh sách loại phòng
- `GET /RoomTypes/:id` — chi tiết phòng
- `POST /Bookings` — tạo booking
- `POST /Auth/login` — đăng nhập
- `POST /Auth/register` — đăng ký

JWT token tự động attach vào headers.

## 🎨 Design Tokens

Xem `src/styles/tokens.css` để biết full palette:

- **Primary**: `#00193c` (navy)
- **Surface**: `#f7fafc` → `#ffffff` (tonal hierarchy)
- **Fonts**: Noto Serif (serif) + Manrope (sans)
- **Spacing**: `--sp-1` → `--sp-32`
- **Radius**: `--r-sm` → `--r-3xl`
- **Shadows**: `--shadow-sm` → `--shadow-modal`

## 📝 Scripts

```bash
npm run dev      # Dev server (port 5173)
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # ESLint check
```

## 🌐 Environment Variables

```env
VITE_API_URL=http://localhost:5280/api
```

## 📸 Screenshots

- **Home**: Hero với glassmorphic booking bar, featured rooms, editorial about section
- **Search**: Sidebar filters, sort dropdown, room grid
- **Detail**: Image gallery, specs, amenities, sticky booking panel
- **Confirmation**: Success icon, booking details, next actions

## 🎯 Next Steps

- [ ] Register page
- [ ] My Bookings page (user dashboard)
- [ ] Services page
- [ ] About page
- [ ] Payment integration
- [ ] Review system
- [ ] Voucher application

---

**Design by**: "The Atmospheric Horizon" Design System  
**Built with**: React + Vite + Love ❤️
