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
    public DateTime CreatedAt { get; set; }
}

// DTO for booking detail items (rooms booked)
public class BookingDetailItemDto
{
    public int Id { get; set; }
    public int? RoomId { get; set; }
    public string? RoomNumber { get; set; }
    public int? RoomTypeId { get; set; }
    public string? RoomTypeName { get; set; }
    public DateTime CheckInDate { get; set; }
    public DateTime CheckOutDate { get; set; }
    public decimal PricePerNight { get; set; }
}

// DTO for audit log entries
public class BookingAuditLogDto
{
    public int Id { get; set; }
    public string Action { get; set; } = string.Empty;
    public string TableName { get; set; } = string.Empty;
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
    public DateTime? CreatedAt { get; set; }
    public int? UserId { get; set; }
    public string? UserName { get; set; }
}

// Full detail DTO for the detail page
public class BookingFullDetailDto
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    public string? BookedByName { get; set; }  // staff name who created booking
    public string? GuestName { get; set; }
    public string? GuestPhone { get; set; }
    public string? GuestEmail { get; set; }
    public string BookingCode { get; set; } = string.Empty;
    public int? VoucherId { get; set; }
    public string? VoucherCode { get; set; }
    public string? Status { get; set; }
    public DateTime CreatedAt { get; set; }
    // Invoice / financial
    public decimal TotalAmount { get; set; }       // total before discount
    public decimal DiscountAmount { get; set; }
    public decimal FinalTotal { get; set; }        // after discount
    public decimal AmountPaid { get; set; }        // sum of payments
    public decimal RemainingAmount { get; set; }   // FinalTotal - AmountPaid
    public decimal DepositAmount { get; set; }
    // Booking details (rooms)
    public List<BookingDetailItemDto> Details { get; set; } = new();
    // Audit logs
    public List<BookingAuditLogDto> AuditLogs { get; set; } = new();
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

public class AddBookingPaymentDto
{
    [Required]
    public decimal Amount { get; set; }
    [Required]
    [MaxLength(50)]
    public string PaymentMethod { get; set; } = "Cash";
    [MaxLength(100)]
    public string? TransactionCode { get; set; }
    public DateTime? PaymentDate { get; set; }
}
