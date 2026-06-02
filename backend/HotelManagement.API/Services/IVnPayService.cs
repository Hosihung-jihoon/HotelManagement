using HotelManagement.API.DTOs;

namespace HotelManagement.API.Services;

public interface IVnPayService
{
    string CreatePaymentUrl(HttpContext context, VnPayRequestDto request);
    bool ValidateSignature(IQueryCollection collections);
}
