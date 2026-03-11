using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HotelManagement.API.Models;

[Table("Order_Service_Details")]
public class OrderServiceDetail
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("order_service_id")]
    public int? OrderServiceId { get; set; }

    [Column("service_id")]
    public int? ServiceId { get; set; }

    [Required]
    [Column("quantity")]
    public int Quantity { get; set; }

    [Required]
    [Column("unit_price", TypeName = "decimal(18,2)")]
    public decimal UnitPrice { get; set; }

    // Navigation
    [ForeignKey("OrderServiceId")]
    public OrderService? OrderService { get; set; }

    [ForeignKey("ServiceId")]
    public Service? Service { get; set; }
}
