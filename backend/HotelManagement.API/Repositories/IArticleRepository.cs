using HotelManagement.API.Models;

namespace HotelManagement.API.Repositories;

public interface IArticleRepository : IGenericRepository<Article>
{
    Task<IEnumerable<Article>> GetAllWithDetailsAsync();
    Task<IEnumerable<Article>> GetActiveWithDetailsAsync(int? pageSize = null);
    Task<Article?> GetByIdWithDetailsAsync(int id);
    Task<Article?> GetBySlugWithDetailsAsync(string slug);
}
