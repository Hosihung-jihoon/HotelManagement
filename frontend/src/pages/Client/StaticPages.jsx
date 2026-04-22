import './StaticPages.css';

export function FaqPage() {
  return (
    <div className="static-page">
      <div className="static-container">
        <h1 className="display-lg">Câu Hỏi Thường Gặp</h1>
        <div className="static-content body-lg">
          <div className="faq-item">
            <h3>Thời gian nhận và trả phòng là khi nào?</h3>
            <p>Thời gian nhận phòng (Check-in) từ 14:00 và thời gian trả phòng (Check-out) là trước 12:00 trưa. Chúng tôi có thể linh động tùy thuộc vào tình trạng phòng trống.</p>
          </div>
          <div className="faq-item">
            <h3>Khách sạn có dịch vụ đưa đón sân bay không?</h3>
            <p>Có, L'Horizon cung cấp dịch vụ đưa đón sân bay riêng với xe hạng sang. Vui lòng liên hệ lễ tân trước 24 giờ để đặt dịch vụ.</p>
          </div>
          <div className="faq-item">
            <h3>Trẻ em có được tính thêm phí không?</h3>
            <p>Trẻ em dưới 6 tuổi được miễn phí khi ngủ chung giường với bố mẹ (tối đa 1 trẻ/phòng). Trẻ từ 6 đến 11 tuổi phụ thu ăn sáng. Trẻ từ 12 tuổi trở lên được tính như người lớn.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PrivacyPolicyPage() {
  return (
    <div className="static-page">
      <div className="static-container">
        <h1 className="display-lg">Chính Sách Bảo Mật</h1>
        <div className="static-content body-lg">
          <h3>1. Thu thập thông tin</h3>
          <p>Chúng tôi chỉ thu thập những thông tin cần thiết để xử lý đặt phòng và cá nhân hóa trải nghiệm của quý khách tại khách sạn, bao gồm họ tên, email, số điện thoại và sở thích lưu trú.</p>
          
          <h3>2. Sử dụng thông tin</h3>
          <p>Thông tin của quý khách được bảo mật tuyệt đối và không được chia sẻ cho bên thứ ba vì mục đích thương mại. Chúng tôi có thể sử dụng email để gửi các ưu đãi đặc biệt nếu quý khách đồng ý nhận tin.</p>
          
          <h3>3. Bảo vệ dữ liệu</h3>
          <p>Hệ thống của chúng tôi áp dụng các tiêu chuẩn mã hóa SSL tiên tiến nhất để đảm bảo an toàn cho dữ liệu và thông tin thanh toán của quý khách.</p>
        </div>
      </div>
    </div>
  );
}

export function TermsOfUsePage() {
  return (
    <div className="static-page">
      <div className="static-container">
        <h1 className="display-lg">Điều Khoản Sử Dụng</h1>
        <div className="static-content body-lg">
          <h3>1. Chấp nhận điều khoản</h3>
          <p>Khi truy cập và sử dụng website của L'Horizon, quý khách đồng ý tuân thủ các điều khoản và điều kiện được nêu tại đây.</p>
          
          <h3>2. Chính sách hủy phòng</h3>
          <p>Hủy phòng trước 3 ngày so với ngày nhận phòng sẽ được hoàn tiền 100%. Hủy trong vòng 3 ngày sẽ bị tính phí đêm đầu tiên. Các đặt phòng trong dịp Lễ/Tết có thể áp dụng chính sách khác.</p>
          
          <h3>3. Trách nhiệm của khách lưu trú</h3>
          <p>Quý khách vui lòng xuất trình giấy tờ tùy thân hợp lệ khi nhận phòng. Khách sạn không chịu trách nhiệm đối với các vật dụng giá trị không được gửi tại két an toàn của lễ tân.</p>
        </div>
      </div>
    </div>
  );
}
