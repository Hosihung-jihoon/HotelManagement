using System.Globalization;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace HotelManagement.API.Services;

public interface IGoogleMapsMetadataService
{
    Task<GoogleMapsMetadataResult> ResolveAsync(string? googleMapsUrl, string? embedUrl, string fallbackName);
}

public class GoogleMapsMetadataService : IGoogleMapsMetadataService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public GoogleMapsMetadataService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task<GoogleMapsMetadataResult> ResolveAsync(string? googleMapsUrl, string? embedUrl, string fallbackName)
    {
        var result = new GoogleMapsMetadataResult
        {
            GoogleMapsUrl = NormalizeUrl(googleMapsUrl) ?? NormalizeUrl(embedUrl),
            MapEmbedLink = NormalizeEmbedUrl(embedUrl) ?? NormalizeEmbedUrl(googleMapsUrl) ?? NormalizeUrl(googleMapsUrl),
        };

        if (!TryExtractCoordinates(result.GoogleMapsUrl ?? result.MapEmbedLink, out var latitude, out var longitude))
        {
            latitude = null;
            longitude = null;
        }

        result.Latitude = latitude;
        result.Longitude = longitude;
        result.GooglePlaceId = ExtractPlaceId(result.GoogleMapsUrl ?? result.MapEmbedLink);

        var apiKey = _configuration["GoogleMaps:ApiKey"];
        if (latitude.HasValue && longitude.HasValue && !string.IsNullOrWhiteSpace(apiKey))
        {
            result.MapPreviewImageUrl = BuildStaticMapUrl(latitude.Value, longitude.Value, apiKey);
            result.Address = await ResolveFormattedAddressAsync(latitude.Value, longitude.Value, apiKey) ?? fallbackName;
        }
        else
        {
            result.MapPreviewImageUrl ??= null;
        }

        return result;
    }

    private async Task<string?> ResolveFormattedAddressAsync(decimal latitude, decimal longitude, string apiKey)
    {
        var lat = latitude.ToString(CultureInfo.InvariantCulture);
        var lng = longitude.ToString(CultureInfo.InvariantCulture);
        var url = $"https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lng}&key={Uri.EscapeDataString(apiKey)}";

        try
        {
            using var response = await _httpClient.GetAsync(url);
            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            using var stream = await response.Content.ReadAsStreamAsync();
            using var doc = await JsonDocument.ParseAsync(stream);
            if (!doc.RootElement.TryGetProperty("results", out var results) || results.GetArrayLength() == 0)
            {
                return null;
            }

            return results[0].GetProperty("formatted_address").GetString();
        }
        catch
        {
            return null;
        }
    }

    private static string BuildStaticMapUrl(decimal latitude, decimal longitude, string apiKey)
    {
        var lat = latitude.ToString(CultureInfo.InvariantCulture);
        var lng = longitude.ToString(CultureInfo.InvariantCulture);
        return $"https://maps.googleapis.com/maps/api/staticmap?center={lat},{lng}&zoom=15&size=1200x675&markers=color:red%7C{lat},{lng}&key={Uri.EscapeDataString(apiKey)}";
    }

    private static string? NormalizeUrl(string? value)
    {
        var trimmed = value?.Trim();
        return string.IsNullOrWhiteSpace(trimmed) ? null : trimmed;
    }

    private static string? NormalizeEmbedUrl(string? value)
    {
        var normalized = NormalizeUrl(value);
        if (string.IsNullOrWhiteSpace(normalized))
        {
            return null;
        }

        if (normalized.Contains("<iframe", StringComparison.OrdinalIgnoreCase))
        {
            var match = Regex.Match(normalized, "src\\s*=\\s*\"(?<src>[^\"]+)\"", RegexOptions.IgnoreCase);
            return match.Success ? match.Groups["src"].Value : normalized;
        }

        return normalized;
    }

    private static string? ExtractPlaceId(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        var match = Regex.Match(value, @"place_id[:=](?<id>ChI[^\s&]+)", RegexOptions.IgnoreCase);
        return match.Success ? match.Groups["id"].Value : null;
    }

    private static bool TryExtractCoordinates(string? value, out decimal? latitude, out decimal? longitude)
    {
        latitude = null;
        longitude = null;

        if (string.IsNullOrWhiteSpace(value))
        {
            return false;
        }

        var decodedValue = TryDecode(value);
        var patterns = new[]
        {
            @"@(?<lat>-?\d+(?:\.\d+)?),(?<lng>-?\d+(?:\.\d+)?)",
            @"[?&]q=(?<lat>-?\d+(?:\.\d+)?),(?<lng>-?\d+(?:\.\d+)?)",
            @"[?&]query=(?<lat>-?\d+(?:\.\d+)?),(?<lng>-?\d+(?:\.\d+)?)",
            @"[?&]center=(?<lat>-?\d+(?:\.\d+)?),(?<lng>-?\d+(?:\.\d+)?)",
            @"[?&]destination=(?<lat>-?\d+(?:\.\d+)?),(?<lng>-?\d+(?:\.\d+)?)",
            @"!3d(?<lat>-?\d+(?:\.\d+)?)!4d(?<lng>-?\d+(?:\.\d+)?)"
        };

        foreach (var pattern in patterns)
        {
            var match = Regex.Match(decodedValue, pattern, RegexOptions.IgnoreCase);
            if (!match.Success)
            {
                continue;
            }

            if (
                decimal.TryParse(match.Groups["lat"].Value, NumberStyles.Float, CultureInfo.InvariantCulture, out var lat) &&
                decimal.TryParse(match.Groups["lng"].Value, NumberStyles.Float, CultureInfo.InvariantCulture, out var lng)
            )
            {
                latitude = lat;
                longitude = lng;
                return true;
            }
        }

        return false;
    }

    private static string TryDecode(string value)
    {
        try
        {
            return Uri.UnescapeDataString(value);
        }
        catch
        {
            return value;
        }
    }
}

public class GoogleMapsMetadataResult
{
    public string? GoogleMapsUrl { get; set; }
    public string? MapEmbedLink { get; set; }
    public string? MapPreviewImageUrl { get; set; }
    public string? GooglePlaceId { get; set; }
    public string? Address { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
}
