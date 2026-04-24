import { AlertTriangle, ArrowLeft, BedDouble, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getDefaultHotelImage } from '../../utils/publicRoomData';
import './ErrorPage.css';

function ErrorPage({ variant = '404' }) {
  const isServerError = variant === '500';

  return (
    <main className="hotel-error-page" id="error-pages">
      <div className="hotel-error-media">
        <img
          src={isServerError
            ? getDefaultHotelImage('serverError')
            : getDefaultHotelImage('notFound')}
          alt={isServerError ? 'Hotel corridor' : 'Hotel lounge'}
        />
      </div>

      <section className="hotel-error-content">
        <span className="hotel-kicker">{isServerError ? 'Server status' : 'Lost in the lobby'}</span>
        <h1>{isServerError ? '500' : '404'}</h1>
        <h2>{isServerError ? 'Hệ thống đang xử lý lại yêu cầu.' : 'Trang bạn tìm không còn trong hành trình hiện tại.'}</h2>
        <p>
          {isServerError
            ? 'Thiết kế trang lỗi theo phong cách khách sạn: nền ảnh thật, text tối giản và CTA rõ để quay về khu vực an toàn.'
            : 'Bạn có thể quay lại trang chủ client site, xem quỹ phòng hoặc vào khu admin mà không bị rơi vào ngõ cụt.'}
        </p>

        <div className="hotel-error-actions">
          <Link to="/site" className="hotel-primary-link">
            <Compass size={16} />
            <span>Về trang chủ</span>
          </Link>
          <Link to="/site/rooms" className="hotel-secondary-link">
            <BedDouble size={16} />
            <span>Xem quỹ phòng</span>
          </Link>
          <Link to="/login" className="hotel-tertiary-link">
            <ArrowLeft size={16} />
            <span>Admin portal</span>
          </Link>
        </div>

        <div className="hotel-error-note">
          <AlertTriangle size={16} />
          <span>{isServerError ? 'Nên dùng route này để trình diễn trang lỗi 500.' : 'Route không xác định sẽ vào trang lỗi 404 này.'}</span>
        </div>
      </section>
    </main>
  );
}

export default ErrorPage;
