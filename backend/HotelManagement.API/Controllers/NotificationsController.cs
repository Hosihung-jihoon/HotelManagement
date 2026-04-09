using HotelManagement.API.DTOs;
using HotelManagement.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

/// <summary>
/// Controller CRUD cho Notifications (thông báo).
/// Luồng xử lý: Controller --> Service --> Repository --> DbContext --> Database
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _service;

    public NotificationsController(INotificationService service)
    {
        _service = service;
    }

    /// <summary>
    /// Lấy danh sách tất cả thông báo (mới nhất trước)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<NotificationDto>>> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Ok(result);
    }

    /// <summary>
    /// Lấy chi tiết thông báo theo ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<NotificationDto>> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        if (result == null)
            return NotFound(new { message = $"Không tìm thấy thông báo với ID = {id}" });

        return Ok(result);
    }

    /// <summary>
    /// Lấy danh sách thông báo theo User ID (bao gồm broadcast)
    /// </summary>
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<NotificationDto>>> GetByUserId(int userId)
    {
        var result = await _service.GetByUserIdAsync(userId);
        return Ok(result);
    }

    /// <summary>
    /// Tạo mới thông báo
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<NotificationDto>> Create([FromBody] CreateNotificationDto dto)
    {
        var result = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>
    /// Đánh dấu đã đọc / chưa đọc
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> MarkAsRead(int id, [FromBody] UpdateNotificationDto dto)
    {
        var success = await _service.MarkAsReadAsync(id, dto);
        if (!success)
            return NotFound(new { message = $"Không tìm thấy thông báo với ID = {id}" });

        return NoContent();
    }

    /// <summary>
    /// Xóa thông báo
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _service.DeleteAsync(id);
        if (!success)
            return NotFound(new { message = $"Không tìm thấy thông báo với ID = {id}" });

        return NoContent();
    }
}
