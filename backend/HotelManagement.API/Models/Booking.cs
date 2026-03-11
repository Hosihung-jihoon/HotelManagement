using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HotelManagement.API.Models;

[Table("Bookings")]
public class Booking
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("user_id")]
    public int? UserId { get; set; }

    [Column("guest_name")]
    [MaxLength(255)]
    public string? GuestName { get; set; }

    [Column("guest_phone")]
    [MaxLength(50)]
    public string? GuestPhone { get; set; }

    [Column("guest_email")]
    [MaxLength(255)]
    public string? GuestEmail { get; set; }

    [Required]
    [Column("booking_code")]
    [MaxLength(50)]
    public string BookingCode { get; set; } = string.Empty;

    [Column("voucher_id")]
    public int? VoucherId { get; set; }

    [Column("status")]
    [MaxLength(50)]
    public string? Status { get; set; } = "Pending";

    // Navigation
    [ForeignKey("UserId")]
    public User? User { get; set; }

    [ForeignKey("VoucherId")]
    public Voucher? Voucher { get; set; }

    public ICollection<BookingDetail> BookingDetails { get; set; } = new List<BookingDetail>();
    public Invoice? Invoice { get; set; }
}
