using HotelManagement.API.DTOs;

namespace HotelManagement.API.Services;

public interface IDashboardService
{
    Task<DashboardStatsDto> GetStatsAsync(int? month, int? year);
}
