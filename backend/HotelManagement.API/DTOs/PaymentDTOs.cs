namespace HotelManagement.API.DTOs;

// ========== Response DTOs ==========

/// <summary>
/// DTO trả về thông tin 
/// </summary>
public class PaymentDto
{
    public int Id { get; set; }
    public int? InvoiceId { get; set; }
    public string? PaymentMethod { get; set; }
    public decimal AmountPaid { get; set; }
    public string? TransactionCode { get; set; }
    public DateTime? PaymentDate { get; set; }
}

// ========== Request DTOs ==========

/// <summary>
/// DTO để tạo mới 
/// </summary>
public class CreatePaymentDto
{
    public int? InvoiceId { get; set; }
    public string? PaymentMethod { get; set; }
    public decimal AmountPaid { get; set; }
    public string? TransactionCode { get; set; }
    public DateTime? PaymentDate { get; set; }
}

/// <summary>
/// DTO để cập nhật 
public class UpdatePaymentDto
{
    public int? InvoiceId { get; set; }
    public string? PaymentMethod { get; set; }
    public decimal AmountPaid { get; set; }
    public string? TransactionCode { get; set; }
    public DateTime? PaymentDate { get; set; }
}
