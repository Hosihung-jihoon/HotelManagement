using HotelManagement.API.Models;

namespace HotelManagement.API.Repositories;

/// <summary>
/// Interface cho ServiceCategory Repository.
/// Kế thừa IGenericRepository để có sẵn CRUD.
/// </summary>
public interface IServiceCategoryRepository : IGenericRepository<ServiceCategory>
{
    Task<ServiceCategory?> GetByIdWithServicesAsync(int id);
}
