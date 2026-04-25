import styles from './PolicyPage.module.css';

const TermsOfServicePage = () => {
  return (
    <div className={styles.policyPage}>
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>📋 Điều Khoản Sử Dụng</h1>
          <p>Cập nhật lần cuối: 25/04/2026</p>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.content}>
          <section className={styles.section}>
            <h2>1. Chấp Nhận Điều Khoản</h2>
            <p>
              Bằng việc truy cập và sử dụng website HotelManagement, bạn đồng ý tuân thủ các điều khoản 
              và điều kiện được nêu trong tài liệu này. Nếu bạn không đồng ý với bất kỳ phần nào của 
              các điều khoản này, vui lòng không sử dụng dịch vụ của chúng tôi.
            </p>
          </section>

          <section className={styles.section}>
            <h2>2. Đặt Phòng</h2>
            <h3>2.1. Quy trình đặt phòng</h3>
            <ul>
              <li>Tất cả đặt phòng phải được thực hiện qua website hoặc liên hệ trực tiếp</li>
              <li>Thông tin đặt phòng phải chính xác và đầy đủ</li>
              <li>Xác nhận đặt phòng sẽ được gửi qua email</li>
            </ul>

            <h3>2.2. Thanh toán</h3>
            <ul>
              <li>Thanh toán có thể thực hiện qua thẻ tín dụng, chuyển khoản hoặc tiền mặt</li>
              <li>Một số loại phòng yêu cầu thanh toán trước</li>
              <li>Giá phòng đã bao gồm thuế VAT</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>3. Chính Sách Hủy Phòng</h2>
            <h3>3.1. Hủy miễn phí</h3>
            <ul>
              <li>Hủy trước 48 giờ: Hoàn tiền 100%</li>
              <li>Hủy trong vòng 24-48 giờ: Hoàn tiền 50%</li>
              <li>Hủy trong vòng 24 giờ: Không hoàn tiền</li>
            </ul>

            <h3>3.2. No-show</h3>
            <p>
              Nếu bạn không đến mà không thông báo, toàn bộ số tiền đặt phòng sẽ không được hoàn lại.
            </p>
          </section>

          <section className={styles.section}>
            <h2>4. Nhận Phòng & Trả Phòng</h2>
            <ul>
              <li><strong>Giờ nhận phòng:</strong> Từ 14:00</li>
              <li><strong>Giờ trả phòng:</strong> Trước 12:00</li>
              <li><strong>Nhận phòng sớm:</strong> Tùy thuộc vào tình trạng phòng, có thể phụ thu</li>
              <li><strong>Trả phòng muộn:</strong> Phụ thu 50% giá phòng nếu trả sau 18:00</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>5. Quy Định Khách Sạn</h2>
            <h3>5.1. Hành vi khách hàng</h3>
            <ul>
              <li>Không hút thuốc trong phòng (phạt 1.000.000 VNĐ)</li>
              <li>Không mang thú cưng (trừ phòng cho phép)</li>
              <li>Không gây ồn ào sau 22:00</li>
              <li>Tôn trọng tài sản khách sạn</li>
            </ul>

            <h3>5.2. Khách bổ sung</h3>
            <ul>
              <li>Số lượng khách không được vượt quá quy định</li>
              <li>Khách bổ sung có thể phụ thu</li>
              <li>Trẻ em dưới 6 tuổi miễn phí (không giường phụ)</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>6. Trách Nhiệm</h2>
            <h3>6.1. Trách nhiệm của khách sạn</h3>
            <ul>
              <li>Cung cấp phòng sạch sẽ, đầy đủ tiện nghi</li>
              <li>Bảo mật thông tin khách hàng</li>
              <li>Hỗ trợ khách hàng 24/7</li>
            </ul>

            <h3>6.2. Trách nhiệm của khách hàng</h3>
            <ul>
              <li>Giữ gìn tài sản khách sạn</li>
              <li>Tuân thủ quy định nội bộ</li>
              <li>Bồi thường thiệt hại do mình gây ra</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>7. Bồi Thường Thiệt Hại</h2>
            <p>
              Khách hàng phải bồi thường toàn bộ thiệt hại đối với tài sản khách sạn bị hư hỏng 
              hoặc mất mát do lỗi của mình. Giá trị bồi thường sẽ được tính theo giá thị trường 
              tại thời điểm xảy ra sự cố.
            </p>
          </section>

          <section className={styles.section}>
            <h2>8. Bất Khả Kháng</h2>
            <p>
              Khách sạn không chịu trách nhiệm đối với các sự kiện bất khả kháng như thiên tai, 
              dịch bệnh, chiến tranh, hoặc các quyết định của cơ quan nhà nước. Trong trường hợp này, 
              chúng tôi sẽ cố gắng hỗ trợ khách hàng tốt nhất có thể.
            </p>
          </section>

          <section className={styles.section}>
            <h2>9. Thay Đổi Điều Khoản</h2>
            <p>
              Chúng tôi có quyền thay đổi các điều khoản này bất cứ lúc nào. Các thay đổi sẽ có 
              hiệu lực ngay khi được đăng tải trên website. Việc tiếp tục sử dụng dịch vụ sau khi 
              có thay đổi đồng nghĩa với việc bạn chấp nhận các điều khoản mới.
            </p>
          </section>

          <section className={styles.section}>
            <h2>10. Giải Quyết Tranh Chấp</h2>
            <p>
              Mọi tranh chấp phát sinh sẽ được giải quyết thông qua thương lượng. Nếu không đạt 
              được thỏa thuận, tranh chấp sẽ được giải quyết tại Tòa án có thẩm quyền tại 
              Thành phố Hồ Chí Minh, Việt Nam.
            </p>
          </section>

          <section className={styles.section}>
            <h2>11. Liên Hệ</h2>
            <p>Nếu bạn có câu hỏi về điều khoản sử dụng, vui lòng liên hệ:</p>
            <div className={styles.contactBox}>
              <p><strong>Email:</strong> legal@hotelmanagement.com</p>
              <p><strong>Điện thoại:</strong> +84 123 456 789</p>
              <p><strong>Địa chỉ:</strong> 123 Đường Nguyễn Huệ, Quận 1, TP.HCM</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
