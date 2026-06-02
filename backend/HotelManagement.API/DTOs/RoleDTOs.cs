namespace HotelManagement.API.DTOs;

// ========== Assign Permission ==========
public class AssignPermissionDto
{
    public int RoleId { get; set; }
    public List<int> PermissionIds { get; set; } = new();
}

// ========== Role ==========
public class RoleDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}

// ========== Permission ==========
public class PermissionDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

// ========== Role With Permissions ==========
public class RoleWithPermissionsDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public List<PermissionDto> Permissions { get; set; } = new();
}

// ========== Create Role ==========
public class CreateRoleDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}

// ========== Update Role ==========
public class UpdateRoleDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}
