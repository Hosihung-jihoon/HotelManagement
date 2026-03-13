using HotelManagement.API.DTOs;
using HotelManagement.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

/// <summary>
/// Controller CRUD cho Rooms.
/// Luồng xử lý: Controller --> Service --> Repository --> DbContext --> Database
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class RoomsController : ControllerBase
{
    private readonly IRoomService _service;

    public RoomsController(IRoomService service)
    {
        _service = service;
    }

    /// <summary>
    /// Lấy danh sách tất cả phòng (kèm tên loại phòng)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<RoomDto>>> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Ok(result);
    }

    /// <summary>
    /// Lấy chi tiết 1 phòng theo ID (kèm thông tin loại phòng đầy đủ)
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<RoomDetailDto>> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        if (result == null)
            return NotFound(new { message = $"Không tìm thấy phòng với ID = {id}" });

        return Ok(result);
    }

    /// <summary>
    /// Tạo phòng mới
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<RoomDto>> Create([FromBody] CreateRoomDto dto)
    {
        var (result, error) = await _service.CreateAsync(dto);
        if (error != null)
            return Conflict(new { message = error });

        return CreatedAtAction(nameof(GetById), new { id = result!.Id }, result);
    }

    /// <summary>
    /// Cập nhật thông tin phòng
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateRoomDto dto)
    {
        var (success, error) = await _service.UpdateAsync(id, dto);

        if (error != null)
            return Conflict(new { message = error });

        if (!success)
            return NotFound(new { message = $"Không tìm thấy phòng với ID = {id}" });

        return NoContent();
    }

    /// <summary>
    /// Xóa phòng
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _service.DeleteAsync(id);
        if (!success)
            return NotFound(new { message = $"Không tìm thấy phòng với ID = {id}" });

        return NoContent();
    }
}
