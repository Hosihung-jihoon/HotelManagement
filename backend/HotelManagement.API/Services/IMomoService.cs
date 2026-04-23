using HotelManagement.API.DTOs;

namespace HotelManagement.API.Services;

public interface IMomoService
{
    Task<MomoCreatePaymentResponseDto> CreatePaymentAsync(MomoRequestDto request);
    bool ValidateSignature(MomoCallbackDto callback);
}
