using HotelManagement.API.DTOs;
using HotelManagement.API.Models;
using HotelManagement.API.Repositories;
using HotelManagement.API.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace HotelManagement.API.Services;

/// <summary>
/// Notification Service - Business logic + mapping Entity ↔ DTO.
/// </summary>
public class NotificationService : INotificationService
{
    private readonly INotificationRepository _repository;
    private readonly IHubContext<NotificationHub> _hubContext;

    public NotificationService(INotificationRepository repository, IHubContext<NotificationHub> hubContext)
    {
        _repository = repository;
        _hubContext = hubContext;
    }

    public async Task<IEnumerable<NotificationDto>> GetAllAsync()
    {
        var notifications = await _repository.GetAllOrderedAsync();
        return notifications.Select(MapToDto);
    }

    public async Task<NotificationDto?> GetByIdAsync(int id)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null) return null;
        return MapToDto(entity);
    }

    public async Task<IEnumerable<NotificationDto>> GetByUserIdAsync(int userId)
    {
        var notifications = await _repository.GetByUserIdAsync(userId);
        return notifications.Select(MapToDto);
    }

    public async Task<NotificationDto> CreateAsync(CreateNotificationDto dto)
    {
        var entity = new Notification
        {
            UserId = dto.UserId,
            Title = dto.Title,
            Message = dto.Message,
            Type = dto.Type,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _repository.CreateAsync(entity);
        var resultDto = MapToDto(created);

        // Broadcast to SignalR
        if (dto.UserId.HasValue)
        {
            await _hubContext.Clients.Group(dto.UserId.Value.ToString()).SendAsync("ReceiveNotification", resultDto);
        }
        else
        {
            await _hubContext.Clients.All.SendAsync("ReceiveNotification", resultDto);
        }

        return resultDto;
    }

    public async Task<bool> MarkAsReadAsync(int id, UpdateNotificationDto dto)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null) return false;

        entity.IsRead = dto.IsRead;
        await _repository.UpdateAsync(entity);
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        if (!await _repository.ExistsAsync(id)) return false;
        await _repository.DeleteAsync(id);
        return true;
    }

    private static NotificationDto MapToDto(Notification n)
    {
        return new NotificationDto
        {
            Id = n.Id,
            UserId = n.UserId,
            Title = n.Title,
            Message = n.Message,
            Type = n.Type,
            IsRead = n.IsRead,
            CreatedAt = n.CreatedAt
        };
    }
}
