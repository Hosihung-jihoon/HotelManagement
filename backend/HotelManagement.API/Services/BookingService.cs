using HotelManagement.API.DTOs;
using HotelManagement.API.Models;
using HotelManagement.API.Repositories;

namespace HotelManagement.API.Services;

public class BookingService : IBookingService
{
    private readonly IBookingRepository _repository;

    public BookingService(IBookingRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<BookingDto>> GetAllAsync()
    {
        var bookings = await _repository.GetAllAsync();
        return bookings.Select(b => new BookingDto
        {
            Id = b.Id,
            UserId = b.UserId,
            GuestName = b.GuestName,
            GuestPhone = b.GuestPhone,
            GuestEmail = b.GuestEmail,
            BookingCode = b.BookingCode,
            VoucherId = b.VoucherId,
            Status = b.Status
        });
    }

    public async Task<BookingDto?> GetByIdAsync(int id)
    {
        var booking = await _repository.GetByIdAsync(id);
        if (booking == null) return null;

        return new BookingDto
        {
            Id = booking.Id,
            UserId = booking.UserId,
            GuestName = booking.GuestName,
            GuestPhone = booking.GuestPhone,
            GuestEmail = booking.GuestEmail,
            BookingCode = booking.BookingCode,
            VoucherId = booking.VoucherId,
            Status = booking.Status
        };
    }

    public async Task<BookingDto> CreateAsync(CreateBookingDto dto)
    {
        string newBookingCode = "BKG" + DateTime.Now.ToString("yyyyMMddHHmmss");

        var entity = new Booking
        {
            UserId = dto.UserId,
            GuestName = dto.GuestName,
            GuestPhone = dto.GuestPhone,
            GuestEmail = dto.GuestEmail,
            VoucherId = dto.VoucherId,
            BookingCode = newBookingCode,
            Status = "Pending"
        };

        var created = await _repository.CreateAsync(entity);

        return new BookingDto
        {
            Id = created.Id,
            UserId = created.UserId,
            GuestName = created.GuestName,
            GuestPhone = created.GuestPhone,
            GuestEmail = created.GuestEmail,
            BookingCode = created.BookingCode,
            VoucherId = created.VoucherId,
            Status = created.Status
        };
    }

    public async Task<bool> UpdateAsync(int id, UpdateBookingDto dto)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null) return false;

        entity.GuestName = dto.GuestName;
        entity.GuestPhone = dto.GuestPhone;
        entity.GuestEmail = dto.GuestEmail;
        entity.Status = dto.Status;

        await _repository.UpdateAsync(entity);
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        if (!await _repository.ExistsAsync(id)) return false;

        await _repository.DeleteAsync(id);
        return true;
    }
}
