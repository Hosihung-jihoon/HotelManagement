namespace HotelManagement.API.DTOs;

public class LossAndDamageDto
{
    public int Id { get; set; }
    public int? BookingDetailId { get; set; }
    public int? RoomInventoryId { get; set; }
    public string? ItemName { get; set; }     // join từ RoomInventory
    public string? RoomNumber { get; set; }   // join từ BookingDetail → Room
    public int Quantity { get; set; }
    public decimal PenaltyAmount { get; set; }
    public string? Description { get; set; }
    public DateTime? CreatedAt { get; set; }
}

public class CreateLossAndDamageDto
{
    public int? BookingDetailId { get; set; }
    public int? RoomInventoryId { get; set; }
    public int Quantity { get; set; }
    public decimal PenaltyAmount { get; set; }
    public string? Description { get; set; }
}

public class UpdateLossAndDamageDto
{
    public int Quantity { get; set; }
    public decimal PenaltyAmount { get; set; }
    public string? Description { get; set; }
}
