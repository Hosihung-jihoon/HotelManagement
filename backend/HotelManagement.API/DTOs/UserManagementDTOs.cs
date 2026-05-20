using System.ComponentModel.DataAnnotations;

namespace HotelManagement.API.DTOs;

// ========== Change Role ==========
public class ChangeRoleDto
{
    [Required]
    public int UserId { get; set; }
    
    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Vai trò không hợp lệ")]
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
    public string? MembershipName { get; set; }
    public decimal TotalSpent { get; set; } = 0;
    public int TotalPoints { get; set; }
    public int? RemainingToNextTier { get; set; }
    public string? NextTierName { get; set; }
}

// ========== Membership Stats ==========
public class MembershipStatDto
{
    public int MembershipId { get; set; }
    public string TierName { get; set; } = string.Empty;
    public int MemberCount { get; set; }
}

// ========== Create User (Admin) ==========
public class CreateUserDto
{
    [Required(ErrorMessage = "Họ tên là bắt buộc")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Họ tên từ 2 đến 100 ký tự")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email là bắt buộc")]
    [EmailAddress(ErrorMessage = "Định dạng email không hợp lệ")]
    public string Email { get; set; } = string.Empty;

    [Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
    public string? Phone { get; set; }

    [Required(ErrorMessage = "Mật khẩu là bắt buộc")]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vai trò là bắt buộc")]
    public int? RoleId { get; set; }
}

// ========== Update User (Admin) ==========
public class UpdateUserDto
{
    [Required(ErrorMessage = "Họ tên là bắt buộc")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Họ tên từ 2 đến 100 ký tự")]
    public string FullName { get; set; } = string.Empty;

    [Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
    public string? Phone { get; set; }

    [Required(ErrorMessage = "Vai trò là bắt buộc")]
    public int? RoleId { get; set; }
}

// ========== Toggle Status ==========
public class UpdateUserStatusDto
{
    public bool Status { get; set; }
}
