using HotelManagement.API.DTOs;
using HotelManagement.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers
{
    /// <summary>
    /// API quản lý hóa đơn (Invoices)
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class InvoicesController : ControllerBase
    {
        private readonly IInvoiceService _service;

        public InvoicesController(IInvoiceService service)
        {
            _service = service;
        }

        // ========== CRUD cơ bản ==========

        /// <summary>
        /// Lấy tất cả hóa đơn
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<InvoiceDto>>> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        /// <summary>
        /// Lấy hóa đơn theo ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<InvoiceDetailDto>> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result == null)
                return NotFound(new { message = $"Không tìm thấy hóa đơn với ID = {id}" });

            return Ok(result);
        }

        /// <summary>
        /// Tạo hóa đơn thủ công
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<InvoiceDto>> Create([FromBody] CreateInvoiceDto dto)
        {
            try
            {
                var result = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Cập nhật hóa đơn
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateInvoiceDto dto)
        {
            try
            {
                var success = await _service.UpdateAsync(id, dto);
                if (!success)
                    return NotFound(new { message = $"Không tìm thấy hóa đơn với ID = {id}" });

                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Xóa hóa đơn
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _service.DeleteAsync(id);
            if (!success)
                return NotFound(new { message = $"Không tìm thấy hóa đơn với ID = {id}" });

            return NoContent();
        }

        // ========== GOM HÓA ĐƠN + PDF ==========

        /// <summary>
        /// Preview bill — tự động gom tiền phòng + dịch vụ + phạt, 
        /// tính giảm giá voucher + thuế VAT. Không lưu vào DB.
        /// </summary>
        [HttpGet("get-bill/{bookingId}")]
        public async Task<ActionResult<BillDto>> GetBill(int bookingId)
        {
            try
            {
                var bill = await _service.GetBillAsync(bookingId);
                return Ok(bill);
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Gom bill + lưu/cập nhật Invoice trong DB.
        /// Trả về BillDto kèm InvoiceId đã lưu.
        /// </summary>
        [HttpPost("generate-bill/{bookingId}")]
        public async Task<ActionResult<BillDto>> GenerateBill(int bookingId)
        {
            try
            {
                var bill = await _service.GenerateBillAsync(bookingId);
                return Ok(bill);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Xuất hóa đơn PDF theo InvoiceId.
        /// Trả về file PDF để download.
        /// </summary>
        [HttpGet("{id}/pdf")]
        public async Task<IActionResult> ExportPdf(int id)
        {
            try
            {
                var pdfBytes = await _service.ExportPdfAsync(id);
                return File(pdfBytes, "application/pdf", $"Invoice_{id}.pdf");
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}
