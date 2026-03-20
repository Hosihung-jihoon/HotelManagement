using HotelManagement.API.Data;
using HotelManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Repositories;

public class ArticleCategoryRepository : GenericRepository<ArticleCategory>, IArticleCategoryRepository
{
    public ArticleCategoryRepository(HotelDbContext context) : base(context)
    {
    }

    public async Task<ArticleCategory?> GetByIdWithArticlesAsync(int id)
    {
        return await _dbSet
            .Include(ac => ac.Articles)
            .FirstOrDefaultAsync(ac => ac.Id == id);
    }
}
