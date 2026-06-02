using HotelManagement.API.DTOs;
using HotelManagement.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VouchersController : ControllerBase
{
    private readonly IVoucherService _service;

    public VouchersController(IVoucherService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<VoucherDto>>> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<VoucherDto>> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        if (result == null)
            return NotFound(new { message = $"Khong tim thay voucher voi ID = {id}" });

        return Ok(result);
    }

    [HttpPost("validate")]
    public async Task<ActionResult<ValidatedVoucherDto>> Validate([FromBody] ValidateVoucherRequestDto dto)
    {
        var result = await _service.ValidateAsync(dto.Code);
        if (result == null)
            return BadRequest(new { message = "Voucher khong hop le hoac da het han." });

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<VoucherDto>> Create([FromBody] CreateVoucherDto dto)
    {
        var result = await _service.CreateAsync(dto);
        if (result == null)
            return BadRequest(new { message = $"Voucher code '{dto.Code}' da ton tai" });

        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateVoucherDto dto)
    {
        var success = await _service.UpdateAsync(id, dto);
        if (!success)
            return NotFound(new { message = $"Khong tim thay voucher voi ID = {id}" });

        return NoContent();
    }

    [HttpPatch("{id}/toggle")]
    public async Task<IActionResult> ToggleActive(int id)
    {
        var success = await _service.ToggleActiveAsync(id);
        if (!success)
            return NotFound(new { message = $"Khong tim thay voucher voi ID = {id}" });

        return Ok(new { message = "Da thay doi trang thai voucher" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _service.DeleteAsync(id);
        if (!success)
            return NotFound(new { message = $"Khong tim thay voucher voi ID = {id}" });

        return NoContent();
    }

    [HttpPost("validate")]
    public async Task<IActionResult> Validate([FromBody] ValidateVoucherRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Code))
            return BadRequest(new { message = "Mã voucher không được để trống." });

        var result = await _service.ValidateVoucherAsync(req.Code);
        if (result == null)
            return BadRequest(new { message = "Mã voucher không hợp lệ hoặc đã hết hạn." });

        return Ok(result);
    }
}

public class ValidateVoucherRequest
{
    public string Code { get; set; } = string.Empty;
}
