using HotelManagement.API.DTOs;
using HotelManagement.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoomInventoriesController : ControllerBase
{
    private readonly IRoomInventoryService _service;

    public RoomInventoriesController(IRoomInventoryService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RoomInventoryDto>>> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<RoomInventoryDto>> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        if (result == null)
            return NotFound(new { message = $"Không tìm thấy vật tư phòng với ID = {id}" });

        return Ok(result);
    }

    [HttpGet("room/{roomId}")]
    public async Task<ActionResult<IEnumerable<RoomInventoryDto>>> GetByRoomId(int roomId)
    {
        var result = await _service.GetByRoomIdAsync(roomId);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<RoomInventoryDto>> Create([FromBody] CreateRoomInventoryDto dto)
    {
        var result = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateRoomInventoryDto dto)
    {
        var success = await _service.UpdateAsync(id, dto);
        if (!success)
            return NotFound(new { message = $"Không tìm thấy vật tư phòng với ID = {id}" });

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _service.DeleteAsync(id);
        if (!success)
            return NotFound(new { message = $"Không tìm thấy vật tư phòng với ID = {id}" });

        return NoContent();
    }

    [HttpPost("clone")]
    public async Task<IActionResult> CloneFromTemplate([FromQuery] int fromRoomId, [FromQuery] int toRoomId)
    {
        if (fromRoomId == toRoomId)
        {
            return BadRequest(new { message = "Phòng nguồn và phòng đích không thể giống nhau." });
        }

        var success = await _service.CloneAsync(fromRoomId, toRoomId);
        if (!success)
            return NotFound(new { message = $"Không tìm thấy vật tư nào trong phòng nguồn ID = {fromRoomId} để clone." });

        return Ok(new { message = "Clone vật tư thành công." });
    }
}
