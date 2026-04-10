using System.Net;
using System.Net.Mail;
using HotelManagement.API.Data;
using HotelManagement.API.DTOs;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace HotelManagement.API.Services;

public interface IPasswordResetService
{
    /// <summary>Gửi mã OTP 6 chữ số về email. Trả lỗi nếu email không tồn tại.</summary>
    Task SendResetCodeAsync(string email);

    /// <summary>Kiểm tra mã OTP khớp và chưa hết hạn (15 phút).</summary>
    Task<bool> VerifyCodeAsync(string email, string code);

    /// <summary>Reset mật khẩu sau khi đã verify code thành công.</summary>
    Task<bool> ResetPasswordAsync(string email, string code, string newPassword);
}

public class PasswordResetService : IPasswordResetService
{
    private readonly HotelDbContext _db;
    private readonly IConfiguration _config;

    // Key: email | Value: (code, expiry)
    // Dùng in-memory cho đơn giản (đủ tốt cho internal system)
    private static readonly Dictionary<string, (string Code, DateTime Expiry)> _store = new();

    public PasswordResetService(HotelDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    public async Task SendResetCodeAsync(string email)
    {
        // Kiểm tra email có tồn tại không
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
            throw new ArgumentException("Email không tồn tại trong hệ thống.");

        // Sinh mã OTP 6 số
        var code = Random.Shared.Next(100000, 999999).ToString();
        var expiry = DateTime.Now.AddMinutes(15);

        // Lưu vào memory (ghi đè nếu đã tồn tại)
        lock (_store) { _store[email] = (code, expiry); }

        // Gửi email
        await SendEmailAsync(email, user.FullName, code);
    }

    public Task<bool> VerifyCodeAsync(string email, string code)
    {
        lock (_store)
        {
            if (!_store.TryGetValue(email, out var entry)) return Task.FromResult(false);
            if (entry.Expiry < DateTime.Now) { _store.Remove(email); return Task.FromResult(false); }
            return Task.FromResult(entry.Code == code.Trim());
        }
    }

    public async Task<bool> ResetPasswordAsync(string email, string code, string newPassword)
    {
        if (!await VerifyCodeAsync(email, code)) return false;

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null) return false;

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword, workFactor: 11);
        await _db.SaveChangesAsync();

        // Xóa code đã dùng
        lock (_store) { _store.Remove(email); }
        return true;
    }

    private async Task SendEmailAsync(string toEmail, string toName, string code)
    {
        var smtp = _config.GetSection("SmtpSettings");
        var host    = smtp["Host"] ?? "smtp.gmail.com";
        var port    = int.Parse(smtp["Port"] ?? "587");
        var ssl     = bool.Parse(smtp["EnableSsl"] ?? "true");
        var from    = smtp["SenderEmail"] ?? "";
        var fromName = smtp["SenderName"] ?? "Hotel System";
        var pass    = smtp["Password"] ?? "";

        using var client = new SmtpClient(host, port)
        {
            EnableSsl   = ssl,
            Credentials = new NetworkCredential(from, pass),
        };

        var body = $"""
            <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px;">
              <h2 style="color:#1e40af;margin-bottom:8px;">🏨 Khôi phục mật khẩu</h2>
              <p style="color:#374151;">Xin chào <strong>{toName}</strong>,</p>
              <p style="color:#374151;">Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
              <p style="color:#374151;">Mã xác nhận của bạn là:</p>
              <div style="background:#eff6ff;border:2px dashed #2563eb;border-radius:10px;padding:20px;text-align:center;margin:20px 0;">
                <span style="font-size:40px;font-weight:800;letter-spacing:8px;color:#1d4ed8;">{code}</span>
              </div>
              <p style="color:#6b7280;font-size:13px;">⏱ Mã này có hiệu lực trong <strong>15 phút</strong>. Không chia sẻ mã này với bất kỳ ai.</p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />
              <p style="color:#9ca3af;font-size:12px;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
            </div>
            """;

        var mail = new MailMessage
        {
            From       = new MailAddress(from, fromName),
            Subject    = $"[Hotel] Mã xác nhận đặt lại mật khẩu: {code}",
            Body       = body,
            IsBodyHtml = true,
        };
        mail.To.Add(new MailAddress(toEmail, toName));

        await client.SendMailAsync(mail);
    }
}
