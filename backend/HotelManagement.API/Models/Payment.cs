using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HotelManagement.API.Models;

[Table("Payments")]
public class Payment
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("invoice_id")]
    public int? InvoiceId { get; set; }

    [Column("payment_method")]
    [MaxLength(50)]
    public string? PaymentMethod { get; set; }

    [Required]
    [Column("amount_paid", TypeName = "decimal(18,2)")]
    public decimal AmountPaid { get; set; }

    [Column("transaction_code")]
    [MaxLength(100)]
    public string? TransactionCode { get; set; }

    [Column("payment_date")]
    public DateTime? PaymentDate { get; set; }

    // Navigation
    [ForeignKey("InvoiceId")]
    public Invoice? Invoice { get; set; }
}
