using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HotelManagement.API.Models;

[Table("Order_Services")]
public class OrderService
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("booking_detail_id")]
    public int? BookingDetailId { get; set; }

    [Column("order_date")]
    public DateTime? OrderDate { get; set; }

    [Column("total_amount", TypeName = "decimal(18,2)")]
    public decimal? TotalAmount { get; set; } = 0;

    [Column("status")]
    [MaxLength(50)]
    public string? Status { get; set; } = "Pending";

    // Navigation
    [ForeignKey("BookingDetailId")]
    public BookingDetail? BookingDetail { get; set; }

    public ICollection<OrderServiceDetail> OrderServiceDetails { get; set; } = new List<OrderServiceDetail>();
}
