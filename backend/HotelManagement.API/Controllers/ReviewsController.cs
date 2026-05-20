using HotelManagement.API.DTOs;
using HotelManagement.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _service;

    public ReviewsController(IReviewService service)
    {
        _service = service;
    }

    [Authorize]
    [HttpGet("my-reviews")]
    public async Task<ActionResult<IEnumerable<ReviewDto>>> GetMyReviews()
    {
        var result = await _service.GetByUserAsync(GetCurrentUserId());
        return Ok(result);
    }

    [HttpGet("room/{roomId}")]
    public async Task<ActionResult<IEnumerable<ReviewDto>>> GetByRoom(int roomId)
    {
        var result = await _service.GetByRoomAsync(roomId);
        return Ok(result);
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<ReviewDto>> Create([FromBody] CreateReviewDto dto)
    {
        try
        {
            var review = await _service.CreateAsync(GetCurrentUserId(), dto);
            return Ok(review);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst("userId")?.Value;
        return int.Parse(userIdClaim!);
    }
}
