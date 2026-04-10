using HotelManagement.API.Models;

namespace HotelManagement.API.Repositories;

/// <summary>
/// Interface cho Membership Repository.
/// Kế thừa IGenericRepository để có sẵn CRUD.
/// Thêm SoftDeleteAsync cho cơ chế xóa mềm.
/// </summary>
public interface IMembershipRepository : IGenericRepository<Membership>
{
    Task<bool> SoftDeleteAsync(int id);
}
