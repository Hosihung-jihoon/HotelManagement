namespace HotelManagement.API.DTOs;

// ========== Response DTOs ==========

/// <summary>
/// DTO trả về thông tin hạng thành viên
/// </summary>
public class MembershipDto
{
    public int Id { get; set; }
    public string TierName { get; set; } = string.Empty;
    public int? MinPoints { get; set; }
    public decimal? DiscountPercent { get; set; }
}

// ========== Request DTOs ==========

/// <summary>
/// DTO để tạo mới hạng thành viên
/// </summary>
public class CreateMembershipDto
{
    public string TierName { get; set; } = string.Empty;
    public int? MinPoints { get; set; }
    public decimal? DiscountPercent { get; set; }
}

/// <summary>
/// DTO để cập nhật hạng thành viên
/// </summary>
public class UpdateMembershipDto
{
    public string TierName { get; set; } = string.Empty;
    public int? MinPoints { get; set; }
    public decimal? DiscountPercent { get; set; }
}
