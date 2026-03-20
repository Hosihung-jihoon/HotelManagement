using HotelManagement.API.Data;
using HotelManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Repositories;

public class ArticleRepository : GenericRepository<Article>, IArticleRepository
{
    public ArticleRepository(HotelDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Article>> GetAllWithDetailsAsync()
    {
        return await _dbSet
            .Include(a => a.Category)
            .Include(a => a.Author)
            .OrderByDescending(a => a.PublishedAt)
            .ToListAsync();
    }

    public async Task<Article?> GetByIdWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(a => a.Category)
            .Include(a => a.Author)
            .FirstOrDefaultAsync(a => a.Id == id);
    }
}
