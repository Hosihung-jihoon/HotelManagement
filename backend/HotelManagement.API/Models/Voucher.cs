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

    /// <summary>Bật/tắt voucher — không ảnh hưởng đến các booking đã áp dụng.</summary>
    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    /// <summary>Loại voucher: General | MembershipTier | Birthday | Holiday</summary>
    [Column("voucher_type")]
    [MaxLength(50)]
    public string VoucherType { get; set; } = "General";

    /// <summary>Tên ngày lễ áp dụng (ví dụ: "Tết Nguyên Đán", "Giáng Sinh").</summary>
    [Column("holiday_name")]
    [MaxLength(100)]
    public string? HolidayName { get; set; }

    /// <summary>Hạng thành viên được áp dụng (nếu VoucherType = MembershipTier).</summary>
    [Column("membership_tier")]
    [MaxLength(50)]
    public string? MembershipTier { get; set; }

    // Navigation
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
