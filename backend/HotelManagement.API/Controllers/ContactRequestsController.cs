using HotelManagement.API.DTOs;
using HotelManagement.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContactRequestsController : ControllerBase
{
    private readonly IContactRequestService _service;

    public ContactRequestsController(IContactRequestService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<ActionResult<ContactRequestDto>> Create([FromBody] CreateContactRequestDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return Ok(created);
    }
}
