using HotelManagement.API.DTOs;
using HotelManagement.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

[ApiController]
[Route("api/payment/[controller]")]
public class MomoController : ControllerBase
{
    private readonly IMomoService _momoService;
    private readonly IBookingService _bookingService;

    public MomoController(IMomoService momoService, IBookingService bookingService)
    {
        _momoService = momoService;
        _bookingService = bookingService;
    }

    [HttpPost("create")]
    public async Task<IActionResult> CreatePayment([FromBody] MomoRequestDto request)
    {
        try
        {
            var response = await _momoService.CreatePaymentAsync(request);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("ipn")]
    public async Task<IActionResult> PaymentCallback([FromBody] MomoCallbackDto callback)
    {
        // This is the IPN (Instant Payment Notification) called by MoMo server
        if (!_momoService.ValidateSignature(callback))
        {
            return BadRequest(new { message = "Chữ ký không hợp lệ" });
        }

        // Extract bookingId from extraData
        int bookingId = 0;
        if (!string.IsNullOrEmpty(callback.ExtraData))
        {
            var parts = callback.ExtraData.Split('=');
            if (parts.Length == 2 && parts[0] == "bookingId")
            {
                int.TryParse(parts[1], out bookingId);
            }
        }

        if (bookingId > 0)
        {
            string status = callback.ResultCode == 0 ? "paid" : "failed";
            
            // Update booking status
            await _bookingService.UpdateAsync(bookingId, new UpdateBookingDto { Status = status });

            if (callback.ResultCode == 0)
            {
                // Record payment record
                await _bookingService.AddPaymentAsync(bookingId, new AddBookingPaymentDto
                {
                    Amount = callback.Amount,
                    PaymentMethod = "MoMo",
                    TransactionCode = callback.TransId.ToString(),
                    PaymentDate = DateTime.UtcNow
                });
            }
        }

        return Ok(); // Always return 200 to MoMo unless there's a server error
    }
}
