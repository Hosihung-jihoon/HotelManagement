using HotelManagement.API.DTOs;

namespace HotelManagement.API.Services;

public interface IReviewService
{
    Task<IEnumerable<ReviewDto>> GetByRoomAsync(int roomId);
    Task<IEnumerable<ReviewDto>> GetByUserAsync(int userId);
    Task<ReviewDto> CreateAsync(int userId, CreateReviewDto dto);
}
