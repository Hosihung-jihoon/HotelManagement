namespace HotelManagement.API.DTOs;

public class RoomInventoryDto
{
    public int Id { get; set; }
    public int? RoomId { get; set; }
    public string? RoomNumber { get; set; }  // join từ Rooms
    public string ItemName { get; set; } = string.Empty;
    public string? Unit { get; set; }
    public int? Quantity { get; set; }
    public int QuantityInUse { get; set; }
    public int QuantityDamaged { get; set; }
    public decimal? PriceIfLost { get; set; }
    public string? ImageUrl { get; set; }
    public string? Note { get; set; }
    public string? ItemType { get; set; }
}

public class CreateRoomInventoryDto
{
    public int? RoomId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public string? Unit { get; set; }
    public int? Quantity { get; set; }
    public int QuantityInUse { get; set; } = 0;
    public int QuantityDamaged { get; set; } = 0;
    public decimal? PriceIfLost { get; set; }
    public string? ImageUrl { get; set; }
    public string? Note { get; set; }
    public string? ItemType { get; set; }
}

public class UpdateRoomInventoryDto
{
    public int? RoomId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public string? Unit { get; set; }
    public int? Quantity { get; set; }
    public int QuantityInUse { get; set; } = 0;
    public int QuantityDamaged { get; set; } = 0;
    public decimal? PriceIfLost { get; set; }
    public string? ImageUrl { get; set; }
    public string? Note { get; set; }
    public string? ItemType { get; set; }
}

public class CloneRoomInventoryDto
{
    public int FromRoomId { get; set; }
    public int ToRoomId { get; set; }
}

