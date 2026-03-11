using System.Linq.Expressions;

namespace HotelManagement.API.Repositories;

/// <summary>
/// Interface Generic Repository - Team chỉ cần kế thừa interface này cho entity mới.
/// </summary>
public interface IGenericRepository<T> where T : class
{
    Task<IEnumerable<T>> GetAllAsync();
    Task<T?> GetByIdAsync(int id);
    Task<T> CreateAsync(T entity);
    Task UpdateAsync(T entity);
    Task DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
}
