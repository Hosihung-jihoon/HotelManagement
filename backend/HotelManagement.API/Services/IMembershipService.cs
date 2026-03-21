using HotelManagement.API.DTOs;

namespace HotelManagement.API.Services;

/// <summary>
/// Interface Service cho Membership.
/// Service chứa business logic, Controller chỉ gọi Service.
/// </summary>
public interface IMembershipService
{
    Task<IEnumerable<MembershipDto>> GetAllAsync();
    Task<MembershipDto?> GetByIdAsync(int id);
    Task<MembershipDto> CreateAsync(CreateMembershipDto dto);
    Task<bool> UpdateAsync(int id, UpdateMembershipDto dto);
    Task<bool> DeleteAsync(int id);
}
