using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HotelManagement.API.Models;

[Table("Memberships")]
public class Membership
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [Column("tier_name")]
    [MaxLength(100)]
    public string TierName { get; set; } = string.Empty;

    [Column("min_points")]
    public int? MinPoints { get; set; } = 0;

    [Column("discount_percent", TypeName = "decimal(5,2)")]
    public decimal? DiscountPercent { get; set; } = 0;

    // Navigation
    public ICollection<User> Users { get; set; } = new List<User>();
}
