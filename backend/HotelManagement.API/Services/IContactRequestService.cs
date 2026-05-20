using HotelManagement.API.DTOs;

namespace HotelManagement.API.Services;

public interface IContactRequestService
{
    Task<ContactRequestDto> CreateAsync(CreateContactRequestDto dto);
}
