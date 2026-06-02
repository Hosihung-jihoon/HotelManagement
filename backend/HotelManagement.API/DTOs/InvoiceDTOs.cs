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

// ========== Bill DTOs (Gom hóa đơn) ==========

/// <summary>
/// Chi tiết phòng trong bill
/// </summary>
public class BillRoomDetailDto
{
    public string RoomNumber { get; set; } = string.Empty;
    public string RoomTypeName { get; set; } = string.Empty;
    public decimal PricePerNight { get; set; }
    public int Nights { get; set; }
    public DateTime CheckInDate { get; set; }
    public DateTime CheckOutDate { get; set; }
    public decimal Subtotal { get; set; }
}

/// <summary>
/// Chi tiết dịch vụ trong bill
/// </summary>
public class BillServiceDetailDto
{
    public string ServiceName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Subtotal { get; set; }
}

/// <summary>
/// Chi tiết phạt / hư hỏng trong bill
/// </summary>
public class BillPenaltyDetailDto
{
    public string? Description { get; set; }
    public int Quantity { get; set; }
    public decimal PenaltyAmount { get; set; }
}

/// <summary>
/// DTO tổng hợp bill — response cho get-bill và generate-bill
/// </summary>
public class BillDto
{
    public int BookingId { get; set; }
    public string BookingCode { get; set; } = string.Empty;
    public string? GuestName { get; set; }
    public string? GuestPhone { get; set; }

    public List<BillRoomDetailDto> Rooms { get; set; } = new();
    public List<BillServiceDetailDto> Services { get; set; } = new();
    public List<BillPenaltyDetailDto> Penalties { get; set; } = new();

    public decimal TotalRoomAmount { get; set; }
    public decimal TotalServiceAmount { get; set; }
    public decimal TotalPenaltyAmount { get; set; }
    public decimal Subtotal { get; set; }
    public decimal DiscountAmount { get; set; }
    public string? VoucherCode { get; set; }
    public decimal TaxRate { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal FinalTotal { get; set; }

    public int? InvoiceId { get; set; }
    public string? Status { get; set; }
}

