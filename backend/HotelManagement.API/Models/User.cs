using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HotelManagement.API.Models;

[Table("Users")]
public class User
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("role_id")]
    public int? RoleId { get; set; }

    [Column("membership_id")]
    public int? MembershipId { get; set; }

    [Required]
    [Column("full_name")]
    [MaxLength(255)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [Column("email")]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [Column("phone")]
    [MaxLength(50)]
    public string? Phone { get; set; }

    [Required]
    [Column("password_hash")]
    public string PasswordHash { get; set; } = string.Empty;

    [Column("status")]
    public bool? Status { get; set; } = true;

    // Navigation
    [ForeignKey("RoleId")]
    public Role? Role { get; set; }

    [ForeignKey("MembershipId")]
    public Membership? Membership { get; set; }

    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<Article> Articles { get; set; } = new List<Article>();
    public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
}
