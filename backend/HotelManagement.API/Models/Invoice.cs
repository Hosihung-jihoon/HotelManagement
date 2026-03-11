using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HotelManagement.API.Models;

[Table("Invoices")]
public class Invoice
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("booking_id")]
    public int? BookingId { get; set; }

    [Column("total_room_amount", TypeName = "decimal(18,2)")]
    public decimal? TotalRoomAmount { get; set; } = 0;

    [Column("total_service_amount", TypeName = "decimal(18,2)")]
    public decimal? TotalServiceAmount { get; set; } = 0;

    [Column("discount_amount", TypeName = "decimal(18,2)")]
    public decimal? DiscountAmount { get; set; } = 0;

    [Column("tax_amount", TypeName = "decimal(18,2)")]
    public decimal? TaxAmount { get; set; } = 0;

    [Column("final_total", TypeName = "decimal(18,2)")]
    public decimal? FinalTotal { get; set; } = 0;

    [Column("status")]
    [MaxLength(50)]
    public string? Status { get; set; } = "Unpaid";

    // Navigation
    [ForeignKey("BookingId")]
    public Booking? Booking { get; set; }

    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
