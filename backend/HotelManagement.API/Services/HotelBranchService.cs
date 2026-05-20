using HotelManagement.API.Data;
using HotelManagement.API.DTOs;
using HotelManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Services;

/// <summary>
/// HotelBranch Service — CRUD chi nhánh khách sạn và tính khoảng cách Haversine đến các Attraction.
/// </summary>
public class HotelBranchService
{
    private readonly HotelDbContext _context;
    private readonly IGoogleMapsMetadataService _googleMapsMetadataService;

    public HotelBranchService(HotelDbContext context, IGoogleMapsMetadataService googleMapsMetadataService)
    {
        _context = context;
        _googleMapsMetadataService = googleMapsMetadataService;
    }

    // ── CRUD ────────────────────────────────────────────────
    public async Task<IEnumerable<HotelBranchDto>> GetAllAsync()
    {
        return await _context.HotelBranches
            .OrderByDescending(b => b.IsMain)
            .ThenBy(b => b.Name)
            .Select(b => new HotelBranchDto
            {
                Id = b.Id,
                Name = b.Name,
                Address = b.Address,
                GoogleMapsUrl = b.GoogleMapsUrl,
                MapEmbedLink = b.MapEmbedLink,
                MapPreviewImageUrl = b.MapPreviewImageUrl,
                GooglePlaceId = b.GooglePlaceId,
                Latitude = b.Latitude,
                Longitude = b.Longitude,
                Phone = b.Phone,
                IsMain = b.IsMain,
                IsActive = b.IsActive
            })
            .ToListAsync();
    }

    public async Task<HotelBranchDto?> GetByIdAsync(int id)
    {
        var b = await _context.HotelBranches.FindAsync(id);
        if (b == null) return null;
        return ToDto(b);
    }

    public async Task<HotelBranchDto> CreateAsync(CreateHotelBranchDto dto)
    {
        var metadata = await _googleMapsMetadataService.ResolveAsync(dto.GoogleMapsUrl, dto.MapEmbedLink, dto.Name);
        var entity = new HotelBranch
        {
            Name = dto.Name,
            Address = metadata.Address ?? dto.Address,
            GoogleMapsUrl = metadata.GoogleMapsUrl ?? dto.GoogleMapsUrl,
            MapEmbedLink = metadata.MapEmbedLink ?? dto.MapEmbedLink,
            MapPreviewImageUrl = metadata.MapPreviewImageUrl,
            GooglePlaceId = metadata.GooglePlaceId,
            Latitude = metadata.Latitude ?? dto.Latitude,
            Longitude = metadata.Longitude ?? dto.Longitude,
            Phone = dto.Phone,
            IsMain = dto.IsMain,
            IsActive = dto.IsActive
        };
        _context.HotelBranches.Add(entity);
        await _context.SaveChangesAsync();
        await RecalcAllDistancesAsync();
        return ToDto(entity);
    }

    public async Task<bool> UpdateAsync(int id, UpdateHotelBranchDto dto)
    {
        var entity = await _context.HotelBranches.FindAsync(id);
        if (entity == null) return false;
        var metadata = await _googleMapsMetadataService.ResolveAsync(dto.GoogleMapsUrl, dto.MapEmbedLink, dto.Name);
        entity.Name = dto.Name;
        entity.Address = metadata.Address ?? dto.Address;
        entity.GoogleMapsUrl = metadata.GoogleMapsUrl ?? dto.GoogleMapsUrl;
        entity.MapEmbedLink = metadata.MapEmbedLink ?? dto.MapEmbedLink;
        entity.MapPreviewImageUrl = metadata.MapPreviewImageUrl;
        entity.GooglePlaceId = metadata.GooglePlaceId;
        entity.Latitude = metadata.Latitude ?? dto.Latitude;
        entity.Longitude = metadata.Longitude ?? dto.Longitude;
        entity.Phone = dto.Phone;
        entity.IsMain = dto.IsMain;
        entity.IsActive = dto.IsActive;
        await _context.SaveChangesAsync();
        await RecalcAllDistancesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var entity = await _context.HotelBranches.FindAsync(id);
        if (entity == null) return false;
        _context.HotelBranches.Remove(entity);
        await _context.SaveChangesAsync();
        return true;
    }

    // ── Khoảng cách ─────────────────────────────────────────
    /// <summary>
    /// Tính khoảng cách Haversine từ mỗi Attraction đến tất cả chi nhánh.
    /// Cập nhật luôn cột DistanceKm = khoảng cách đến chi nhánh gần nhất.
    /// </summary>
    public async Task<IEnumerable<AttractionDistanceDto>> RecalcAllDistancesAsync()
    {
        var branches = await _context.HotelBranches.Where(b => b.IsActive).ToListAsync();
        var attractions = await _context.Attractions.ToListAsync();

        var result = new List<AttractionDistanceDto>();
        if (branches.Count == 0)
        {
            return attractions.Select(attr => new AttractionDistanceDto
            {
                AttractionId = attr.Id,
                AttractionName = attr.Name,
                Distances = new(),
                Updated = false,
                SkipReason = "Khong co chi nhanh dang hoat dong co toa do cache."
            }).ToList();
        }

        foreach (var attr in attractions)
        {
            if (attr.Latitude == null || attr.Longitude == null)
            {
                result.Add(new AttractionDistanceDto
                {
                    AttractionId = attr.Id,
                    AttractionName = attr.Name,
                    Distances = new(),
                    Updated = false,
                    SkipReason = "Dia diem chua co toa do cache tu Google Maps."
                });
                continue;
            }

            var distItems = new List<BranchDistanceItem>();
            foreach (var branch in branches)
            {
                if (branch.Latitude == null || branch.Longitude == null) continue;
                var km = Haversine(
                    (double)branch.Latitude.Value, (double)branch.Longitude.Value,
                    (double)attr.Latitude.Value, (double)attr.Longitude.Value
                );
                distItems.Add(new BranchDistanceItem
                {
                    BranchId = branch.Id,
                    BranchName = branch.Name,
                    DistanceKm = Math.Round((decimal)km, 2)
                });
            }

            var nearest = distItems.OrderBy(d => d.DistanceKm).FirstOrDefault();

            // Update distanceKm in attraction record
            if (nearest?.DistanceKm != null)
                attr.DistanceKm = nearest.DistanceKm;

            result.Add(new AttractionDistanceDto
            {
                AttractionId = attr.Id,
                AttractionName = attr.Name,
                Distances = distItems,
                NearestDistanceKm = nearest?.DistanceKm,
                NearestBranchName = nearest?.BranchName,
                Updated = nearest != null,
                SkipReason = nearest == null ? "Khong co chi nhanh nao co toa do cache hop le." : null
            });
        }

        await _context.SaveChangesAsync();
        return result;
    }

    // ── Haversine ────────────────────────────────────────────
    /// <summary>Haversine formula — trả về khoảng cách km giữa 2 tọa độ.</summary>
    public static double Haversine(double lat1, double lon1, double lat2, double lon2)
    {
        const double R = 6371.0; // Earth radius in km
        var dLat = ToRad(lat2 - lat1);
        var dLon = ToRad(lon2 - lon1);
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2)
              + Math.Cos(ToRad(lat1)) * Math.Cos(ToRad(lat2))
              * Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return R * c;
    }

    private static double ToRad(double deg) => deg * Math.PI / 180;

    private static HotelBranchDto ToDto(HotelBranch b) => new HotelBranchDto
    {
        Id = b.Id,
        Name = b.Name,
        Address = b.Address,
        GoogleMapsUrl = b.GoogleMapsUrl,
        MapEmbedLink = b.MapEmbedLink,
        MapPreviewImageUrl = b.MapPreviewImageUrl,
        GooglePlaceId = b.GooglePlaceId,
        Latitude = b.Latitude,
        Longitude = b.Longitude,
        Phone = b.Phone,
        IsMain = b.IsMain,
        IsActive = b.IsActive
    };
}
