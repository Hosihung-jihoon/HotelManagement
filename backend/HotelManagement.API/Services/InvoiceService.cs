using HotelManagement.API.DTOs;
using HotelManagement.API.Models;
using HotelManagement.API.Repositories;

namespace HotelManagement.API.Services;

/// <summary>
/// Invoice Service - Chứa business logic + mapping Entity ↔ DTO.
/// </summary>
public class InvoiceService : IInvoiceService
{
    private readonly IInvoiceRepository _repository;

    public InvoiceService(IInvoiceRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<InvoiceDto>> GetAllAsync()
    {
        var invoices = await _repository.GetAllWithBookingAsync();

        return invoices.Select(i => new InvoiceDto
        {
            Id = i.Id,
            BookingId = i.BookingId,
            TotalRoomAmount = i.TotalRoomAmount,
            TotalServiceAmount = i.TotalServiceAmount,
            DiscountAmount = i.DiscountAmount,
            TaxAmount = i.TaxAmount,
            FinalTotal = i.FinalTotal,
            Status = i.Status
        });
    }

    public async Task<InvoiceDetailDto?> GetByIdAsync(int id)
    {
        var invoice = await _repository.GetByIdWithPaymentsAsync(id);
        if (invoice == null) return null;

        return new InvoiceDetailDto
        {
            Id = invoice.Id,
            BookingId = invoice.BookingId,
            TotalRoomAmount = invoice.TotalRoomAmount,
            TotalServiceAmount = invoice.TotalServiceAmount,
            DiscountAmount = invoice.DiscountAmount,
            TaxAmount = invoice.TaxAmount,
            FinalTotal = invoice.FinalTotal,
            Status = invoice.Status,
            Payments = invoice.Payments.Select(p => new PaymentDto
            {
                Id = p.Id,
                InvoiceId = p.InvoiceId,
                PaymentMethod = p.PaymentMethod,
                AmountPaid = p.AmountPaid,
                TransactionCode = p.TransactionCode,
                PaymentDate = p.PaymentDate
            }).ToList()
        };
    }

    public async Task<InvoiceDto> CreateAsync(CreateInvoiceDto dto)
    {
        var entity = new Invoice
        {
            BookingId = dto.BookingId,
            TotalRoomAmount = dto.TotalRoomAmount,
            TotalServiceAmount = dto.TotalServiceAmount,
            DiscountAmount = dto.DiscountAmount,
            TaxAmount = dto.TaxAmount,
            FinalTotal = dto.FinalTotal,
            Status = dto.Status ?? "Unpaid"
        };

        var created = await _repository.CreateAsync(entity);

        return new InvoiceDto
        {
            Id = created.Id,
            BookingId = created.BookingId,
            TotalRoomAmount = created.TotalRoomAmount,
            TotalServiceAmount = created.TotalServiceAmount,
            DiscountAmount = created.DiscountAmount,
            TaxAmount = created.TaxAmount,
            FinalTotal = created.FinalTotal,
            Status = created.Status
        };
    }

    public async Task<bool> UpdateAsync(int id, UpdateInvoiceDto dto)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null) return false;

        entity.BookingId = dto.BookingId;
        entity.TotalRoomAmount = dto.TotalRoomAmount;
        entity.TotalServiceAmount = dto.TotalServiceAmount;
        entity.DiscountAmount = dto.DiscountAmount;
        entity.TaxAmount = dto.TaxAmount;
        entity.FinalTotal = dto.FinalTotal;
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
