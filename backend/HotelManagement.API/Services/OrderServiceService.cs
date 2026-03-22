using HotelManagement.API.Data;
using HotelManagement.API.DTOs;
using HotelManagement.API.Models;
using HotelManagement.API.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Services;

public class OrderServiceService : IOrderServiceService
{
    private readonly IOrderServiceRepository _repository;
    private readonly HotelDbContext _context;

    public OrderServiceService(IOrderServiceRepository repository, HotelDbContext context)
    {
        _repository = repository;
        _context = context;
    }

    public async Task<OrderServiceDto> CreateAsync(CreateOrderServiceDto dto)
    {
        // Kiểm tra xem BookingDetailId có tồn tại không
        var bookingDetailExists = await _context.BookingDetails.AnyAsync(b => b.Id == dto.BookingDetailId);
        if (!bookingDetailExists)
            throw new ArgumentException("BookingDetail không tồn tại.");

        var serviceIds = dto.ServiceDetails.Select(sd => sd.ServiceId).ToList();
        var services = await _context.Services.Where(s => serviceIds.Contains(s.Id)).ToListAsync();

        if (services.Count != serviceIds.Distinct().Count())
            throw new ArgumentException("Một trong các dịch vụ không hợp lệ hoặc không tồn tại.");

        var entity = new OrderService
        {
            BookingDetailId = dto.BookingDetailId,
            OrderDate = DateTime.Now,
            Status = "Pending",
            OrderServiceDetails = new List<OrderServiceDetail>()
        };

        decimal totalAmount = 0;

        foreach (var reqDetail in dto.ServiceDetails)
        {
            var service = services.First(s => s.Id == reqDetail.ServiceId);
            var detailTotal = service.Price * reqDetail.Quantity;
            totalAmount += detailTotal;

            entity.OrderServiceDetails.Add(new OrderServiceDetail
            {
                ServiceId = reqDetail.ServiceId,
                Quantity = reqDetail.Quantity,
                UnitPrice = service.Price
            });
        }

        entity.TotalAmount = totalAmount;

        var created = await _repository.CreateWithDetailsAsync(entity);

        var resultDto = new OrderServiceDto
        {
            Id = created.Id,
            BookingDetailId = created.BookingDetailId,
            OrderDate = created.OrderDate,
            TotalAmount = created.TotalAmount,
            Status = created.Status,
            OrderServiceDetails = created.OrderServiceDetails.Select(d => new OrderServiceDetailDto
            {
                Id = d.Id,
                OrderServiceId = d.OrderServiceId,
                ServiceId = d.ServiceId,
                ServiceName = services.First(s => s.Id == d.ServiceId).ServiceName,
                Quantity = d.Quantity,
                UnitPrice = d.UnitPrice
            }).ToList()
        };

        return resultDto;
    }

    public async Task<IEnumerable<OrderServiceDto>> GetByBookingDetailIdAsync(int bookingDetailId)
    {
        var orders = await _context.OrderServices
            .Include(o => o.OrderServiceDetails)
             .ThenInclude(d => d.Service)
            .Where(o => o.BookingDetailId == bookingDetailId)
            .ToListAsync();

        return orders.Select(o => new OrderServiceDto
        {
            Id = o.Id,
            BookingDetailId = o.BookingDetailId,
            OrderDate = o.OrderDate,
            TotalAmount = o.TotalAmount,
            Status = o.Status,
            OrderServiceDetails = o.OrderServiceDetails.Select(d => new OrderServiceDetailDto
            {
                Id = d.Id,
                OrderServiceId = d.OrderServiceId,
                ServiceId = d.ServiceId,
                ServiceName = d.Service?.ServiceName,
                Quantity = d.Quantity,
                UnitPrice = d.UnitPrice
            }).ToList()
        });
    }

    public async Task<OrderServiceDto?> GetByIdAsync(int id)
    {
        var o = await _repository.GetByIdWithDetailsAsync(id);
        if (o == null) return null;

        return new OrderServiceDto
        {
            Id = o.Id,
            BookingDetailId = o.BookingDetailId,
            OrderDate = o.OrderDate,
            TotalAmount = o.TotalAmount,
            Status = o.Status,
            OrderServiceDetails = o.OrderServiceDetails.Select(d => new OrderServiceDetailDto
            {
                Id = d.Id,
                OrderServiceId = d.OrderServiceId,
                ServiceId = d.ServiceId,
                ServiceName = d.Service?.ServiceName,
                Quantity = d.Quantity,
                UnitPrice = d.UnitPrice
            }).ToList()
        };
    }
}
