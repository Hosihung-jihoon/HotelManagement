import { useState } from 'react';
import styles from './FAQPage.module.css';

const FAQPage = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      category: 'Đặt phòng',
      questions: [
        {
          q: 'Làm thế nào để đặt phòng?',
          a: 'Bạn có thể đặt phòng trực tiếp trên website của chúng tôi bằng cách chọn ngày nhận/trả phòng, loại phòng và điền thông tin cá nhân. Hoặc liên hệ hotline +84 123 456 789 để được hỗ trợ.'
        },
        {
          q: 'Tôi có thể hủy hoặc thay đổi đặt phòng không?',
          a: 'Có, bạn có thể hủy hoặc thay đổi đặt phòng. Hủy trước 48 giờ sẽ được hoàn tiền 100%. Hủy trong vòng 24-48 giờ hoàn 50%. Hủy trong vòng 24 giờ không được hoàn tiền.'
        },
        {
          q: 'Tôi có nhận được xác nhận đặt phòng không?',
          a: 'Có, sau khi đặt phòng thành công, bạn sẽ nhận được email xác nhận với mã đặt phòng và thông tin chi tiết.'
        },
        {
          q: 'Có cần thanh toán trước không?',
          a: 'Tùy vào loại phòng và chương trình khuyến mãi. Một số phòng yêu cầu thanh toán trước, số khác có thể thanh toán khi nhận phòng.'
        }
      ]
    },
    {
      category: 'Nhận phòng & Trả phòng',
      questions: [
        {
          q: 'Giờ nhận phòng và trả phòng là mấy giờ?',
          a: 'Giờ nhận phòng từ 14:00 và trả phòng trước 12:00. Bạn có thể yêu cầu nhận phòng sớm hoặc trả phòng muộn tùy tình trạng phòng (có thể phụ thu).'
        },
        {
          q: 'Tôi có thể nhận phòng sớm không?',
          a: 'Có, tùy thuộc vào tình trạng phòng trống. Vui lòng liên hệ trước để chúng tôi sắp xếp. Nhận phòng sớm có thể phụ thu.'
        },
        {
          q: 'Cần giấy tờ gì khi nhận phòng?',
          a: 'Bạn cần xuất trình CMND/CCCD hoặc Hộ chiếu (đối với khách nước ngoài) và mã xác nhận đặt phòng.'
        },
        {
          q: 'Có dịch vụ giữ hành lý không?',
          a: 'Có, chúng tôi cung cấp dịch vụ giữ hành lý miễn phí trước giờ nhận phòng và sau giờ trả phòng.'
        }
      ]
    },
    {
      category: 'Tiện nghi & Dịch vụ',
      questions: [
        {
          q: 'Phòng có WiFi miễn phí không?',
          a: 'Có, tất cả các phòng đều có WiFi tốc độ cao miễn phí.'
        },
        {
          q: 'Có bãi đỗ xe không?',
          a: 'Có, chúng tôi có bãi đỗ xe miễn phí cho khách lưu trú. Số lượng chỗ đỗ có hạn, đặt trước để đảm bảo.'
        },
        {
          q: 'Có phục vụ bữa sáng không?',
          a: 'Có, chúng tôi phục vụ bữa sáng buffet từ 6:30 - 10:00. Một số gói phòng đã bao gồm bữa sáng.'
        },
        {
          q: 'Có dịch vụ giặt ủi không?',
          a: 'Có, chúng tôi cung cấp dịch vụ giặt ủi với phụ thu. Thời gian hoàn thành trong 24 giờ.'
        },
        {
          q: 'Có phòng gym và hồ bơi không?',
          a: 'Có, khách sạn có phòng gym và hồ bơi ngoài trời mở cửa từ 6:00 - 22:00 miễn phí cho khách lưu trú.'
        }
      ]
    },
    {
      category: 'Thanh toán',
      questions: [
        {
          q: 'Khách sạn chấp nhận hình thức thanh toán nào?',
          a: 'Chúng tôi chấp nhận tiền mặt, thẻ tín dụng (Visa, Mastercard), chuyển khoản ngân hàng và ví điện tử.'
        },
        {
          q: 'Giá phòng đã bao gồm thuế chưa?',
          a: 'Có, tất cả giá phòng hiển thị trên website đã bao gồm thuế VAT 10%.'
        },
        {
          q: 'Có chính sách giá đặc biệt không?',
          a: 'Có, chúng tôi có giá ưu đãi cho đặt phòng dài hạn, khách đoàn và thành viên. Liên hệ để biết thêm chi tiết.'
        }
      ]
    },
    {
      category: 'Chính sách khác',
      questions: [
        {
          q: 'Có cho phép mang thú cưng không?',
          a: 'Chúng tôi có một số phòng cho phép thú cưng với phụ thu. Vui lòng thông báo trước khi đặt phòng.'
        },
        {
          q: 'Có phòng hút thuốc không?',
          a: 'Không, tất cả các phòng đều là phòng không hút thuốc. Có khu vực hút thuốc riêng tại sảnh.'
        },
        {
          q: 'Trẻ em có được miễn phí không?',
          a: 'Trẻ em dưới 6 tuổi được miễn phí khi ở chung giường với bố mẹ. Trẻ từ 6-12 tuổi được giảm 50% khi thêm giường.'
        },
        {
          q: 'Có dịch vụ đưa đón sân bay không?',
          a: 'Có, chúng tôi cung cấp dịch vụ đưa đón sân bay với phụ thu. Vui lòng đặt trước ít nhất 24 giờ.'
        }
      ]
    }
  ];

  const toggleAccordion = (categoryIndex, questionIndex) => {
    const index = `${categoryIndex}-${questionIndex}`;
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className={styles.faqPage}>
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>❓ Câu Hỏi Thường Gặp</h1>
          <p>Tìm câu trả lời cho những thắc mắc của bạn</p>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.intro}>
          <p>
            Dưới đây là những câu hỏi thường gặp từ khách hàng. Nếu bạn không tìm thấy câu trả lời, 
            vui lòng <a href="/contact">liên hệ với chúng tôi</a>.
          </p>
        </div>

        {faqs.map((category, categoryIndex) => (
          <div key={categoryIndex} className={styles.categorySection}>
            <h2 className={styles.categoryTitle}>📌 {category.category}</h2>
            <div className={styles.accordion}>
              {category.questions.map((item, questionIndex) => {
                const index = `${categoryIndex}-${questionIndex}`;
                const isActive = activeIndex === index;
                
                return (
                  <div key={questionIndex} className={styles.accordionItem}>
                    <button
                      className={`${styles.accordionHeader} ${isActive ? styles.active : ''}`}
                      onClick={() => toggleAccordion(categoryIndex, questionIndex)}
                    >
                      <span>{item.q}</span>
                      <span className={styles.icon}>{isActive ? '−' : '+'}</span>
                    </button>
                    <div className={`${styles.accordionContent} ${isActive ? styles.show : ''}`}>
                      <p>{item.a}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className={styles.contactSection}>
          <h2>Vẫn còn thắc mắc?</h2>
          <p>Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn 24/7</p>
          <div className={styles.contactButtons}>
            <a href="/contact" className={styles.contactBtn}>
              📧 Liên hệ với chúng tôi
            </a>
            <a href="tel:+84123456789" className={styles.contactBtn}>
              📞 Gọi ngay: +84 123 456 789
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
