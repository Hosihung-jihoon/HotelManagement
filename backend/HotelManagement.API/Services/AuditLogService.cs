using HotelManagement.API.DTOs;
using HotelManagement.API.Models;
using HotelManagement.API.Repositories;

namespace HotelManagement.API.Services;

public interface IAuditLogService
{
    Task<IEnumerable<AuditLogDto>> GetAllAsync(string? action = null, string? tableName = null);
    Task<IEnumerable<AuditLogDto>> GetByUserIdAsync(int userId, string? action = null, string? tableName = null);
}

public class AuditLogService : IAuditLogService
{
    private readonly IAuditLogRepository _repository;

    public AuditLogService(IAuditLogRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<AuditLogDto>> GetAllAsync(string? action = null, string? tableName = null)
    {
        var logs = await _repository.GetAllAsync(action, tableName);
        return logs.Select(MapToDto);
    }

    public async Task<IEnumerable<AuditLogDto>> GetByUserIdAsync(int userId, string? action = null, string? tableName = null)
    {
        var logs = await _repository.GetByUserIdAsync(userId, action, tableName);
        return logs.Select(MapToDto);
    }

    private static AuditLogDto MapToDto(AuditLog log) => new()
    {
        Id = log.Id,
        UserId = log.UserId,
        UserName = log.User != null ? (log.User.FullName ?? log.User.Email) : null,
        Action = log.Action,
        TableName = log.TableName,
        RecordId = log.RecordId,
        OldValue = log.OldValue,
        NewValue = log.NewValue,
        CreatedAt = log.CreatedAt,
    };
}
