using HotelManagement.API.DTOs;
using HotelManagement.API.Models;
using HotelManagement.API.Repositories;

using HotelManagement.API.Data;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Services;

public class BookingService : IBookingService
{
    private readonly IBookingRepository _repository;
    private readonly HotelDbContext _context;

    public BookingService(IBookingRepository repository, HotelDbContext context)
    {
        _repository = repository;
        _context = context;
    }

    public async Task<IEnumerable<BookingDto>> GetAllAsync()
    {
        var bookings = await _repository.GetAllWithRoomsAsync();
        return bookings.Select(b => new BookingDto
        {
            Id = b.Id,
            UserId = b.UserId,
            GuestName = b.GuestName,
            GuestPhone = b.GuestPhone,
            GuestEmail = b.GuestEmail,
            BookingCode = b.BookingCode,
            VoucherId = b.VoucherId,
            Status = b.Status,
            RoomNumbers = b.BookingDetails.Where(d => d.Room != null).Select(d => d.Room!.RoomNumber).ToList()
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
            Status = booking.Status,
            CreatedAt = booking.CreatedAt
        };
    }

    public async Task<BookingFullDetailDto?> GetFullDetailAsync(int id)
    {
        var booking = await _repository.GetFullDetailAsync(id);
        if (booking == null) return null;

        // Invoice & payment sums
        var invoice = booking.Invoice;
        var totalRoomAmount = invoice?.TotalRoomAmount ?? 0m;
        var totalServiceAmount = invoice?.TotalServiceAmount ?? 0m;
        var discountAmount = invoice?.DiscountAmount ?? 0m;
        var finalTotal = invoice?.FinalTotal ?? 0m;
        var amountPaid = invoice?.Payments.Sum(p => p.AmountPaid) ?? 0m;

        // If no invoice yet, compute total from booking details manually
        if (invoice == null)
        {
            totalRoomAmount = booking.BookingDetails.Sum(bd =>
            {
                var nights = (bd.CheckOutDate - bd.CheckInDate).Days;
                return bd.PricePerNight * Math.Max(nights, 1);
            });
            finalTotal = totalRoomAmount;
        }

        // Audit logs for this booking record
        var auditLogs = await _repository.GetAuditLogsAsync(id);

        return new BookingFullDetailDto
        {
            Id = booking.Id,
            UserId = booking.UserId,
            BookedByName = booking.User?.FullName,
            GuestName = booking.GuestName,
            GuestPhone = booking.GuestPhone,
            GuestEmail = booking.GuestEmail,
            BookingCode = booking.BookingCode,
            VoucherId = booking.VoucherId,
            VoucherCode = booking.Voucher?.Code,
            Status = booking.Status,
            CreatedAt = booking.CreatedAt,
            TotalAmount = totalRoomAmount + totalServiceAmount,
            DiscountAmount = discountAmount,
            FinalTotal = finalTotal,
            AmountPaid = amountPaid,
            RemainingAmount = Math.Max(finalTotal - amountPaid, 0),
            DepositAmount = (totalRoomAmount + totalServiceAmount) * 0.3m,
            Details = booking.BookingDetails.Select(bd => new BookingDetailItemDto
            {
                Id = bd.Id,
                RoomId = bd.RoomId,
                RoomNumber = bd.Room?.RoomNumber,
                RoomTypeId = bd.RoomTypeId ?? bd.Room?.RoomTypeId,
                RoomTypeName = bd.RoomType?.Name ?? bd.Room?.RoomType?.Name,
                CheckInDate = bd.CheckInDate,
                CheckOutDate = bd.CheckOutDate,
                PricePerNight = bd.PricePerNight,
            }).ToList(),
            AuditLogs = auditLogs.Select(al => new BookingAuditLogDto
            {
                Id = al.Id,
                Action = al.Action,
                TableName = al.TableName,
                OldValue = al.OldValue,
                NewValue = al.NewValue,
                CreatedAt = al.CreatedAt,
                UserId = al.UserId,
                UserName = al.User?.FullName,
            }).ToList(),
        };
    }

    public async Task<BookingDto> CreateAsync(CreateBookingDto dto)
    {
        string newBookingCode = "BKG" + Guid.NewGuid().ToString("N").Substring(0, 6).ToUpper();

        // 1. Auto Create Account if User doesn't exist but Email/Phone is provided
        int? finalUserId = dto.UserId;
        if (finalUserId == null && (!string.IsNullOrEmpty(dto.GuestEmail) || !string.IsNullOrEmpty(dto.GuestPhone)))
        {
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == dto.GuestEmail || u.Phone == dto.GuestPhone);

            if (existingUser != null)
            {
                finalUserId = existingUser.Id;
            }
            else
            {
                var roleGuest = await _context.Roles.FirstOrDefaultAsync(r => r.Name.ToLower() == "guest") 
                                ?? await _context.Roles.FirstOrDefaultAsync();
                var tierNew = await _context.Memberships.FirstOrDefaultAsync(m => m.TierName.Contains("Khách mới"));
                
                var newUser = new User
                {
                    FullName = dto.GuestName,
                    Email = string.IsNullOrEmpty(dto.GuestEmail) ? $"guest-{Guid.NewGuid():N}@hotel.com" : dto.GuestEmail,
                    Phone = dto.GuestPhone,
                    PasswordHash = "DUMMY_AUTO_" + Guid.NewGuid().ToString(),
                    RoleId = roleGuest?.Id,
                    MembershipId = tierNew?.Id,
                    Status = true
                };
                
                _context.Users.Add(newUser);
                await _context.SaveChangesAsync();
                finalUserId = newUser.Id;
            }
        }

        var entity = new Booking
        {
            UserId = finalUserId,
            GuestName = dto.GuestName,
            GuestPhone = dto.GuestPhone,
            GuestEmail = dto.GuestEmail,
            VoucherId = dto.VoucherId,
            BookingCode = newBookingCode,
            Status = "Pending"
        };

        var created = await _repository.CreateAsync(entity);
        await _repository.AddAuditLogAsync(created.Id, "Tạo mới", null, $"Mã: {created.BookingCode}", dto.UserId);

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
        var entity = await _repository.GetFullDetailAsync(id); // Use full detail to get rooms
        if (entity == null) return false;

        string? oldStatus = entity.Status;

        // Xử lý ràng buộc Checkout trước khi gán và lưu DB
        if (oldStatus != dto.Status && dto.Status == "CheckedOut")
        {
            // Strict Checkout Constraint: Customer must pay fully
            decimal amountPaid = entity.Invoice?.Payments.Sum(p => p.AmountPaid) ?? 0m;
            decimal discountAmount = entity.Invoice?.DiscountAmount ?? 0m;
            decimal finalTotal = entity.Invoice?.FinalTotal ?? 0m;
            if (entity.Invoice == null) {
                decimal manualTotal = entity.BookingDetails.Sum(bd => {
                    var nights = (bd.CheckOutDate - bd.CheckInDate).Days;
                    return bd.PricePerNight * Math.Max(nights, 1);
                });
                finalTotal = manualTotal;
            }
            
            decimal remainingAmount = finalTotal - amountPaid;
            if (remainingAmount > 0)
            {
                throw new ArgumentException($"Không thể trả phòng. Khách còn nợ {remainingAmount:N0}đ.");
            }
        }

        entity.GuestName = dto.GuestName ?? entity.GuestName;
        entity.GuestPhone = dto.GuestPhone ?? entity.GuestPhone;
        entity.GuestEmail = dto.GuestEmail ?? entity.GuestEmail;
        entity.Status = dto.Status ?? entity.Status;

        await _repository.UpdateAsync(entity);

        if (oldStatus != dto.Status)
        {
            await _repository.AddAuditLogAsync(id, "Cập nhật trạng thái", oldStatus, dto.Status);

            // Handle Room Status Automation
            if (dto.Status == "CheckedIn")
            {
                foreach (var detail in entity.BookingDetails)
                {
                    if (detail.Room != null)
                    {
                        detail.Room.Status = "Occupied";
                    }
                }
                await _repository.UpdateAsync(entity); // Repository update will save rooms via context
                await _repository.AddAuditLogAsync(id, "Tự động hóa", null, "Cập nhật các phòng sang 'Đang có khách'");
            }
            else if (dto.Status == "CheckedOut")
            {
                foreach (var detail in entity.BookingDetails)
                {
                    if (detail.Room != null)
                    {
                        detail.Room.Status = "Cleaning";
                        detail.Room.CleanStatus = "dirty";
                    }
                }
                await _repository.UpdateAsync(entity);
                await _repository.AddAuditLogAsync(id, "Tự động hóa", null, "Cập nhật các phòng sang 'Đang dọn' & 'Cần dọn'");
            }
        }

        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        if (!await _repository.ExistsAsync(id)) return false;

        await _repository.DeleteAsync(id);
        return true;
    }

    public async Task<IEnumerable<RoomAvailabilityResponseDto>> SearchAvailableRoomsAsync(BookingSearchRequestDto request)
    {
        var availableRooms = await _repository.FindAvailableRoomsAsync(
            request.CheckInDate, 
            request.CheckOutDate, 
            request.CapacityAdults, 
            request.CapacityChildren);

        return availableRooms.Select(r => new RoomAvailabilityResponseDto
        {
            RoomId = r.Id,
            RoomNumber = r.RoomNumber,
            RoomTypeId = r.RoomType?.Id ?? 0,
            RoomTypeName = r.RoomType?.Name ?? string.Empty,
            PricePerNight = r.RoomType?.BasePrice ?? 0,
            CapacityAdults = r.RoomType?.CapacityAdults ?? 0,
            CapacityChildren = r.RoomType?.CapacityChildren ?? 0
        });
    }

    public async Task<BookingDto> CreateAdvancedAsync(CreateAdvancedBookingDto dto)
    {
        string newBookingCode = "BKG" + Guid.NewGuid().ToString("N").Substring(0, 6).ToUpper();

        // 1. Auto Create Account if User doesn't exist but Email/Phone is provided
        int? finalUserId = dto.UserId;
        if (finalUserId == null && (!string.IsNullOrEmpty(dto.GuestEmail) || !string.IsNullOrEmpty(dto.GuestPhone)))
        {
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == dto.GuestEmail || u.Phone == dto.GuestPhone);

            if (existingUser != null)
            {
                finalUserId = existingUser.Id;
            }
            else
            {
                var roleGuest = await _context.Roles.FirstOrDefaultAsync(r => r.Name.ToLower() == "guest") 
                                ?? await _context.Roles.FirstOrDefaultAsync();
                var tierNew = await _context.Memberships.FirstOrDefaultAsync(m => m.TierName.Contains("Khách mới"));
                
                var newUser = new User
                {
                    FullName = dto.GuestName,
                    Email = string.IsNullOrEmpty(dto.GuestEmail) ? $"guest-{Guid.NewGuid():N}@hotel.com" : dto.GuestEmail,
                    Phone = dto.GuestPhone,
                    PasswordHash = "DUMMY_AUTO_" + Guid.NewGuid().ToString(),
                    RoleId = roleGuest?.Id,
                    MembershipId = tierNew?.Id,
                    Status = true
                };
                
                _context.Users.Add(newUser);
                await _context.SaveChangesAsync();
                finalUserId = newUser.Id;
            }
        }

        // Check if pre-payment makes it confirmed (>= 30%)
        decimal totalRoomAmount = dto.Details.Sum(d => 
        {
            var nights = (d.CheckOutDate - d.CheckInDate).Days;
            return d.PricePerNight * Math.Max(nights, 1);
        });
        
        string initialStatus = (dto.PrePayment > 0 && dto.PrePayment >= totalRoomAmount * 0.3m) ? "Confirmed" : "Pending";

        var booking = new Booking
        {
            UserId = finalUserId,
            GuestName = dto.GuestName,
            GuestPhone = dto.GuestPhone,
            GuestEmail = dto.GuestEmail,
            VoucherId = dto.VoucherId,
            BookingCode = newBookingCode,
            Status = initialStatus
        };

        var details = dto.Details.Select(d => new BookingDetail
        {
            RoomId = d.RoomId,
            CheckInDate = d.CheckInDate,
            CheckOutDate = d.CheckOutDate,
            PricePerNight = d.PricePerNight
        }).ToList();

        var created = await _repository.CreateWithLockAsync(booking, details);

        // If prepayment exists, add it to invoice
        if (dto.PrePayment > 0)
        {
            await AddPaymentAsync(created.Id, new AddBookingPaymentDto
            {
                Amount = dto.PrePayment,
                PaymentMethod = dto.PaymentMethod ?? "Cash",
                TransactionCode = "DEPOSIT"
            });
        }

        await _repository.AddAuditLogAsync(created.Id, "Tạo mới (Nâng cao)", null, $"Mã: {created.BookingCode}, Trạng thái: {initialStatus}, Cọc: {dto.PrePayment}đ", dto.UserId);

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

    public async Task<bool> AddPaymentAsync(int bookingId, AddBookingPaymentDto dto)
    {
        var booking = await _repository.GetFullDetailAsync(bookingId);
        if (booking == null) return false;

        var invoice = booking.Invoice;
        if (invoice == null)
        {
            // Create invoice if it doesn't exist
            decimal totalRoomAmount = booking.BookingDetails.Sum(bd =>
            {
                var nights = (bd.CheckOutDate - bd.CheckInDate).Days;
                return bd.PricePerNight * Math.Max(nights, 1);
            });

            invoice = new Invoice
            {
                BookingId = bookingId,
                TotalRoomAmount = totalRoomAmount,
                FinalTotal = totalRoomAmount,
                Status = "Unpaid",
                CreatedAt = DateTime.UtcNow
            };
            booking.Invoice = invoice;
        }

        var payment = new Payment
        {
            Invoice = invoice,
            AmountPaid = dto.Amount,
            PaymentMethod = dto.PaymentMethod,
            TransactionCode = dto.TransactionCode,
            PaymentDate = dto.PaymentDate ?? DateTime.UtcNow
        };

        invoice.Payments.Add(payment);

        // Update invoice status
        var totalPaid = invoice.Payments.Sum(p => p.AmountPaid);
        if (totalPaid >= invoice.FinalTotal && invoice.FinalTotal > 0)
        {
            invoice.Status = "Paid";
        }
        else if (totalPaid > 0)
        {
            invoice.Status = "Partial";
        }

        await _repository.UpdateAsync(booking);
        await _repository.AddAuditLogAsync(bookingId, "Thu tiền", null, $"{dto.Amount.ToString("N0")}đ ({dto.PaymentMethod})");

        // 2. Auto-scale Membership Tier
        if (booking.UserId.HasValue)
        {
            var user = await _context.Users.FindAsync(booking.UserId.Value);
            if (user != null)
            {
                // Calculate life-time paid amount
                decimal lifeTimePaid = await _context.Payments
                    .Where(p => p.Invoice != null && p.Invoice.Booking != null && p.Invoice.Booking.UserId == user.Id)
                    .SumAsync(p => p.AmountPaid);

                // Additional new payment (since Context might not have flushed the current one to SumAsync yet)
                lifeTimePaid += dto.Amount;

                string newTierName = null;
                if (lifeTimePaid >= 50_000_000m) newTierName = "Bạch kim";
                else if (lifeTimePaid >= 20_000_000m) newTierName = "Vàng";
                else if (lifeTimePaid >= 10_000_000m) newTierName = "Bạc";
                else if (lifeTimePaid >= 5_000_000m) newTierName = "Đồng";

                if (newTierName != null)
                {
                    var newTier = await _context.Memberships.FirstOrDefaultAsync(m => m.TierName.Contains(newTierName));
                    if (newTier != null && user.MembershipId != newTier.Id)
                    {
                        // Check if new tier is higher. We assume IDs or logical names. 
                        // To be simple, we just set the new tier if thresholds are met (upgrades only).
                        user.MembershipId = newTier.Id;
                        await _context.SaveChangesAsync();
                    }
                }
            }
        }

        return true;
    }
}
