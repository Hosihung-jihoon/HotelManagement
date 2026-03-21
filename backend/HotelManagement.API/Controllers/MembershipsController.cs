using HotelManagement.API.DTOs;
using HotelManagement.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

/// <summary>
/// Controller CRUD cho Memberships (hạng thành viên).
/// Luồng xử lý: Controller --> Service --> Repository --> DbContext --> Database
/// API xóa sử dụng cơ chế Soft Delete (IsDeleted = true).
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class MembershipsController : ControllerBase
{
    private readonly IMembershipService _service;

    public MembershipsController(IMembershipService service)
    {
        _service = service;
    }

    /// <summary>
    /// Lấy danh sách tất cả hạng thành viên
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MembershipDto>>> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Ok(result);
    }

    /// <summary>
    /// Lấy chi tiết hạng thành viên theo ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<MembershipDto>> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        if (result == null)
            return NotFound(new { message = $"Không tìm thấy hạng thành viên với ID = {id}" });

        return Ok(result);
    }

    /// <summary>
    /// Tạo mới hạng thành viên
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<MembershipDto>> Create([FromBody] CreateMembershipDto dto)
    {
        var result = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>
    /// Cập nhật hạng thành viên
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateMembershipDto dto)
    {
        var success = await _service.UpdateAsync(id, dto);
        if (!success)
            return NotFound(new { message = $"Không tìm thấy hạng thành viên với ID = {id}" });

        return NoContent();
    }

    /// <summary>
    /// Xóa mềm hạng thành viên (Soft Delete - IsDeleted = true)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _service.DeleteAsync(id);
        if (!success)
            return NotFound(new { message = $"Không tìm thấy hạng thành viên với ID = {id}" });

        return NoContent();
    }
}
