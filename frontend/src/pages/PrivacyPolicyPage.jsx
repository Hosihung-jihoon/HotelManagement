import styles from './PolicyPage.module.css';

const PrivacyPolicyPage = () => {
  return (
    <div className={styles.policyPage}>
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>🔒 Chính Sách Bảo Mật</h1>
          <p>Cập nhật lần cuối: 25/04/2026</p>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.content}>
          <section className={styles.section}>
            <h2>1. Giới Thiệu</h2>
            <p>
              Chào mừng bạn đến với HotelManagement. Chúng tôi cam kết bảo vệ quyền riêng tư và 
              thông tin cá nhân của bạn. Chính sách bảo mật này giải thích cách chúng tôi thu thập, 
              sử dụng, lưu trữ và bảo vệ thông tin của bạn khi sử dụng dịch vụ của chúng tôi.
            </p>
          </section>

          <section className={styles.section}>
            <h2>2. Thông Tin Chúng Tôi Thu Thập</h2>
            <h3>2.1. Thông tin cá nhân</h3>
            <ul>
              <li>Họ và tên</li>
              <li>Địa chỉ email</li>
              <li>Số điện thoại</li>
              <li>Địa chỉ</li>
              <li>Thông tin thanh toán</li>
              <li>Số CMND/CCCD/Hộ chiếu</li>
            </ul>

            <h3>2.2. Thông tin tự động</h3>
            <ul>
              <li>Địa chỉ IP</li>
              <li>Loại trình duyệt</li>
              <li>Thời gian truy cập</li>
              <li>Cookies và dữ liệu tương tự</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>3. Cách Chúng Tôi Sử Dụng Thông Tin</h2>
            <p>Chúng tôi sử dụng thông tin của bạn để:</p>
            <ul>
              <li>Xử lý đặt phòng và cung cấp dịch vụ</li>
              <li>Gửi xác nhận đặt phòng và thông tin liên quan</li>
              <li>Cải thiện chất lượng dịch vụ</li>
              <li>Gửi thông tin khuyến mãi (nếu bạn đồng ý)</li>
              <li>Tuân thủ các yêu cầu pháp lý</li>
              <li>Phát hiện và ngăn chặn gian lận</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>4. Chia Sẻ Thông Tin</h2>
            <p>Chúng tôi không bán thông tin cá nhân của bạn. Chúng tôi chỉ chia sẻ thông tin với:</p>
            <ul>
              <li><strong>Nhà cung cấp dịch vụ:</strong> Các đối tác xử lý thanh toán, gửi email</li>
              <li><strong>Yêu cầu pháp lý:</strong> Khi được yêu cầu bởi cơ quan có thẩm quyền</li>
              <li><strong>Bảo vệ quyền lợi:</strong> Để bảo vệ quyền và an toàn của chúng tôi và khách hàng</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>5. Bảo Mật Thông Tin</h2>
            <p>Chúng tôi áp dụng các biện pháp bảo mật:</p>
            <ul>
              <li>Mã hóa SSL/TLS cho tất cả dữ liệu truyền tải</li>
              <li>Hệ thống tường lửa và bảo mật mạng</li>
              <li>Kiểm soát truy cập nghiêm ngặt</li>
              <li>Đào tạo nhân viên về bảo mật thông tin</li>
              <li>Sao lưu dữ liệu định kỳ</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>6. Cookies</h2>
            <p>
              Chúng tôi sử dụng cookies để cải thiện trải nghiệm của bạn. Bạn có thể tắt cookies 
              trong cài đặt trình duyệt, nhưng điều này có thể ảnh hưởng đến một số chức năng của website.
            </p>
          </section>

          <section className={styles.section}>
            <h2>7. Quyền Của Bạn</h2>
            <p>Bạn có quyền:</p>
            <ul>
              <li>Truy cập và xem thông tin cá nhân của bạn</li>
              <li>Yêu cầu chỉnh sửa thông tin không chính xác</li>
              <li>Yêu cầu xóa thông tin cá nhân</li>
              <li>Từ chối nhận email marketing</li>
              <li>Rút lại sự đồng ý xử lý dữ liệu</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>8. Lưu Trữ Dữ Liệu</h2>
            <p>
              Chúng tôi lưu trữ thông tin của bạn trong thời gian cần thiết để cung cấp dịch vụ 
              và tuân thủ các nghĩa vụ pháp lý. Sau đó, dữ liệu sẽ được xóa hoặc ẩn danh hóa một cách an toàn.
            </p>
          </section>

          <section className={styles.section}>
            <h2>9. Thay Đổi Chính Sách</h2>
            <p>
              Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian. Mọi thay đổi sẽ được 
              đăng tải trên trang này với ngày cập nhật mới.
            </p>
          </section>

          <section className={styles.section}>
            <h2>10. Liên Hệ</h2>
            <p>Nếu bạn có câu hỏi về chính sách bảo mật, vui lòng liên hệ:</p>
            <div className={styles.contactBox}>
              <p><strong>Email:</strong> privacy@hotelmanagement.com</p>
              <p><strong>Điện thoại:</strong> +84 123 456 789</p>
              <p><strong>Địa chỉ:</strong> 123 Đường Nguyễn Huệ, Quận 1, TP.HCM</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
