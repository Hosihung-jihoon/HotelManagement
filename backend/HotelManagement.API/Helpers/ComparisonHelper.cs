namespace HotelManagement.API.Helpers;

/// <summary>
/// Tính toán so sánh giữa kỳ hiện tại và kỳ trước.
/// directionMeaning: "Positive" (tăng là tốt, VD: doanh thu)
///                   "Negative" (tăng là xấu, VD: báo cáo hỏng)
/// </summary>
public static class ComparisonHelper
{
    public record MetricComparison(
        decimal Current,
        decimal Previous,
        decimal Diff,
        double GrowthRate,       // % thay đổi so với kỳ trước
        string Trend,            // UP | DOWN | STABLE
        string DirectionMeaning, // Positive | Negative
        string BadgeColor        // green | red | gray
    );

    /// <summary>
    /// Tính toán comparison cho một metric.
    /// </summary>
    public static MetricComparison Calculate(decimal current, decimal previous, string directionMeaning = "Positive")
    {
        var diff = current - previous;

        // Tránh chia cho 0
        double growthRate = 0;
        if (previous != 0)
        {
            growthRate = Math.Round((double)(diff / previous) * 100, 2);
        }
        else if (current > 0)
        {
            growthRate = 100; // Từ 0 → có giá trị = tăng 100%
        }

        var trend = diff > 0 ? "UP" : diff < 0 ? "DOWN" : "STABLE";

        // Màu badge: dựa trên trend + directionMeaning
        string badgeColor = trend switch
        {
            "UP"     => directionMeaning == "Positive" ? "green" : "red",
            "DOWN"   => directionMeaning == "Positive" ? "red" : "green",
            "STABLE" => "gray",
            _        => "gray"
        };

        return new MetricComparison(current, previous, diff, growthRate, trend, directionMeaning, badgeColor);
    }

    /// <summary>
    /// Tạo comparison object dạng dictionary để serialize thành JSON.
    /// </summary>
    public static Dictionary<string, object> ToDict(MetricComparison m)
    {
        return new Dictionary<string, object>
        {
            ["current"]          = m.Current,
            ["previous"]         = m.Previous,
            ["diff"]             = m.Diff,
            ["growthRate"]       = m.GrowthRate,
            ["trend"]            = m.Trend,
            ["directionMeaning"] = m.DirectionMeaning,
            ["badgeColor"]       = m.BadgeColor
        };
    }
}
