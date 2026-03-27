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
    public int? RoleId { get; set; }
    public string? RoleName { get; set; }
}

// ========== Create User (Admin) ==========
public class CreateUserDto
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string Password { get; set; } = string.Empty;
    public int? RoleId { get; set; }
}

// ========== Update User (Admin) ==========
public class UpdateUserDto
{
    public string FullName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public int? RoleId { get; set; }
}

// ========== Toggle Status ==========
public class UpdateUserStatusDto
{
    public bool Status { get; set; }
}
