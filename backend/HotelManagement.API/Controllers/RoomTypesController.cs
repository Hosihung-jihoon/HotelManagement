using HotelManagement.API.DTOs;
using HotelManagement.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

/// <summary>
/// Controller mẫu CRUD cho RoomTypes - Team copy cấu trúc này.
/// 
/// Luồng xử lý:  Controller --> Service --> Repository --> DbContext --> Database
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class RoomTypesController : ControllerBase
{
    private readonly IRoomTypeService _service;

    public RoomTypesController(IRoomTypeService service)
    {
        _service = service;
    }

    /// <summary>
    /// Lấy danh sách tất cả loại phòng
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<RoomTypeDto>>> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Ok(result);
    }

    /// <summary>
    /// Lấy chi tiết loại phòng theo ID (kèm ảnh + tiện nghi)
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<RoomTypeDetailDto>> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        if (result == null)
            return NotFound(new { message = $"Không tìm thấy loại phòng với ID = {id}" });

        return Ok(result);
    }

    /// <summary>
    /// Tạo mới loại phòng
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<RoomTypeDto>> Create([FromBody] CreateRoomTypeDto dto)
    {
        var result = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>
    /// Cập nhật loại phòng
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateRoomTypeDto dto)
    {
        var success = await _service.UpdateAsync(id, dto);
        if (!success)
            return NotFound(new { message = $"Không tìm thấy loại phòng với ID = {id}" });

        return NoContent();
    }

    /// <summary>
    /// Xóa loại phòng
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _service.DeleteAsync(id);
        if (!success)
            return NotFound(new { message = $"Không tìm thấy loại phòng với ID = {id}" });

        return NoContent();
    }
}
