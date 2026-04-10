using System.ComponentModel.DataAnnotations;

namespace HotelManagement.API.DTOs;

public class VoucherDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string DiscountType { get; set; } = string.Empty;
    public decimal DiscountValue { get; set; }
    public decimal? MinBookingValue { get; set; }
    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidTo { get; set; }
    public int? UsageLimit { get; set; }
}

public class CreateVoucherDto
{
    [Required]
    [MaxLength(50)]
    public string Code { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string DiscountType { get; set; } = string.Empty;

    [Required]
    public decimal DiscountValue { get; set; }

    public decimal? MinBookingValue { get; set; }
    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidTo { get; set; }
    public int? UsageLimit { get; set; }
}

public class UpdateVoucherDto
{
    [Required]
    [MaxLength(50)]
    public string DiscountType { get; set; } = string.Empty;

    [Required]
    public decimal DiscountValue { get; set; }

    public decimal? MinBookingValue { get; set; }
    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidTo { get; set; }
    public int? UsageLimit { get; set; }
}
