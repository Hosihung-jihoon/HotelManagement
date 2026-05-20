using System.ComponentModel.DataAnnotations;

namespace HotelManagement.API.DTOs;

public class ReviewDto
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    public int? RoomTypeId { get; set; }
    public int? RoomId { get; set; }
    public string? RoomTypeName { get; set; }
    public string GuestName { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateReviewDto
{
    [Required]
    public int RoomId { get; set; }

    [Range(1, 5)]
    public int Rating { get; set; }

    [MaxLength(2000)]
    public string? Comment { get; set; }
}
