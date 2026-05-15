using HotelManagement.API.DTOs;
using HotelManagement.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HotelBranchesController : ControllerBase
{
    private readonly HotelBranchService _service;

    public HotelBranchesController(HotelBranchService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<HotelBranchDto>>> GetAll()
        => Ok(await _service.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<ActionResult<HotelBranchDto>> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<HotelBranchDto>> Create([FromBody] CreateHotelBranchDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateHotelBranchDto dto)
    {
        var success = await _service.UpdateAsync(id, dto);
        return success ? NoContent() : NotFound();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _service.DeleteAsync(id);
        return success ? NoContent() : NotFound();
    }

    /// <summary>
    /// Tính lại khoảng cách Haversine từ tất cả địa điểm đến từng chi nhánh.
    /// Cập nhật field DistanceKm = khoảng cách đến chi nhánh gần nhất.
    /// </summary>
    [HttpPost("recalc-distances")]
    public async Task<ActionResult<IEnumerable<AttractionDistanceDto>>> RecalcDistances()
        => Ok(await _service.RecalcAllDistancesAsync());
}
