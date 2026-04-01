using HotelManagement.API.Data;
using HotelManagement.API.DTOs;
using HotelManagement.API.Models;
using HotelManagement.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Controllers;

[ApiController]
[Route("api/payment")]
public class VnPayController : ControllerBase
{
    private readonly IVnPayService _vnPayService;
    private readonly HotelDbContext _context;

    public VnPayController(IVnPayService vnPayService, HotelDbContext context)
    {
        _vnPayService = vnPayService;
        _context = context;
    }

    [HttpPost("vnpay")]
    public IActionResult CreatePaymentUrl([FromBody] VnPayRequestDto model)
    {
        var url = _vnPayService.CreatePaymentUrl(HttpContext, model);
        return Ok(new VnPayResponseDto { PaymentUrl = url });
    }

    [HttpGet("vnpay-return")]
    public async Task<IActionResult> PaymentReturn()
    {
        var vnpayData = Request.Query;
        var isValid = _vnPayService.ValidateSignature(vnpayData);

        if (!isValid)
        {
            return BadRequest(new { Message = "Chữ ký không hợp lệ." });
        }

        var responseCode = vnpayData["vnp_ResponseCode"];
        var bookingIdStr = vnpayData["vnp_TxnRef"];
        var amountStr = vnpayData["vnp_Amount"];

        if (int.TryParse(bookingIdStr, out var bookingId))
        {
            var booking = await _context.Bookings.FindAsync(bookingId);
            if (booking != null)
            {
                if (responseCode == "00")
                {
                    booking.Status = "Paid";
                    
                    // Create payment record
                    if (decimal.TryParse(amountStr, out var amount))
                    {
                        var payment = new Payment
                        {
                            PaymentMethod = "VNPay",
                            AmountPaid = amount / 100, // VNPay amount is x100
                            TransactionCode = vnpayData["vnp_TransactionNo"],
                            PaymentDate = DateTime.Now
                        };
                        _context.Payments.Add(payment);
                    }
                }
                else
                {
                    booking.Status = "Failed";
                }
                await _context.SaveChangesAsync();
            }
        }

        // Return a JSON response so the React frontend can read it or just return OK.
        // Usually frontend directly reads URL query string.
        return Ok(new
        {
            Success = responseCode == "00",
            ResponseCode = responseCode,
            BookingId = bookingIdStr
        });
    }
}
