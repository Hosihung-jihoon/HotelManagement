using System.Globalization;
using System.Text;

namespace HotelManagement.API.Helpers;

public static class MembershipTierCatalog
{
    public const string Dong = "Đồng";
    public const string Bac = "Bạc";
    public const string Vang = "Vàng";
    public const string KimCuong = "Kim cương";

    public static readonly string[] CanonicalTierNames = [Dong, Bac, Vang, KimCuong];

    public static string? MapToCanonicalName(string? tierName)
    {
        var normalized = NormalizeKey(tierName);
        return normalized switch
        {
            "dong" => Dong,
            "bronze" => Dong,
            "khachmoi" => Dong,
            "khachhangmoi" => Dong,
            "newguest" => Dong,
            "bac" => Bac,
            "silver" => Bac,
            "vang" => Vang,
            "gold" => Vang,
            "kimcuong" => KimCuong,
            "diamond" => KimCuong,
            "platinum" => KimCuong,
            "bachkim" => KimCuong,
            _ => null
        };
    }

    public static bool IsCanonical(string? tierName) => MapToCanonicalName(tierName) != null;

    public static string NormalizeKey(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return string.Empty;
        }

        var decomposed = value.Trim().Normalize(NormalizationForm.FormD);
        var builder = new StringBuilder(decomposed.Length);
        foreach (var character in decomposed)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(character) != UnicodeCategory.NonSpacingMark)
            {
                builder.Append(character);
            }
        }

        return builder
            .ToString()
            .Normalize(NormalizationForm.FormC)
            .Replace("đ", "d", StringComparison.OrdinalIgnoreCase)
            .Replace(" ", string.Empty, StringComparison.OrdinalIgnoreCase)
            .ToLowerInvariant();
    }
}
