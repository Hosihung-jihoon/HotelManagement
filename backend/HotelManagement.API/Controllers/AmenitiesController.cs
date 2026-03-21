using HotelManagement.API.DTOs;
using HotelManagement.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

/// <summary>
/// Controller CRUD cho Amenities (tiện nghi).
/// Luồng xử lý: Controller --> Service --> Repository --> DbContext --> Database
/// API xóa sử dụng cơ chế Soft Delete (IsDeleted = true).
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AmenitiesController : ControllerBase
{
    private readonly IAmenityService _service;

    public AmenitiesController(IAmenityService service)
    {
        _service = service;
    }

    /// <summary>
    /// Lấy danh sách tất cả tiện nghi
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AmenityDto>>> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Ok(result);
    }

    /// <summary>
    /// Lấy chi tiết tiện nghi theo ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<AmenityDto>> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        if (result == null)
            return NotFound(new { message = $"Không tìm thấy tiện nghi với ID = {id}" });

        return Ok(result);
    }

    /// <summary>
    /// Tạo mới tiện nghi
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<AmenityDto>> Create([FromBody] CreateAmenityDto dto)
    {
        var result = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>
    /// Cập nhật tiện nghi
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateAmenityDto dto)
    {
        var success = await _service.UpdateAsync(id, dto);
        if (!success)
            return NotFound(new { message = $"Không tìm thấy tiện nghi với ID = {id}" });

        return NoContent();
    }

    /// <summary>
    /// Xóa mềm tiện nghi (Soft Delete - IsDeleted = true)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _service.DeleteAsync(id);
        if (!success)
            return NotFound(new { message = $"Không tìm thấy tiện nghi với ID = {id}" });

        return NoContent();
    }
}
