using HotelManagement.API.Data;
using HotelManagement.API.DTOs;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Services;

/// <summary>
/// Dashboard Service - Aggregate thống kê từ database.
/// Truy vấn trực tiếp HotelDbContext để lấy dữ liệu cho biểu đồ.
/// </summary>
public class DashboardService : IDashboardService
{
    private readonly HotelDbContext _context;

    public DashboardService(HotelDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardStatsDto> GetStatsAsync()
    {
        var today = DateTime.UtcNow.Date;
        var currentYear = DateTime.UtcNow.Year;

        // === Thống kê phòng ===
        var totalRooms = await _context.Rooms.CountAsync();
        var occupiedRooms = await _context.Rooms.CountAsync(r => r.Status == "Occupied");
        var availableRooms = await _context.Rooms.CountAsync(r => r.Status == "Available");

        // === Thống kê booking ===
        var totalBookings = await _context.Bookings.CountAsync();
        var totalBookingsToday = await _context.Bookings
            .CountAsync(b => b.CreatedAt.Date == today);

        // === Doanh thu tổng ===
        var totalRevenue = await _context.Invoices
            .Where(i => i.Status == "Paid")
            .SumAsync(i => i.FinalTotal ?? 0);

        // === Doanh thu theo tháng (năm hiện tại) ===
        var revenueByMonth = await _context.Invoices
            .Where(i => i.Status == "Paid" && i.CreatedAt.Year == currentYear)
            .GroupBy(i => i.CreatedAt.Month)
            .Select(g => new RevenueByMonthDto
            {
                Month = "T" + g.Key,
                Amount = g.Sum(i => i.FinalTotal ?? 0)
            })
            .OrderBy(r => r.Month)
            .ToListAsync();

        // Đảm bảo đủ 12 tháng (tháng không có doanh thu = 0)
        var fullRevenueByMonth = Enumerable.Range(1, 12)
            .Select(m => revenueByMonth.FirstOrDefault(r => r.Month == "T" + m) ?? new RevenueByMonthDto { Month = "T" + m, Amount = 0 })
            .ToList();

        // === Bookings theo trạng thái ===
        var bookingsByStatus = await _context.Bookings
            .GroupBy(b => b.Status)
            .Select(g => new BookingsByStatusDto
            {
                Status = g.Key ?? "Unknown",
                Count = g.Count()
            })
            .ToListAsync();

        return new DashboardStatsDto
        {
            TotalRooms = totalRooms,
            OccupiedRooms = occupiedRooms,
            AvailableRooms = availableRooms,
            TotalBookings = totalBookings,
            TotalBookingsToday = totalBookingsToday,
            TotalRevenue = totalRevenue,
            RevenueByMonth = fullRevenueByMonth,
            BookingsByStatus = bookingsByStatus
        };
    }
}
