using HotelManagement.API.Data;
using HotelManagement.API.DTOs;
using HotelManagement.API.Models;

namespace HotelManagement.API.Services;

public class ContactRequestService : IContactRequestService
{
    private readonly HotelDbContext _context;

    public ContactRequestService(HotelDbContext context)
    {
        _context = context;
    }

    public async Task<ContactRequestDto> CreateAsync(CreateContactRequestDto dto)
    {
        var entity = new ContactRequest
        {
            Name = dto.Name.Trim(),
            Email = dto.Email.Trim(),
            Phone = dto.Phone?.Trim(),
            Subject = dto.Subject?.Trim(),
            Message = dto.Message.Trim(),
            Status = "New",
            CreatedAt = DateTime.UtcNow
        };

        _context.ContactRequests.Add(entity);
        await _context.SaveChangesAsync();

        return new ContactRequestDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Email = entity.Email,
            Phone = entity.Phone,
            Subject = entity.Subject,
            Message = entity.Message,
            CreatedAt = entity.CreatedAt,
            Status = entity.Status
        };
    }
}
