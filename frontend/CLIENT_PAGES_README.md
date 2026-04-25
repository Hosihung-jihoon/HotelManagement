# Client Site Pages - HotelManagement

## 📋 Tổng quan

Tài liệu này mô tả các trang client site đã được thiết kế cho khách sạn HotelManagement, bao gồm:
- Tin tức & Blog
- Địa điểm tham quan
- Đánh giá khách hàng
- Đăng nhập/Đăng ký
- Liên hệ
- Các trang chính sách

## 🎨 Các trang đã tạo

### 1. Trang Tin tức & Blog

#### ArticlesPage (`/articles`)
- **Mô tả**: Hiển thị danh sách tất cả bài viết/blog
- **Tính năng**:
  - Lọc theo danh mục
  - Hiển thị dạng grid với hình ảnh
  - Phân trang
  - Responsive design
- **File**: 
  - `frontend/src/pages/ArticlesPage.jsx`
  - `frontend/src/pages/ArticlesPage.module.css`

#### ArticleDetailPage (`/articles/:id`)
- **Mô tả**: Hiển thị chi tiết một bài viết
- **Tính năng**:
  - Breadcrumb navigation
  - Featured image
  - Nội dung bài viết với HTML formatting
  - Tags
  - Nút chia sẻ (Facebook, Twitter, Copy link)
  - Sidebar với bài viết liên quan
  - Form đăng ký nhận tin
- **File**: 
  - `frontend/src/pages/ArticleDetailPage.jsx`
  - `frontend/src/pages/ArticleDetailPage.module.css`

### 2. Trang Địa điểm Tham quan

#### AttractionsPage (`/attractions`)
- **Mô tả**: Hiển thị các địa điểm tham quan xung quanh khách sạn
- **Tính năng**:
  - Lọc theo loại địa điểm (Danh lam, Nhà hàng, Mua sắm, Giải trí, Văn hóa)
  - Hiển thị thông tin: tên, mô tả, địa chỉ, khoảng cách, giờ mở cửa
  - Nút "Xem trên bản đồ" (mở Google Maps)
  - Responsive grid layout
- **File**: 
  - `frontend/src/pages/AttractionsPage.jsx`
  - `frontend/src/pages/AttractionsPage.module.css`

### 3. Section Đánh giá

#### ReviewsSection Component
- **Mô tả**: Component hiển thị đánh giá từ khách hàng
- **Tính năng**:
  - Điểm đánh giá trung bình
  - Biểu đồ phân bố đánh giá (5 sao → 1 sao)
  - Danh sách đánh giá với avatar, tên, ngày, nội dung
  - Có thể lọc theo roomId
- **Sử dụng**: Có thể nhúng vào HomePage hoặc RoomDetailPage
- **File**: 
  - `frontend/src/components/reviews/ReviewsSection.jsx`
  - `frontend/src/components/reviews/ReviewsSection.module.css`

### 4. Trang Đăng nhập/Đăng ký

#### RegisterPage (`/register`)
- **Mô tả**: Trang đăng ký tài khoản mới
- **Tính năng**:
  - Form đăng ký với validation
  - Xác nhận mật khẩu
  - Link đến trang đăng nhập
  - Tùy chọn đăng ký qua Facebook/Google
- **File**: 
  - `frontend/src/pages/RegisterPage.jsx`
  - `frontend/src/pages/AuthPage.module.css`

#### ForgotPasswordPage (`/forgot-password`)
- **Mô tả**: Trang quên mật khẩu
- **Tính năng**:
  - Form nhập email
  - Hiển thị thông báo thành công
  - Link quay lại đăng nhập
- **Lưu ý**: Để reset mật khẩu, khách hàng cần liên hệ trực tiếp
- **File**: 
  - `frontend/src/pages/ForgotPasswordPage.jsx`
  - `frontend/src/pages/AuthPage.module.css`

### 5. Trang Liên hệ

#### ContactPage (`/contact`)
- **Mô tả**: Trang liên hệ với khách sạn
- **Tính năng**:
  - Thông tin liên hệ (địa chỉ, điện thoại, email, giờ làm việc)
  - Form gửi tin nhắn
  - Google Maps tích hợp
  - Responsive layout
- **File**: 
  - `frontend/src/pages/ContactPage.jsx`
  - `frontend/src/pages/ContactPage.module.css`

### 6. Trang Chính sách

#### FAQPage (`/faq`)
- **Mô tả**: Trang câu hỏi thường gặp
- **Tính năng**:
  - Accordion UI (mở/đóng câu hỏi)
  - Phân loại theo chủ đề
  - Section liên hệ ở cuối
- **File**: 
  - `frontend/src/pages/FAQPage.jsx`
  - `frontend/src/pages/FAQPage.module.css`

#### PrivacyPolicyPage (`/privacy-policy`)
- **Mô tả**: Trang chính sách bảo mật
- **Nội dung**:
  - Thu thập thông tin
  - Sử dụng thông tin
  - Bảo mật dữ liệu
  - Quyền của khách hàng
- **File**: 
  - `frontend/src/pages/PrivacyPolicyPage.jsx`
  - `frontend/src/pages/PolicyPage.module.css`

#### TermsOfServicePage (`/terms-of-service`)
- **Mô tả**: Trang điều khoản sử dụng
- **Nội dung**:
  - Quy định đặt phòng
  - Chính sách hủy phòng
  - Quy định khách sạn
  - Trách nhiệm các bên
- **File**: 
  - `frontend/src/pages/TermsOfServicePage.jsx`
  - `frontend/src/pages/PolicyPage.module.css`

## 🔗 Routes đã cập nhật

File `App.jsx` đã được cập nhật với các routes sau:

```javascript
// Auth
/login
/register
/forgot-password

// Content
/articles
/articles/:id
/attractions

// Support
/contact
/faq
/privacy-policy
/terms-of-service
```

## 🎨 Design System

Tất cả các trang sử dụng:
- **Color scheme**: Gradient tím (#667eea → #764ba2)
- **Typography**: Font system mặc định với hierarchy rõ ràng
- **Spacing**: Consistent padding và margin
- **Responsive**: Mobile-first approach
- **Components**: Card-based layout với shadow và border-radius

## 📱 Responsive Breakpoints

- **Desktop**: > 968px
- **Tablet**: 768px - 968px
- **Mobile**: < 768px

## 🔌 API Integration

Các trang cần kết nối với API endpoints sau:

### Articles
- `GET /api/articles` - Lấy danh sách bài viết
- `GET /api/articles/:id` - Lấy chi tiết bài viết
- `GET /api/articlecategories` - Lấy danh mục bài viết

### Attractions
- `GET /api/attractions` - Lấy danh sách địa điểm

### Reviews
- `GET /api/reviews` - Lấy danh sách đánh giá
- `GET /api/reviews?roomId=:id` - Lấy đánh giá theo phòng

### Contact
- `POST /api/contact` - Gửi form liên hệ

### Auth
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/forgot-password` - Quên mật khẩu

## 🚀 Cách sử dụng

### 1. Chạy development server

```bash
cd frontend
npm install
npm run dev
```

### 2. Thêm ReviewsSection vào trang

```jsx
import ReviewsSection from '../components/reviews/ReviewsSection';

// Trong component
<ReviewsSection /> // Tất cả reviews
<ReviewsSection roomId={123} /> // Reviews của phòng cụ thể
```

### 3. Cấu hình Google Maps API

Trong `ContactPage.jsx`, thay đổi URL của iframe với địa chỉ thực tế:

```javascript
src="https://www.google.com/maps/embed?pb=!1m18!..."
```

## 📝 Lưu ý

1. **Mock Data**: Một số trang đang sử dụng mock data. Cần kết nối với API thực tế.

2. **Authentication**: Trang đăng ký/đăng nhập cần tích hợp với AuthContext hiện có.

3. **Google Maps**: Cần API key để sử dụng Google Maps trong production.

4. **Email Service**: Form liên hệ và newsletter cần backend service để gửi email.

5. **Social Login**: Nút đăng nhập Facebook/Google cần cấu hình OAuth.

6. **Images**: Cần thêm placeholder images vào thư mục `public/`:
   - `placeholder-article.jpg`
   - `placeholder-attraction.jpg`

## 🎯 Tính năng có thể mở rộng

1. **Search**: Thêm tìm kiếm bài viết và địa điểm
2. **Comments**: Cho phép bình luận trên bài viết
3. **Rating**: Cho phép khách hàng đánh giá
4. **Booking Integration**: Đặt phòng trực tiếp từ trang địa điểm
5. **Multi-language**: Hỗ trợ đa ngôn ngữ
6. **Dark Mode**: Theme tối
7. **PWA**: Progressive Web App support

## 📞 Hỗ trợ

Nếu có vấn đề hoặc câu hỏi, vui lòng liên hệ team phát triển.
