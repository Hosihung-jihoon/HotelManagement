using HotelManagement.API.DTOs;
using HotelManagement.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

/// <summary>
/// Controller CRUD cho Payments (Thanh toán)
/// Luồng xử lý:  Controller --> Service --> Repository --> DbContext --> Database
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _service;

    public PaymentsController(IPaymentService service)
    {
        _service = service;
    }

    /// <summary>
    /// Lấy danh sách tất cả thanh toán
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PaymentDto>>> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Ok(result);
    }

    /// <summary>
    /// Lấy chi tiết thanh toán theo ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<PaymentDto>> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        if (result == null)
            return NotFound(new { message = $"Không tìm thấy thanh toán với ID = {id}" });

        return Ok(result);
    }

    /// <summary>
    /// Lấy danh sách thanh toán theo Invoice ID
    /// </summary>
    [HttpGet("invoice/{invoiceId}")]
    public async Task<ActionResult<IEnumerable<PaymentDto>>> GetByInvoiceId(int invoiceId)
    {
        var result = await _service.GetByInvoiceIdAsync(invoiceId);
        return Ok(result);
    }

    /// <summary>
    /// Tạo mới thanh toán
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<PaymentDto>> Create([FromBody] CreatePaymentDto dto)
    {
        var result = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>
    /// Cập nhật thanh toán
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdatePaymentDto dto)
    {
        var success = await _service.UpdateAsync(id, dto);
        if (!success)
            return NotFound(new { message = $"Không tìm thấy thanh toán với ID = {id}" });

        return NoContent();
    }

    /// <summary>
    /// Xóa thanh toán
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _service.DeleteAsync(id);
        if (!success)
            return NotFound(new { message = $"Không tìm thấy thanh toán với ID = {id}" });

        return NoContent();
    }
}
