using HotelManagement.API.DTOs;
using HotelManagement.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

/// <summary>
/// Controller CRUD cho ServiceCategories (phân loại dịch vụ).
/// Luồng xử lý: Controller --> Service --> Repository --> DbContext --> Database
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ServiceCategoriesController : ControllerBase
{
    private readonly IServiceCategoryService _service;

    public ServiceCategoriesController(IServiceCategoryService service)
    {
        _service = service;
    }

    /// <summary>
    /// Lấy danh sách tất cả phân loại dịch vụ
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ServiceCategoryDto>>> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Ok(result);
    }

    /// <summary>
    /// Lấy chi tiết phân loại dịch vụ theo ID (kèm danh sách dịch vụ)
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ServiceCategoryDetailDto>> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        if (result == null)
            return NotFound(new { message = $"Không tìm thấy phân loại dịch vụ với ID = {id}" });

        return Ok(result);
    }

    /// <summary>
    /// Tạo mới phân loại dịch vụ
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ServiceCategoryDto>> Create([FromBody] CreateServiceCategoryDto dto)
    {
        var result = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>
    /// Cập nhật phân loại dịch vụ
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateServiceCategoryDto dto)
    {
        var success = await _service.UpdateAsync(id, dto);
        if (!success)
            return NotFound(new { message = $"Không tìm thấy phân loại dịch vụ với ID = {id}" });

        return NoContent();
    }

    /// <summary>
    /// Xóa phân loại dịch vụ
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _service.DeleteAsync(id);
        if (!success)
            return NotFound(new { message = $"Không tìm thấy phân loại dịch vụ với ID = {id}" });

        return NoContent();
    }
}
