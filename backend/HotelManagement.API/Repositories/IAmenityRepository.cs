using HotelManagement.API.Models;

namespace HotelManagement.API.Repositories;

/// <summary>
/// Interface cho Amenity Repository.
/// Kế thừa IGenericRepository để có sẵn CRUD.
/// Thêm SoftDeleteAsync cho cơ chế xóa mềm.
/// </summary>
public interface IAmenityRepository : IGenericRepository<Amenity>
{
    Task<bool> SoftDeleteAsync(int id);
}
