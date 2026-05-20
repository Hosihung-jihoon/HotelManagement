using System.ComponentModel.DataAnnotations;

namespace HotelManagement.API.DTOs;

public class ContactRequestDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Subject { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string Status { get; set; } = "New";
}

public class CreateContactRequestDto
{
    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? Phone { get; set; }

    [MaxLength(255)]
    public string? Subject { get; set; }

    [Required]
    [MaxLength(4000)]
    public string Message { get; set; } = string.Empty;
}
