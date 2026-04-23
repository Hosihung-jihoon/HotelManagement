using HotelManagement.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

/// <summary>
/// Controller xử lý quên mật khẩu — gửi OTP email và reset password.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class PasswordResetController : ControllerBase
{
    private readonly IPasswordResetService _service;

    public PasswordResetController(IPasswordResetService service)
    {
        _service = service;
    }

    /// <summary>
    /// Bước 1: Gửi mã OTP về email.
    /// POST /api/PasswordReset/send-code
    /// Body: { "email": "user@example.com" }
    /// </summary>
    [HttpPost("send-code")]
    public async Task<IActionResult> SendCode([FromBody] SendResetCodeRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Email))
            return BadRequest(new { message = "Email không được để trống." });

        try
        {
            await _service.SendResetCodeAsync(req.Email);
            return Ok(new { message = "Mã xác nhận đã được gửi đến email của bạn." });
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Không thể gửi email. Vui lòng kiểm tra cấu hình SMTP trong appsettings." });
        }
    }

    /// <summary>
    /// Bước 2: Xác minh OTP.
    /// POST /api/PasswordReset/verify-code
    /// Body: { "email": "...", "code": "123456" }
    /// </summary>
    [HttpPost("verify-code")]
    public async Task<IActionResult> VerifyCode([FromBody] VerifyResetCodeRequest req)
    {
        var valid = await _service.VerifyCodeAsync(req.Email, req.Code);
        if (!valid)
            return BadRequest(new { message = "Mã xác nhận không đúng hoặc đã hết hạn." });

        return Ok(new { message = "Mã xác nhận hợp lệ." });
    }

    /// <summary>
    /// Bước 3: Đổi mật khẩu mới.
    /// POST /api/PasswordReset/reset-password
    /// Body: { "email": "...", "code": "123456", "newPassword": "..." }
    /// </summary>
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest req)
    {
        if (req.NewPassword.Length < 6)
            return BadRequest(new { message = "Mật khẩu mới phải có ít nhất 6 ký tự." });

        var success = await _service.ResetPasswordAsync(req.Email, req.Code, req.NewPassword);
        if (!success)
            return BadRequest(new { message = "Mã xác nhận không đúng hoặc đã hết hạn." });

        return Ok(new { message = "Đổi mật khẩu thành công! Vui lòng đăng nhập lại." });
    }
}

// DTO records
public record SendResetCodeRequest(string Email);
public record VerifyResetCodeRequest(string Email, string Code);
public record ResetPasswordRequest(string Email, string Code, string NewPassword);
