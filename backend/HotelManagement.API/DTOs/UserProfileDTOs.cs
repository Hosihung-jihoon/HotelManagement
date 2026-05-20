namespace HotelManagement.API.DTOs;

// ========== User Profile ==========
public class UserProfileDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public bool? Status { get; set; }
    public string? RoleName { get; set; }
    public string? MembershipName { get; set; }
}

public class UserMembershipDto
{
    public int? MembershipId { get; set; }
    public string Tier { get; set; } = "Dong";
    public decimal TotalSpent { get; set; }
    public int TotalPoints { get; set; }
    public string? NextTierName { get; set; }
    public int? RemainingPoints { get; set; }
}

// ========== Update Profile ==========
public class UpdateProfileDto
{
    public string FullName { get; set; } = string.Empty;
    public string? Phone { get; set; }
}

// ========== Change Password ==========
public class ChangePasswordDto
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
    public string ConfirmNewPassword { get; set; } = string.Empty;
}
