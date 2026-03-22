using HotelManagement.API.Models;

namespace HotelManagement.API.Repositories;

public interface IArticleCategoryRepository : IGenericRepository<ArticleCategory>
{
    Task<ArticleCategory?> GetByIdWithArticlesAsync(int id);
}
