using HotelManagement.API.Models;
using HotelManagement.API.Data;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Repositories;

public interface IAuditLogRepository
{
    Task<IEnumerable<AuditLog>> GetAllAsync(string? action = null, string? tableName = null);
    Task<IEnumerable<AuditLog>> GetByUserIdAsync(int userId, string? action = null, string? tableName = null);
}

public class AuditLogRepository : IAuditLogRepository
{
    private readonly HotelDbContext _context;

    public AuditLogRepository(HotelDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<AuditLog>> GetAllAsync(string? action = null, string? tableName = null)
    {
        var query = _context.AuditLogs
            .Include(a => a.User)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(action))
            query = query.Where(a => a.Action == action);

        if (!string.IsNullOrWhiteSpace(tableName))
            query = query.Where(a => a.TableName == tableName);

        return await query
            .OrderByDescending(a => a.CreatedAt)
            .Take(500)
            .ToListAsync();
    }

    public async Task<IEnumerable<AuditLog>> GetByUserIdAsync(int userId, string? action = null, string? tableName = null)
    {
        var query = _context.AuditLogs
            .Include(a => a.User)
            .Where(a => a.UserId == userId)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(action))
            query = query.Where(a => a.Action == action);

        if (!string.IsNullOrWhiteSpace(tableName))
            query = query.Where(a => a.TableName == tableName);

        return await query
            .OrderByDescending(a => a.CreatedAt)
            .Take(200)
            .ToListAsync();
    }
}
