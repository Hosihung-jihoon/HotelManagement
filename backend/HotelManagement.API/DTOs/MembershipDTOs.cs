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
    public int DisplayOrder { get; set; }
    public decimal? PointMultiplier { get; set; }
    public int PointToVndRate { get; set; }
    public string? Amenities { get; set; }
    public string? Services { get; set; }
    public string? Benefits { get; set; }
    public string? RedeemOptions { get; set; }
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
    public int DisplayOrder { get; set; }
    public decimal? PointMultiplier { get; set; }
    public string? Amenities { get; set; }
    public string? Services { get; set; }
    public string? Benefits { get; set; }
    public string? RedeemOptions { get; set; }
}

/// <summary>
/// DTO để cập nhật hạng thành viên
/// </summary>
public class UpdateMembershipDto
{
    public string TierName { get; set; } = string.Empty;
    public int? MinPoints { get; set; }
    public decimal? DiscountPercent { get; set; }
    public int DisplayOrder { get; set; }
    public decimal? PointMultiplier { get; set; }
    public string? Amenities { get; set; }
    public string? Services { get; set; }
    public string? Benefits { get; set; }
    public string? RedeemOptions { get; set; }
}
