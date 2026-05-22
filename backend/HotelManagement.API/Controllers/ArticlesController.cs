using HotelManagement.API.DTOs;
using HotelManagement.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ArticlesController : ControllerBase
{
    private readonly IArticleService _service;
    private readonly ICloudinaryService _cloudinaryService;

    public ArticlesController(IArticleService service, ICloudinaryService cloudinaryService)
    {
        _service = service;
        _cloudinaryService = cloudinaryService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ArticleDto>>> GetAll(
        [FromQuery] int? pageSize = null,
        [FromQuery] bool all = false)
    {
        IEnumerable<ArticleDto> result;

        if (all)
            result = await _service.GetAllAsync();
        else
            result = await _service.GetActiveAsync(pageSize);

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ArticleDetailDto>> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        if (result == null)
            return NotFound(new { message = $"Không tìm thấy bài viết với ID = {id}" });

        return Ok(result);
    }

    [HttpGet("slug/{slug}")]
    public async Task<ActionResult<ArticleDetailDto>> GetBySlug(string slug)
    {
        var result = await _service.GetBySlugAsync(slug);
        if (result == null)
            return NotFound(new { message = $"Không tìm thấy bài viết với slug = {slug}" });

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ArticleDto>> Create([FromBody] CreateArticleDto dto)
    {

        var result = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateArticleDto dto)
    {

        var success = await _service.UpdateAsync(id, dto);
        if (!success)
            return NotFound(new { message = $"Không tìm thấy bài viết với ID = {id}" });

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _service.DeleteAsync(id);
        if (!success)
            return NotFound(new { message = $"Không tìm thấy bài viết với ID = {id}" });

        return NoContent();
    }
}
