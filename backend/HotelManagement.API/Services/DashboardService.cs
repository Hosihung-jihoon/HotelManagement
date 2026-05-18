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

    public async Task<DashboardStatsDto> GetStatsAsync(int? month, int? year)
    {
        var today = DateTime.UtcNow.Date;
        var currentYear = year ?? DateTime.UtcNow.Year;

        // === Thống kê phòng ===
        var totalRooms = await _context.Rooms.CountAsync();
        var occupiedRooms = await _context.Rooms.CountAsync(r => r.Status == "Occupied");
        var availableRooms = await _context.Rooms.CountAsync(r => r.Status == "Available");

        // Query base
        var bookingsQuery = _context.Bookings.AsQueryable();
        var invoicesQuery = _context.Invoices.Where(i => i.Status == "Paid");

        if (month.HasValue)
        {
            bookingsQuery = bookingsQuery.Where(b => b.CreatedAt.Year == currentYear && b.CreatedAt.Month == month.Value);
            invoicesQuery = invoicesQuery.Where(i => i.CreatedAt.Year == currentYear && i.CreatedAt.Month == month.Value);
        }
        else
        {
            bookingsQuery = bookingsQuery.Where(b => b.CreatedAt.Year == currentYear);
            invoicesQuery = invoicesQuery.Where(i => i.CreatedAt.Year == currentYear);
        }

        // === Thống kê booking in period ===
        var totalBookings = await bookingsQuery.CountAsync();
        var totalBookingsToday = await _context.Bookings.CountAsync(b => b.CreatedAt.Date == today); // today remains absolute today

        // === Doanh thu tổng in period ===
        var totalRevenue = await invoicesQuery.SumAsync(i => i.FinalTotal ?? 0);

        List<RevenueByMonthDto> fullRevenueByMonth;

        if (month.HasValue)
        {
            // Doanh thu theo từng ngày trong tháng
            var revenueByDay = await invoicesQuery
                .GroupBy(i => i.CreatedAt.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    Amount = g.Sum(i => i.FinalTotal ?? 0)
                })
                .ToListAsync();

            var daysInMonth = DateTime.DaysInMonth(currentYear, month.Value);
            
            fullRevenueByMonth = Enumerable.Range(1, daysInMonth)
                .Select(d => new RevenueByMonthDto
                {
                    Month = d.ToString("00") + "/" + month.Value.ToString("00"),
                    Amount = revenueByDay.FirstOrDefault(r => r.Date.Day == d)?.Amount ?? 0
                })
                .ToList();
        }
        else
        {
            // Doanh thu theo tháng (năm hiện tại)
            var revenueByMonth = await invoicesQuery
                .GroupBy(i => i.CreatedAt.Month)
                .Select(g => new RevenueByMonthDto
                {
                    Month = "T" + g.Key,
                    Amount = g.Sum(i => i.FinalTotal ?? 0)
                })
                .OrderBy(r => r.Month)
                .ToListAsync();

            fullRevenueByMonth = Enumerable.Range(1, 12)
                .Select(m => revenueByMonth.FirstOrDefault(r => r.Month == "T" + m) ?? new RevenueByMonthDto { Month = "T" + m, Amount = 0 })
                .ToList();
        }

        // === Bookings theo trạng thái (trong kỳ lọc) ===
        var bookingsByStatus = await bookingsQuery
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
