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
