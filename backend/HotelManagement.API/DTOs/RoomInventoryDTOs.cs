namespace HotelManagement.API.DTOs;

public class RoomInventoryDto
{
    public int Id { get; set; }
    public int? RoomId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public int? Quantity { get; set; }
    public decimal? PriceIfLost { get; set; }
}

public class CreateRoomInventoryDto
{
    public int? RoomId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public int? Quantity { get; set; }
    public decimal? PriceIfLost { get; set; }
}

public class UpdateRoomInventoryDto
{
    public int? RoomId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public int? Quantity { get; set; }
    public decimal? PriceIfLost { get; set; }
}

public class CloneRoomInventoryDto
{
    public int FromRoomId { get; set; }
    public int ToRoomId { get; set; }
}
