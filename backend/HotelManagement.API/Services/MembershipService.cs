using HotelManagement.API.DTOs;
using HotelManagement.API.Helpers;
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
    private const int PointToVndRate = 10000;

    public MembershipService(IMembershipRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<MembershipDto>> GetAllAsync()
    {
        var memberships = await _repository.GetAllAsync();

        return memberships
            .Where(m => MembershipTierCatalog.IsCanonical(m.TierName))
            .OrderBy(m => m.DisplayOrder)
            .ThenBy(m => m.MinPoints)
            .Select(ToDto);
    }

    public async Task<MembershipDto?> GetByIdAsync(int id)
    {
        var membership = await _repository.GetByIdAsync(id);
        if (membership == null) return null;

        if (!MembershipTierCatalog.IsCanonical(membership.TierName))
        {
            return null;
        }

        return ToDto(membership);
    }

    public async Task<MembershipDto> CreateAsync(CreateMembershipDto dto)
    {
        var canonicalName = MembershipTierCatalog.MapToCanonicalName(dto.TierName);
        if (canonicalName == null)
        {
            throw new ArgumentException("Chi ho tro 4 hang thanh vien chuan.");
        }

        dto.TierName = canonicalName;
        var existing = await _repository.GetAllAsync();
        if (existing.Any(m => string.Equals(m.TierName, canonicalName, StringComparison.OrdinalIgnoreCase)))
        {
            throw new ArgumentException("Hang thanh vien nay da ton tai. Hay chinh sua cau hinh hien co.");
        }
        var entity = new Membership
        {
            TierName = dto.TierName,
            MinPoints = dto.MinPoints,
            DiscountPercent = dto.DiscountPercent,
            DisplayOrder = dto.DisplayOrder,
            PointMultiplier = dto.PointMultiplier,
            Amenities = dto.Amenities,
            Services = dto.Services,
            Benefits = dto.Benefits,
            RedeemOptions = dto.RedeemOptions
        };

        var created = await _repository.CreateAsync(entity);

        return ToDto(created);
    }

    public async Task<bool> UpdateAsync(int id, UpdateMembershipDto dto)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null) return false;

        var canonicalName = MembershipTierCatalog.MapToCanonicalName(dto.TierName);
        if (canonicalName == null)
        {
            throw new ArgumentException("Chi ho tro 4 hang thanh vien chuan.");
        }

        entity.TierName = canonicalName;
        entity.MinPoints = dto.MinPoints;
        entity.DiscountPercent = dto.DiscountPercent;
        entity.DisplayOrder = dto.DisplayOrder;
        entity.PointMultiplier = dto.PointMultiplier;
        entity.Amenities = dto.Amenities;
        entity.Services = dto.Services;
        entity.Benefits = dto.Benefits;
        entity.RedeemOptions = dto.RedeemOptions;

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

    private static MembershipDto ToDto(Membership membership) => new()
    {
        Id = membership.Id,
        TierName = membership.TierName,
        MinPoints = membership.MinPoints,
        DiscountPercent = membership.DiscountPercent,
        DisplayOrder = membership.DisplayOrder,
        PointMultiplier = membership.PointMultiplier,
        PointToVndRate = PointToVndRate,
        Amenities = membership.Amenities,
        Services = membership.Services,
        Benefits = membership.Benefits,
        RedeemOptions = membership.RedeemOptions
    };
}
