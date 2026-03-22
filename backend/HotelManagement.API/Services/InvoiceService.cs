using HotelManagement.API.DTOs;
using HotelManagement.API.Models;
using HotelManagement.API.Repositories;
using Microsoft.EntityFrameworkCore;

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

        Invoice created;
        try
        {
            created = await _repository.CreateAsync(entity);
        }
        catch (DbUpdateException ex)
        {
            throw new ArgumentException("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại BookingId nhận được từ request.", ex);
        }

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

        if (dto.BookingId.HasValue && dto.BookingId.Value > 0)
        {
            entity.BookingId = dto.BookingId.Value;
        }
        else if (dto.BookingId.HasValue && dto.BookingId.Value == 0)
        {
            // Do not override with 0. 0 is an invalid FK.
            // In a strict design, we could return a validation error.
        }
        // If it's explicitly set to null but DB requires it, we'd need more logic,
        // but since Invoice.BookingId is int?, setting it to null is valid if allowed.
        else if (dto.BookingId is null)
        {
            // If the DTO didn't include BookingId
            // Or if it was explicitly passed as null.
            // Leaving it alone for partial update. 
            // If full PUT is desired, we might overwrite, but given the DB exception it likely was 0 or invalid.
        }

        if (dto.TotalRoomAmount.HasValue) entity.TotalRoomAmount = dto.TotalRoomAmount;
        if (dto.TotalServiceAmount.HasValue) entity.TotalServiceAmount = dto.TotalServiceAmount;
        if (dto.DiscountAmount.HasValue) entity.DiscountAmount = dto.DiscountAmount;
        if (dto.TaxAmount.HasValue) entity.TaxAmount = dto.TaxAmount;
        if (dto.FinalTotal.HasValue) entity.FinalTotal = dto.FinalTotal;
        if (!string.IsNullOrEmpty(dto.Status)) entity.Status = dto.Status;

        try
        {
            await _repository.UpdateAsync(entity);
        }
        catch (DbUpdateException ex)
        {
            throw new ArgumentException("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại BookingId nhận được từ request.", ex);
        }
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        if (!await _repository.ExistsAsync(id)) return false;

        await _repository.DeleteAsync(id);
        return true;
    }
}
