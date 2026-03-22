using System.ComponentModel.DataAnnotations;

namespace HotelManagement.API.DTOs;

public class CreateOrderServiceDto
{
    [Required]
    public int BookingDetailId { get; set; }

    [Required]
    [MinLength(1, ErrorMessage = "Cần ít nhất một dịch vụ.")]
    public List<CreateOrderServiceDetailDto> ServiceDetails { get; set; } = new List<CreateOrderServiceDetailDto>();
}

public class CreateOrderServiceDetailDto
{
    [Required]
    public int ServiceId { get; set; }

    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Số lượng phải lớn hơn 0.")]
    public int Quantity { get; set; }
}

public class OrderServiceDto
{
    public int Id { get; set; }
    public int? BookingDetailId { get; set; }
    public DateTime? OrderDate { get; set; }
    public decimal? TotalAmount { get; set; }
    public string? Status { get; set; }
    
    public List<OrderServiceDetailDto> OrderServiceDetails { get; set; } = new List<OrderServiceDetailDto>();
}

public class OrderServiceDetailDto
{
    public int Id { get; set; }
    public int? OrderServiceId { get; set; }
    public int? ServiceId { get; set; }
    public string? ServiceName { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}
