using HotelManagement.API.DTOs;
using HotelManagement.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
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

    [HttpGet("return")]
    public IActionResult PaymentReturn([FromQuery] MomoCallbackDto callback)
    {
        // This is where MoMo redirects the user after payment
        // We can check the resultCode here to show a message to the user
        if (callback.ResultCode == 0)
        {
            return Ok(new { message = "Thanh toán thành công", data = callback });
        }
        return BadRequest(new { message = "Thanh toán thất bại hoặc đã bị hủy", data = callback });
    }

    [HttpPost("callback")]
    public async Task<IActionResult> PaymentCallback([FromBody] MomoCallbackDto callback)
    {
        // This is the IPN (Instant Payment Notification) called by MoMo server
        if (!_momoService.ValidateSignature(callback))
        {
            return BadRequest(new { message = "Chữ ký không hợp lệ" });
        }

        if (callback.ResultCode == 0)
        {
            // Logic to update booking status in database
            // We might need to parse extraData or use orderId to find the booking
            // For now, let's assume we can find it. 
            // Usually, we pass bookingId in extraData or part of orderId.
            
            // Example: updating payment in our system
            // await _bookingService.AddPaymentAsync(...);
            
            return Ok();
        }

        await Task.CompletedTask;
        return Ok(); // Always return 200 to MoMo unless there's a server error
    }
}
