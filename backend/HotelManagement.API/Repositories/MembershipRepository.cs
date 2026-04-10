using HotelManagement.API.Data;
using HotelManagement.API.Models;

namespace HotelManagement.API.Repositories;

/// <summary>
/// Membership Repository.
/// Kế thừa GenericRepository để có sẵn CRUD cơ bản.
/// Override SoftDeleteAsync để xóa mềm (IsDeleted = true).
/// </summary>
public class MembershipRepository : GenericRepository<Membership>, IMembershipRepository
{
    public MembershipRepository(HotelDbContext context) : base(context) { }

    /// <summary>
    /// Xóa mềm hạng thành viên - đặt IsDeleted = true thay vì xóa khỏi DB
    /// </summary>
    public async Task<bool> SoftDeleteAsync(int id)
    {
        var entity = await _dbSet.FindAsync(id);
        if (entity == null || entity.IsDeleted) return false;

        entity.IsDeleted = true;
        await _context.SaveChangesAsync();
        return true;
    }
}
