using HotelManagement.API.DTOs;
using HotelManagement.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

/// <summary>
/// Controller CRUD cho Loss_And_Damages (thất thoát & đền bù).
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class LossAndDamagesController : ControllerBase
{
    private readonly ILossAndDamageService _service;

    public LossAndDamagesController(ILossAndDamageService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<LossAndDamageDto>>> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<LossAndDamageDto>> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        if (result == null)
            return NotFound(new { message = $"Không tìm thấy báo cáo với ID = {id}" });
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<LossAndDamageDto>> Create([FromBody] CreateLossAndDamageDto dto)
    {
        var result = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateLossAndDamageDto dto)
    {
        var success = await _service.UpdateAsync(id, dto);
        if (!success)
            return NotFound(new { message = $"Không tìm thấy báo cáo với ID = {id}" });
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _service.DeleteAsync(id);
        if (!success)
            return NotFound(new { message = $"Không tìm thấy báo cáo với ID = {id}" });
        return NoContent();
    }
}
