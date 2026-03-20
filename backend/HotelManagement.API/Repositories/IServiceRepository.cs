using HotelManagement.API.Models;

namespace HotelManagement.API.Repositories;

/// <summary>
/// Interface cho Service Repository.
/// Kế thừa IGenericRepository để có sẵn CRUD.
/// </summary>
public interface IServiceRepository : IGenericRepository<Service>
{
    Task<Service?> GetByIdWithCategoryAsync(int id);
    Task<IEnumerable<Service>> GetAllWithCategoryAsync();
}
