using HotelManagement.API.Models;

namespace HotelManagement.API.Repositories;

public interface IArticleRepository : IGenericRepository<Article>
{
    Task<IEnumerable<Article>> GetAllWithDetailsAsync();
    Task<Article?> GetByIdWithDetailsAsync(int id);
}
