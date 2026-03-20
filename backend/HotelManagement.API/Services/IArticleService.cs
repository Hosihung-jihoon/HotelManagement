using HotelManagement.API.DTOs;

namespace HotelManagement.API.Services;

public interface IArticleService
{
    Task<IEnumerable<ArticleDto>> GetAllAsync();
    Task<ArticleDetailDto?> GetByIdAsync(int id);
    Task<ArticleDetailDto?> GetBySlugAsync(string slug);
    Task<ArticleDto> CreateAsync(CreateArticleDto dto);
    Task<bool> UpdateAsync(int id, UpdateArticleDto dto);
    Task<bool> DeleteAsync(int id);
}
