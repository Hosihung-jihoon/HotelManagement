using HotelManagement.API.DTOs;
using HotelManagement.API.Models;
using HotelManagement.API.Repositories;

namespace HotelManagement.API.Services;

/// <summary>
/// Membership Service.
/// Chứa business logic + mapping Entity <-> DTO.
/// DeleteAsync sử dụng cơ chế Soft Delete (IsDeleted = true).
/// </summary>
public class MembershipService : IMembershipService
{
    private readonly IMembershipRepository _repository;

    public MembershipService(IMembershipRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<MembershipDto>> GetAllAsync()
    {
        var memberships = await _repository.GetAllAsync();

        return memberships.Select(m => new MembershipDto
        {
            Id = m.Id,
            TierName = m.TierName,
            MinPoints = m.MinPoints,
            DiscountPercent = m.DiscountPercent
        });
    }

    public async Task<MembershipDto?> GetByIdAsync(int id)
    {
        var membership = await _repository.GetByIdAsync(id);
        if (membership == null) return null;

        return new MembershipDto
        {
            Id = membership.Id,
            TierName = membership.TierName,
            MinPoints = membership.MinPoints,
            DiscountPercent = membership.DiscountPercent
        };
    }

    public async Task<MembershipDto> CreateAsync(CreateMembershipDto dto)
    {
        var entity = new Membership
        {
            TierName = dto.TierName,
            MinPoints = dto.MinPoints,
            DiscountPercent = dto.DiscountPercent
        };

        var created = await _repository.CreateAsync(entity);

        return new MembershipDto
        {
            Id = created.Id,
            TierName = created.TierName,
            MinPoints = created.MinPoints,
            DiscountPercent = created.DiscountPercent
        };
    }

    public async Task<bool> UpdateAsync(int id, UpdateMembershipDto dto)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null) return false;

        entity.TierName = dto.TierName;
        entity.MinPoints = dto.MinPoints;
        entity.DiscountPercent = dto.DiscountPercent;

        await _repository.UpdateAsync(entity);
        return true;
    }

    /// <summary>
    /// Xóa mềm hạng thành viên (IsDeleted = true)
    /// </summary>
    public async Task<bool> DeleteAsync(int id)
    {
        return await _repository.SoftDeleteAsync(id);
    }
}
