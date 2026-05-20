namespace HotelManagement.API.Helpers;

public static class RoomStateHelper
{
    public const string StatusAvailable = "Available";
    public const string StatusOccupied = "Occupied";
    public const string StatusMaintenance = "Maintenance";
    public const string StatusLocked = "Locked";

    public const string CleanDirty = "dirty";
    public const string CleanCleaning = "cleaning";
    public const string CleanInspecting = "inspecting";
    public const string CleanClean = "clean";

    public static bool TryNormalizeBusinessStatus(string? status, out string normalized)
    {
        normalized = NormalizeBusinessStatus(status);
        return !string.IsNullOrWhiteSpace(status) || normalized == StatusAvailable;
    }

    public static string NormalizeBusinessStatus(string? status)
    {
        var value = status?.Trim();
        if (string.IsNullOrWhiteSpace(value))
            return StatusAvailable;

        if (value.Equals("Cleaning", StringComparison.OrdinalIgnoreCase))
            return StatusAvailable;

        if (value.Equals(StatusAvailable, StringComparison.OrdinalIgnoreCase))
            return StatusAvailable;

        if (value.Equals(StatusOccupied, StringComparison.OrdinalIgnoreCase))
            return StatusOccupied;

        if (value.Equals(StatusMaintenance, StringComparison.OrdinalIgnoreCase))
            return StatusMaintenance;

        if (value.Equals(StatusLocked, StringComparison.OrdinalIgnoreCase))
            return StatusLocked;

        return StatusAvailable;
    }

    public static bool IsSupportedBusinessStatus(string? status)
    {
        var value = status?.Trim();
        if (string.IsNullOrWhiteSpace(value))
            return true;

        return value.Equals(StatusAvailable, StringComparison.OrdinalIgnoreCase)
            || value.Equals(StatusOccupied, StringComparison.OrdinalIgnoreCase)
            || value.Equals(StatusMaintenance, StringComparison.OrdinalIgnoreCase)
            || value.Equals(StatusLocked, StringComparison.OrdinalIgnoreCase)
            || value.Equals("Cleaning", StringComparison.OrdinalIgnoreCase);
    }

    public static bool TryNormalizeCleanStatus(string? cleanStatus, out string normalized)
    {
        if (string.IsNullOrWhiteSpace(cleanStatus))
        {
            normalized = CleanClean;
            return true;
        }

        var value = cleanStatus.Trim();

        if (value.Equals(CleanDirty, StringComparison.OrdinalIgnoreCase))
        {
            normalized = CleanDirty;
            return true;
        }

        if (value.Equals(CleanCleaning, StringComparison.OrdinalIgnoreCase))
        {
            normalized = CleanCleaning;
            return true;
        }

        if (value.Equals(CleanInspecting, StringComparison.OrdinalIgnoreCase))
        {
            normalized = CleanInspecting;
            return true;
        }

        if (value.Equals(CleanClean, StringComparison.OrdinalIgnoreCase))
        {
            normalized = CleanClean;
            return true;
        }

        if (value.Equals("loss", StringComparison.OrdinalIgnoreCase))
        {
            normalized = CleanInspecting;
            return true;
        }

        normalized = CleanClean;
        return false;
    }

    public static string NormalizeCleanStatus(string? cleanStatus)
    {
        return TryNormalizeCleanStatus(cleanStatus, out var normalized) ? normalized : CleanClean;
    }

    public static bool IsRoomReady(string? status, string? cleanStatus)
    {
        return NormalizeBusinessStatus(status) == StatusAvailable
            && NormalizeCleanStatus(cleanStatus) == CleanClean;
    }
}
