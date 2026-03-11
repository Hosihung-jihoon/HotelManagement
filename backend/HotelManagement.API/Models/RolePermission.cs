using System.ComponentModel.DataAnnotations.Schema;

namespace HotelManagement.API.Models;

[Table("Role_Permissions")]
public class RolePermission
{
    [Column("role_id")]
    public int RoleId { get; set; }

    [Column("permission_id")]
    public int PermissionId { get; set; }

    // Navigation
    [ForeignKey("RoleId")]
    public Role Role { get; set; } = null!;

    [ForeignKey("PermissionId")]
    public Permission Permission { get; set; } = null!;
}
