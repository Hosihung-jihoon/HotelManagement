using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HotelManagement.API.Models;

[Table("Vouchers")]
public class Voucher
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [Column("code")]
    [MaxLength(50)]
    public string Code { get; set; } = string.Empty;

    [Required]
    [Column("discount_type")]
    [MaxLength(50)]
    public string DiscountType { get; set; } = string.Empty;

    [Required]
    [Column("discount_value", TypeName = "decimal(18,2)")]
    public decimal DiscountValue { get; set; }

    [Column("min_booking_value", TypeName = "decimal(18,2)")]
    public decimal? MinBookingValue { get; set; } = 0;

    [Column("valid_from")]
    public DateTime? ValidFrom { get; set; }

    [Column("valid_to")]
    public DateTime? ValidTo { get; set; }

    [Column("usage_limit")]
    public int? UsageLimit { get; set; }

    // Navigation
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
