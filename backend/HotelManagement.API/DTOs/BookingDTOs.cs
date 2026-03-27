using System.ComponentModel.DataAnnotations;

namespace HotelManagement.API.DTOs;

public class BookingDto
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    public string? GuestName { get; set; }
    public string? GuestPhone { get; set; }
    public string? GuestEmail { get; set; }
    public string BookingCode { get; set; } = string.Empty;
    public int? VoucherId { get; set; }
    public string? Status { get; set; }
}

public class CreateBookingDto
{
    public int? UserId { get; set; }

    [MaxLength(255)]
    public string? GuestName { get; set; }

    [MaxLength(50)]
    public string? GuestPhone { get; set; }

    [EmailAddress]
    [MaxLength(255)]
    public string? GuestEmail { get; set; }

    public int? VoucherId { get; set; }
}

public class UpdateBookingDto
{
    [MaxLength(255)]
    public string? GuestName { get; set; }

    [MaxLength(50)]
    public string? GuestPhone { get; set; }

    [EmailAddress]
    [MaxLength(255)]
    public string? GuestEmail { get; set; }

    [MaxLength(50)]
    public string? Status { get; set; }
}

public class BookingSearchRequestDto
{
    [Required]
    public DateTime CheckInDate { get; set; }

    [Required]
    public DateTime CheckOutDate { get; set; }

    public int? CapacityAdults { get; set; }
    public int? CapacityChildren { get; set; }
}

public class RoomAvailabilityResponseDto
{
    public int RoomId { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public int RoomTypeId { get; set; }
    public string RoomTypeName { get; set; } = string.Empty;
    public decimal PricePerNight { get; set; }
    public int CapacityAdults { get; set; }
    public int CapacityChildren { get; set; }
}

public class BookingDetailRequestDto
{
    [Required]
    public int RoomId { get; set; }

    [Required]
    public DateTime CheckInDate { get; set; }

    [Required]
    public DateTime CheckOutDate { get; set; }

    [Required]
    public decimal PricePerNight { get; set; }
}

public class CreateAdvancedBookingDto
{
    public int? UserId { get; set; }

    [MaxLength(255)]
    public string? GuestName { get; set; }

    [MaxLength(50)]
    public string? GuestPhone { get; set; }

    [EmailAddress]
    [MaxLength(255)]
    public string? GuestEmail { get; set; }

    public int? VoucherId { get; set; }

    [Required]
    [MinLength(1, ErrorMessage = "At least one room must be booked.")]
    public List<BookingDetailRequestDto> Details { get; set; } = new List<BookingDetailRequestDto>();
}
