namespace HotelManagement.API.DTOs;

public class DashboardStatsDto
{
    // === Thống kê phòng ===
    public int TotalRooms { get; set; }
    public int OccupiedRooms { get; set; }
    public int AvailableRooms { get; set; }

    // === Thống kê booking ===
    public int TotalBookingsToday { get; set; }
    public int TotalBookings { get; set; }

    // === Doanh thu ===
    public decimal TotalRevenue { get; set; }

    // === Dữ liệu biểu đồ ===
    public List<RevenueByMonthDto> RevenueByMonth { get; set; } = new();
    public List<BookingsByStatusDto> BookingsByStatus { get; set; } = new();
}

public class RevenueByMonthDto
{
    public string Month { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}

public class BookingsByStatusDto
{
    public string Status { get; set; } = string.Empty;
    public int Count { get; set; }
}
