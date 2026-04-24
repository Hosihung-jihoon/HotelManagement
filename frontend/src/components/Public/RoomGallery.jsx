import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Camera, ImageOff } from 'lucide-react';
import { getDefaultHotelImage } from '../../utils/publicRoomData';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './RoomGallery.css';

function RoomGallery({ images, roomName }) {
  if (!images?.length) {
    return (
      <div className="room-gallery-empty">
        <img src={getDefaultHotelImage()} alt={`${roomName} placeholder`} />
        <span className="room-gallery-empty-note">
          <ImageOff size={18} />
          Album dang duoc cap nhat cho {roomName}
        </span>
      </div>
    );
  }

  return (
    <div className="room-gallery">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 4200, disableOnInteraction: false }}
        loop={images.length > 1}
        className="room-gallery-swiper"
      >
        {images.map((image, index) => (
          <SwiperSlide key={`${image.imageUrl}-${index}`}>
            <div className="room-gallery-slide">
              <img src={image.imageUrl} alt={`${roomName} ${index + 1}`} />
              <span className="room-gallery-badge">
                <Camera size={14} />
                {image.sourceLabel || (image.isCloudinary ? 'Cloudinary album' : 'Photo set')}
              </span>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default RoomGallery;

