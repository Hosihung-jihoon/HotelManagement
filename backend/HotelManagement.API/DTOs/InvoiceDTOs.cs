namespace HotelManagement.API.DTOs;

// ========== Response DTOs ==========

/// <summary>
/// DTO trả về danh sách hóa đơn
/// </summary>
public class InvoiceDto
{
    public int Id { get; set; }
    public int? BookingId { get; set; }
    public decimal? TotalRoomAmount { get; set; }
    public decimal? TotalServiceAmount { get; set; }
    public decimal? DiscountAmount { get; set; }
    public decimal? TaxAmount { get; set; }
    public decimal? FinalTotal { get; set; }
    public string? Status { get; set; }
}

/// <summary>
///
/// </summary>
public class InvoiceDetailDto
{
    public int Id { get; set; }
    public int? BookingId { get; set; }
    public decimal? TotalRoomAmount { get; set; }
    public decimal? TotalServiceAmount { get; set; }
    public decimal? DiscountAmount { get; set; }
    public decimal? TaxAmount { get; set; }
    public decimal? FinalTotal { get; set; }
    public string? Status { get; set; }
    public List<PaymentDto> Payments { get; set; } = new();
}



/// <summary>
///
/// </summary>
public class CreateInvoiceDto
{
    public int? BookingId { get; set; }
    public decimal? TotalRoomAmount { get; set; }
    public decimal? TotalServiceAmount { get; set; }
    public decimal? DiscountAmount { get; set; }
    public decimal? TaxAmount { get; set; }
    public decimal? FinalTotal { get; set; }
    public string? Status { get; set; }
}

/// <summary>
///
/// </summary>
public class UpdateInvoiceDto
{
    public int? BookingId { get; set; }
    public decimal? TotalRoomAmount { get; set; }
    public decimal? TotalServiceAmount { get; set; }
    public decimal? DiscountAmount { get; set; }
    public decimal? TaxAmount { get; set; }
    public decimal? FinalTotal { get; set; }
    public string? Status { get; set; }
}
