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
            .Include(a => a.Attraction)
            .OrderByDescending(a => a.PublishedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Article>> GetActiveWithDetailsAsync(int? pageSize = null)
    {
        var query = _dbSet
            .Include(a => a.Category)
            .Include(a => a.Author)
            .Include(a => a.Attraction)
            .Where(a => a.IsActive == true)
            .OrderByDescending(a => a.PublishedAt);

        if (pageSize.HasValue && pageSize.Value > 0)
            return await query.Take(pageSize.Value).ToListAsync();

        return await query.ToListAsync();
    }

    public async Task<Article?> GetByIdWithDetailsAsync(int id)
    {
        return await _dbSet
            .Include(a => a.Category)
            .Include(a => a.Author)
            .Include(a => a.Attraction)
            .FirstOrDefaultAsync(a => a.Id == id);
    }

    public async Task<Article?> GetBySlugWithDetailsAsync(string slug)
    {
        return await _dbSet
            .Include(a => a.Category)
            .Include(a => a.Author)
            .Include(a => a.Attraction)
            .FirstOrDefaultAsync(a => a.Slug == slug);
    }
}
