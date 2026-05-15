namespace HotelManagement.API.Helpers;

/// <summary>
/// Xác định kỳ thời gian (period) từ một ngày cụ thể.
/// </summary>
public static class PeriodHelper
{
    public record PeriodInfo(string PeriodKey, DateOnly PeriodStart, DateOnly PeriodEnd);

    /// <summary>Tính thông tin kỳ từ ngày tham chiếu và loại kỳ.</summary>
    public static PeriodInfo Resolve(DateTime referenceDate, string periodType)
    {
        var d = DateOnly.FromDateTime(referenceDate);
        return periodType.ToLower() switch
        {
            "daily"     => ResolveDaily(d),
            "weekly"    => ResolveWeekly(d),
            "monthly"   => ResolveMonthly(d),
            "quarterly" => ResolveQuarterly(d),
            "yearly"    => ResolveYearly(d),
            _           => ResolveMonthly(d)
        };
    }

    /// <summary>Lấy period key của kỳ liền trước.</summary>
    public static string GetPreviousPeriodKey(string periodType, string periodKey)
    {
        return periodType.ToLower() switch
        {
            "daily"     => GetPreviousDay(periodKey),
            "weekly"    => GetPreviousWeek(periodKey),
            "monthly"   => GetPreviousMonth(periodKey),
            "quarterly" => GetPreviousQuarter(periodKey),
            "yearly"    => GetPreviousYear(periodKey),
            _           => GetPreviousMonth(periodKey)
        };
    }

    // ── Daily ──────────────────────────────────────────────────────────────────
    private static PeriodInfo ResolveDaily(DateOnly d)
        => new(d.ToString("yyyy-MM-dd"), d, d);

    private static string GetPreviousDay(string key)
    {
        if (!DateOnly.TryParse(key, out var d)) return key;
        return d.AddDays(-1).ToString("yyyy-MM-dd");
    }

    // ── Weekly ─────────────────────────────────────────────────────────────────
    private static PeriodInfo ResolveWeekly(DateOnly d)
    {
        var dt = d.ToDateTime(TimeOnly.MinValue);
        int dayOfWeek = (int)dt.DayOfWeek;
        int daysToMonday = (dayOfWeek == 0) ? -6 : 1 - dayOfWeek;
        var monday = DateOnly.FromDateTime(dt.AddDays(daysToMonday));
        var sunday = monday.AddDays(6);
        var (year, week, _) = GetIsoWeek(dt);
        return new($"{year}-W{week:D2}", monday, sunday);
    }

    private static string GetPreviousWeek(string key)
    {
        // key format: 2026-W18
        var parts = key.Split('-', 'W');
        if (parts.Length < 3 || !int.TryParse(parts[0], out int year) || !int.TryParse(parts[2], out int week)) return key;
        week--;
        if (week == 0) { year--; week = 52; }
        return $"{year}-W{week:D2}";
    }

    // ── Monthly ────────────────────────────────────────────────────────────────
    private static PeriodInfo ResolveMonthly(DateOnly d)
    {
        var start = new DateOnly(d.Year, d.Month, 1);
        var end   = start.AddMonths(1).AddDays(-1);
        return new(d.ToString("yyyy-MM"), start, end);
    }

    private static string GetPreviousMonth(string key)
    {
        if (!DateOnly.TryParseExact(key + "-01", "yyyy-MM-dd", out var d)) return key;
        return d.AddMonths(-1).ToString("yyyy-MM");
    }

    // ── Quarterly ──────────────────────────────────────────────────────────────
    private static PeriodInfo ResolveQuarterly(DateOnly d)
    {
        int q = (d.Month - 1) / 3 + 1;
        int startMonth = (q - 1) * 3 + 1;
        var start = new DateOnly(d.Year, startMonth, 1);
        var end   = start.AddMonths(3).AddDays(-1);
        return new($"{d.Year}-Q{q}", start, end);
    }

    private static string GetPreviousQuarter(string key)
    {
        var parts = key.Split('-', 'Q');
        if (parts.Length < 3 || !int.TryParse(parts[0], out int year) || !int.TryParse(parts[2], out int q)) return key;
        q--;
        if (q == 0) { year--; q = 4; }
        return $"{year}-Q{q}";
    }

    // ── Yearly ─────────────────────────────────────────────────────────────────
    private static PeriodInfo ResolveYearly(DateOnly d)
    {
        var start = new DateOnly(d.Year, 1, 1);
        var end   = new DateOnly(d.Year, 12, 31);
        return new(d.Year.ToString(), start, end);
    }

    private static string GetPreviousYear(string key)
    {
        if (int.TryParse(key, out int y)) return (y - 1).ToString();
        return key;
    }

    // ── ISO Week helper ────────────────────────────────────────────────────────
    private static (int Year, int Week, DayOfWeek Day) GetIsoWeek(DateTime dt)
    {
        var day  = dt.DayOfWeek;
        var week = System.Globalization.ISOWeek.GetWeekOfYear(dt);
        var year = dt.Year;
        if (week == 1 && dt.Month == 12) year++;
        if (week >= 52 && dt.Month == 1) year--;
        return (year, week, day);
    }
}
