using HotelManagement.API.DTOs;
using HotelManagement.API.Models;
using HotelManagement.API.Repositories;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Services;

/// <summary>
/// Payment Service - Chứa business logic + mapping Entity ↔ DTO.
/// </summary>
public class PaymentService : IPaymentService
{
    private readonly IPaymentRepository _repository;

    public PaymentService(IPaymentRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<PaymentDto>> GetAllAsync()
    {
        var payments = await _repository.GetAllAsync();

        return payments.Select(p => new PaymentDto
        {
            Id = p.Id,
            InvoiceId = p.InvoiceId,
            PaymentMethod = p.PaymentMethod,
            AmountPaid = p.AmountPaid,
            TransactionCode = p.TransactionCode,
            PaymentDate = p.PaymentDate
        });
    }

    public async Task<PaymentDto?> GetByIdAsync(int id)
    {
        var payment = await _repository.GetByIdAsync(id);
        if (payment == null) return null;

        return new PaymentDto
        {
            Id = payment.Id,
            InvoiceId = payment.InvoiceId,
            PaymentMethod = payment.PaymentMethod,
            AmountPaid = payment.AmountPaid,
            TransactionCode = payment.TransactionCode,
            PaymentDate = payment.PaymentDate
        };
    }

    public async Task<IEnumerable<PaymentDto>> GetByInvoiceIdAsync(int invoiceId)
    {
        var payments = await _repository.GetByInvoiceIdAsync(invoiceId);

        return payments.Select(p => new PaymentDto
        {
            Id = p.Id,
            InvoiceId = p.InvoiceId,
            PaymentMethod = p.PaymentMethod,
            AmountPaid = p.AmountPaid,
            TransactionCode = p.TransactionCode,
            PaymentDate = p.PaymentDate
        });
    }

    public async Task<PaymentDto> CreateAsync(CreatePaymentDto dto)
    {
        var entity = new Payment
        {
            InvoiceId = dto.InvoiceId,
            PaymentMethod = dto.PaymentMethod,
            AmountPaid = dto.AmountPaid,
            TransactionCode = dto.TransactionCode,
            PaymentDate = dto.PaymentDate ?? DateTime.Now
        };

        Payment created;
        try
        {
            created = await _repository.CreateAsync(entity);
        }
        catch (DbUpdateException ex)
        {
            throw new ArgumentException("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại InvoiceId nhận được từ request.", ex);
        }

        return new PaymentDto
        {
            Id = created.Id,
            InvoiceId = created.InvoiceId,
            PaymentMethod = created.PaymentMethod,
            AmountPaid = created.AmountPaid,
            TransactionCode = created.TransactionCode,
            PaymentDate = created.PaymentDate
        };
    }

    public async Task<bool> UpdateAsync(int id, UpdatePaymentDto dto)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null) return false;

        entity.InvoiceId = dto.InvoiceId;
        entity.PaymentMethod = dto.PaymentMethod;
        entity.AmountPaid = dto.AmountPaid;
        entity.TransactionCode = dto.TransactionCode;
        entity.PaymentDate = dto.PaymentDate;

        try
        {
            await _repository.UpdateAsync(entity);
        }
        catch (DbUpdateException ex)
        {
            throw new ArgumentException("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại InvoiceId nhận được từ request.", ex);
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
