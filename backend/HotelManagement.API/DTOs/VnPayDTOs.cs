namespace HotelManagement.API.DTOs;

public class CheckoutRequestDto
{
    public string GuestName { get; set; } = string.Empty;
    public string GuestPhone { get; set; } = string.Empty;
    public string GuestEmail { get; set; } = string.Empty;
    public int RoomId { get; set; }
    public int RoomTypeId { get; set; }
    public DateTime CheckInDate { get; set; }
    public DateTime CheckOutDate { get; set; }
    public decimal PricePerNight { get; set; }
}

public class VnPayRequestDto
{
    public int BookingId { get; set; }
    public decimal Amount { get; set; }
}

public class VnPayResponseDto
{
    public string PaymentUrl { get; set; } = string.Empty;
}
