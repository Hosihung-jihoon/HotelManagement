namespace HotelManagement.API.DTOs;

// ========== Change Role ==========
public class ChangeRoleDto
{
    public int UserId { get; set; }
    public int NewRoleId { get; set; }
}

// ========== User List (Admin view) ==========
public class UserListDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public bool? Status { get; set; }
    public string? RoleName { get; set; }
}
