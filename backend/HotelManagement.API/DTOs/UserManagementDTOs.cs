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
    public string? MembershipName { get; set; }
    public decimal TotalSpent { get; set; } = 0;
    public decimal? RemainingToNextTier { get; set; }
    public string? NextTierName { get; set; }
}

// ========== Membership Stats ==========
public class MembershipStatDto
{
    public int MembershipId { get; set; }
    public string TierName { get; set; } = string.Empty;
    public int MemberCount { get; set; }
}
