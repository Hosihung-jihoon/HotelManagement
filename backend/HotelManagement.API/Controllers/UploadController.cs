using HotelManagement.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

/// <summary>
/// Upload ảnh lên Cloudinary thông qua backend (signed upload — an toàn hơn unsigned preset).
/// Frontend gửi multipart/form-data; backend trả về URL ảnh.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class UploadController : ControllerBase
{
    private readonly ICloudinaryService _cloudinary;

    public UploadController(ICloudinaryService cloudinary)
    {
        _cloudinary = cloudinary;
    }

    /// <summary>
    /// Upload 1 ảnh lên Cloudinary
    /// POST /api/Upload/image?folder=hotel/inventory
    /// Body: multipart/form-data với field "file"
    /// </summary>
    [HttpPost("image")]
    public async Task<IActionResult> UploadImage(IFormFile file, [FromQuery] string folder = "hotel")
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "Không có file được gửi lên." });

        var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp", "image/gif" };
        if (!allowedTypes.Contains(file.ContentType.ToLower()))
            return BadRequest(new { message = "Chỉ chấp nhận file ảnh (JPG, PNG, WEBP, GIF)." });

        if (file.Length > 5 * 1024 * 1024) // 5 MB
            return BadRequest(new { message = "File ảnh tối đa 5MB." });

        try
        {
            var url = await _cloudinary.UploadImageAsync(file);
            if (string.IsNullOrEmpty(url))
                return StatusCode(500, new { message = "Upload thất bại — Cloudinary không trả về URL." });

            return Ok(new { url });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi upload: " + ex.Message });
        }
    }
}
