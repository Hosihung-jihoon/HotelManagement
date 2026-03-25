using HotelManagement.API.Data;
using HotelManagement.API.DTOs;
using HotelManagement.API.Models;
using HotelManagement.API.Repositories;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace HotelManagement.API.Services;

/// <summary>
/// Invoice Service - Chứa business logic + mapping Entity ↔ DTO.
/// Bao gồm logic gom hóa đơn và xuất PDF.
/// </summary>
public class InvoiceService : IInvoiceService
{
    private readonly IInvoiceRepository _repository;
    private readonly HotelDbContext _context;
    private const decimal TaxRateValue = 0.10m; // 10% VAT

    public InvoiceService(IInvoiceRepository repository, HotelDbContext context)
    {
        _repository = repository;
        _context = context;
    }

    // ========== CRUD cơ bản (giữ nguyên) ==========

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
            entity.BookingId = dto.BookingId.Value;

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

    // ========== GOM HÓA ĐƠN (Bill Aggregation) ==========

    /// <summary>
    /// Preview bill — truy vấn toàn bộ dữ liệu liên quan và tính toán tự động.
    /// Không lưu vào DB.
    /// </summary>
    public async Task<BillDto> GetBillAsync(int bookingId)
    {
        // 1. Load Booking + tất cả quan hệ liên quan
        var booking = await _context.Bookings
            .Include(b => b.Voucher)
            .Include(b => b.BookingDetails)
                .ThenInclude(bd => bd.Room)
                    .ThenInclude(r => r!.RoomType)
            .Include(b => b.BookingDetails)
                .ThenInclude(bd => bd.RoomType)
            .Include(b => b.BookingDetails)
                .ThenInclude(bd => bd.OrderServices)
                    .ThenInclude(os => os.OrderServiceDetails)
                        .ThenInclude(osd => osd.Service)
            .Include(b => b.BookingDetails)
                .ThenInclude(bd => bd.LossAndDamages)
            .Include(b => b.Invoice)
            .AsSplitQuery()
            .FirstOrDefaultAsync(b => b.Id == bookingId);

        if (booking == null)
            throw new ArgumentException($"Không tìm thấy Booking với ID = {bookingId}");

        // 2. Tính tiền phòng
        var roomDetails = new List<BillRoomDetailDto>();
        foreach (var bd in booking.BookingDetails)
        {
            var nights = (int)(bd.CheckOutDate - bd.CheckInDate).TotalDays;
            if (nights <= 0) nights = 1;

            var roomTypeName = bd.RoomType?.Name ?? bd.Room?.RoomType?.Name ?? "N/A";
            var roomNumber = bd.Room?.RoomNumber ?? "N/A";

            roomDetails.Add(new BillRoomDetailDto
            {
                RoomNumber = roomNumber,
                RoomTypeName = roomTypeName,
                PricePerNight = bd.PricePerNight,
                Nights = nights,
                CheckInDate = bd.CheckInDate,
                CheckOutDate = bd.CheckOutDate,
                Subtotal = bd.PricePerNight * nights
            });
        }

        // 3. Tính tiền dịch vụ
        var serviceDetails = new List<BillServiceDetailDto>();
        foreach (var bd in booking.BookingDetails)
        {
            foreach (var os in bd.OrderServices)
            {
                foreach (var osd in os.OrderServiceDetails)
                {
                    serviceDetails.Add(new BillServiceDetailDto
                    {
                        ServiceName = osd.Service?.Name ?? "N/A",
                        Quantity = osd.Quantity,
                        UnitPrice = osd.UnitPrice,
                        Subtotal = osd.Quantity * osd.UnitPrice
                    });
                }
            }
        }

        // 4. Tính tiền phạt (LossAndDamage)
        var penaltyDetails = new List<BillPenaltyDetailDto>();
        foreach (var bd in booking.BookingDetails)
        {
            foreach (var lad in bd.LossAndDamages)
            {
                penaltyDetails.Add(new BillPenaltyDetailDto
                {
                    Description = lad.Description,
                    Quantity = lad.Quantity,
                    PenaltyAmount = lad.PenaltyAmount
                });
            }
        }

        // 5. Tổng cộng
        var totalRoom = roomDetails.Sum(r => r.Subtotal);
        var totalService = serviceDetails.Sum(s => s.Subtotal);
        var totalPenalty = penaltyDetails.Sum(p => p.PenaltyAmount * p.Quantity);
        var subtotal = totalRoom + totalService + totalPenalty;

        // 6. Giảm giá (Voucher)
        decimal discountAmount = 0;
        string? voucherCode = null;
        if (booking.Voucher != null)
        {
            voucherCode = booking.Voucher.Code;
            if (booking.Voucher.DiscountType.Equals("Percentage", StringComparison.OrdinalIgnoreCase))
            {
                discountAmount = subtotal * booking.Voucher.DiscountValue / 100m;
            }
            else // Fixed
            {
                discountAmount = booking.Voucher.DiscountValue;
            }

            // Không cho discount vượt subtotal
            if (discountAmount > subtotal)
                discountAmount = subtotal;
        }

        // 7. Thuế VAT
        var taxableAmount = subtotal - discountAmount;
        var taxAmount = taxableAmount * TaxRateValue;

        // 8. Tổng cuối
        var finalTotal = taxableAmount + taxAmount;

        // Kiểm tra invoice đã tồn tại chưa
        int? invoiceId = booking.Invoice?.Id;
        string? status = booking.Invoice?.Status;

        return new BillDto
        {
            BookingId = booking.Id,
            BookingCode = booking.BookingCode,
            GuestName = booking.GuestName,
            GuestPhone = booking.GuestPhone,

            Rooms = roomDetails,
            Services = serviceDetails,
            Penalties = penaltyDetails,

            TotalRoomAmount = totalRoom,
            TotalServiceAmount = totalService,
            TotalPenaltyAmount = totalPenalty,
            Subtotal = subtotal,
            DiscountAmount = discountAmount,
            VoucherCode = voucherCode,
            TaxRate = TaxRateValue,
            TaxAmount = taxAmount,
            FinalTotal = finalTotal,

            InvoiceId = invoiceId,
            Status = status
        };
    }

    /// <summary>
    /// Gom bill + tạo hoặc cập nhật Invoice trong DB.
    /// </summary>
    public async Task<BillDto> GenerateBillAsync(int bookingId)
    {
        var bill = await GetBillAsync(bookingId);

        if (bill.InvoiceId.HasValue)
        {
            // Cập nhật invoice hiện có
            var existing = await _repository.GetByIdAsync(bill.InvoiceId.Value);
            if (existing != null)
            {
                existing.TotalRoomAmount = bill.TotalRoomAmount;
                existing.TotalServiceAmount = bill.TotalServiceAmount;
                existing.DiscountAmount = bill.DiscountAmount;
                existing.TaxAmount = bill.TaxAmount;
                existing.FinalTotal = bill.FinalTotal;
                await _repository.UpdateAsync(existing);

                bill.InvoiceId = existing.Id;
                bill.Status = existing.Status;
            }
        }
        else
        {
            // Tạo invoice mới
            var entity = new Invoice
            {
                BookingId = bookingId,
                TotalRoomAmount = bill.TotalRoomAmount,
                TotalServiceAmount = bill.TotalServiceAmount,
                DiscountAmount = bill.DiscountAmount,
                TaxAmount = bill.TaxAmount,
                FinalTotal = bill.FinalTotal,
                Status = "Unpaid"
            };

            var created = await _repository.CreateAsync(entity);
            bill.InvoiceId = created.Id;
            bill.Status = created.Status;
        }

        return bill;
    }

    // ========== XUẤT PDF ==========

    /// <summary>
    /// Xuất hóa đơn PDF theo InvoiceId. Trả về byte[] chứa nội dung PDF.
    /// </summary>
    public async Task<byte[]> ExportPdfAsync(int invoiceId)
    {
        var invoice = await _repository.GetByIdWithPaymentsAsync(invoiceId);
        if (invoice == null)
            throw new ArgumentException($"Không tìm thấy hóa đơn với ID = {invoiceId}");

        if (!invoice.BookingId.HasValue)
            throw new ArgumentException("Hóa đơn không có BookingId.");

        // Load full bill data
        var bill = await GetBillAsync(invoice.BookingId.Value);
        bill.InvoiceId = invoice.Id;
        bill.Status = invoice.Status;

        // Render PDF
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(30);
                page.DefaultTextStyle(x => x.FontSize(10));

                // Header
                page.Header().Column(col =>
                {
                    col.Item().AlignCenter().Text("HÓA ĐƠN THANH TOÁN").Bold().FontSize(20);
                    col.Item().AlignCenter().Text("HOTEL MANAGEMENT SYSTEM").FontSize(12).FontColor(Colors.Grey.Medium);
                    col.Item().PaddingTop(5).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                });

                // Content
                page.Content().PaddingVertical(10).Column(col =>
                {
                    col.Spacing(8);

                    // Thông tin chung
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text($"Mã hóa đơn: #{bill.InvoiceId}").Bold();
                            c.Item().Text($"Mã booking: {bill.BookingCode}");
                            c.Item().Text($"Trạng thái: {bill.Status}");
                        });
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().AlignRight().Text($"Khách hàng: {bill.GuestName ?? "N/A"}");
                            c.Item().AlignRight().Text($"SĐT: {bill.GuestPhone ?? "N/A"}");
                            c.Item().AlignRight().Text($"Ngày xuất: {DateTime.Now:dd/MM/yyyy HH:mm}");
                        });
                    });

                    col.Item().PaddingVertical(5).LineHorizontal(0.5f).LineColor(Colors.Grey.Lighten2);

                    // Bảng phòng
                    if (bill.Rooms.Count > 0)
                    {
                        col.Item().Text("TIỀN PHÒNG").Bold().FontSize(12);
                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn(2); // Phòng
                                columns.RelativeColumn(2); // Loại phòng
                                columns.RelativeColumn(1.5f); // Check-in
                                columns.RelativeColumn(1.5f); // Check-out
                                columns.RelativeColumn(1); // Đêm
                                columns.RelativeColumn(1.5f); // Giá/đêm
                                columns.RelativeColumn(1.5f); // Thành tiền
                            });

                            // Header row
                            table.Header(header =>
                            {
                                header.Cell().Background(Colors.Blue.Lighten4).Padding(4).Text("Phòng").Bold();
                                header.Cell().Background(Colors.Blue.Lighten4).Padding(4).Text("Loại phòng").Bold();
                                header.Cell().Background(Colors.Blue.Lighten4).Padding(4).Text("Check-in").Bold();
                                header.Cell().Background(Colors.Blue.Lighten4).Padding(4).Text("Check-out").Bold();
                                header.Cell().Background(Colors.Blue.Lighten4).Padding(4).AlignRight().Text("Đêm").Bold();
                                header.Cell().Background(Colors.Blue.Lighten4).Padding(4).AlignRight().Text("Giá/đêm").Bold();
                                header.Cell().Background(Colors.Blue.Lighten4).Padding(4).AlignRight().Text("Thành tiền").Bold();
                            });

                            foreach (var room in bill.Rooms)
                            {
                                table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten3).Padding(4).Text(room.RoomNumber);
                                table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten3).Padding(4).Text(room.RoomTypeName);
                                table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten3).Padding(4).Text(room.CheckInDate.ToString("dd/MM/yyyy"));
                                table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten3).Padding(4).Text(room.CheckOutDate.ToString("dd/MM/yyyy"));
                                table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten3).Padding(4).AlignRight().Text(room.Nights.ToString());
                                table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten3).Padding(4).AlignRight().Text(room.PricePerNight.ToString("N0"));
                                table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten3).Padding(4).AlignRight().Text(room.Subtotal.ToString("N0"));
                            }
                        });
                        col.Item().AlignRight().Text($"Tổng tiền phòng: {bill.TotalRoomAmount:N0} VNĐ").Bold();
                    }

                    // Bảng dịch vụ
                    if (bill.Services.Count > 0)
                    {
                        col.Item().PaddingTop(5).Text("TIỀN DỊCH VỤ").Bold().FontSize(12);
                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn(3); // Tên DV
                                columns.RelativeColumn(1); // SL
                                columns.RelativeColumn(2); // Đơn giá
                                columns.RelativeColumn(2); // Thành tiền
                            });

                            table.Header(header =>
                            {
                                header.Cell().Background(Colors.Green.Lighten4).Padding(4).Text("Dịch vụ").Bold();
                                header.Cell().Background(Colors.Green.Lighten4).Padding(4).AlignRight().Text("SL").Bold();
                                header.Cell().Background(Colors.Green.Lighten4).Padding(4).AlignRight().Text("Đơn giá").Bold();
                                header.Cell().Background(Colors.Green.Lighten4).Padding(4).AlignRight().Text("Thành tiền").Bold();
                            });

                            foreach (var svc in bill.Services)
                            {
                                table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten3).Padding(4).Text(svc.ServiceName);
                                table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten3).Padding(4).AlignRight().Text(svc.Quantity.ToString());
                                table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten3).Padding(4).AlignRight().Text(svc.UnitPrice.ToString("N0"));
                                table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten3).Padding(4).AlignRight().Text(svc.Subtotal.ToString("N0"));
                            }
                        });
                        col.Item().AlignRight().Text($"Tổng tiền dịch vụ: {bill.TotalServiceAmount:N0} VNĐ").Bold();
                    }

                    // Bảng phạt
                    if (bill.Penalties.Count > 0)
                    {
                        col.Item().PaddingTop(5).Text("TIỀN PHẠT / HƯ HỎNG").Bold().FontSize(12);
                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn(4); // Mô tả
                                columns.RelativeColumn(1); // SL
                                columns.RelativeColumn(2); // Số tiền
                            });

                            table.Header(header =>
                            {
                                header.Cell().Background(Colors.Red.Lighten4).Padding(4).Text("Mô tả").Bold();
                                header.Cell().Background(Colors.Red.Lighten4).Padding(4).AlignRight().Text("SL").Bold();
                                header.Cell().Background(Colors.Red.Lighten4).Padding(4).AlignRight().Text("Số tiền").Bold();
                            });

                            foreach (var pen in bill.Penalties)
                            {
                                table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten3).Padding(4).Text(pen.Description ?? "N/A");
                                table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten3).Padding(4).AlignRight().Text(pen.Quantity.ToString());
                                table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten3).Padding(4).AlignRight().Text(pen.PenaltyAmount.ToString("N0"));
                            }
                        });
                        col.Item().AlignRight().Text($"Tổng tiền phạt: {bill.TotalPenaltyAmount:N0} VNĐ").Bold();
                    }

                    // Tổng kết
                    col.Item().PaddingTop(10).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                    col.Item().PaddingTop(5).Column(summary =>
                    {
                        summary.Item().Row(row =>
                        {
                            row.RelativeItem().AlignRight().Text("Tạm tính:");
                            row.ConstantItem(120).AlignRight().Text($"{bill.Subtotal:N0} VNĐ");
                        });

                        if (bill.DiscountAmount > 0)
                        {
                            summary.Item().Row(row =>
                            {
                                row.RelativeItem().AlignRight().Text($"Giảm giá ({bill.VoucherCode}):");
                                row.ConstantItem(120).AlignRight().Text($"-{bill.DiscountAmount:N0} VNĐ").FontColor(Colors.Green.Medium);
                            });
                        }

                        summary.Item().Row(row =>
                        {
                            row.RelativeItem().AlignRight().Text($"Thuế VAT ({bill.TaxRate * 100:0}%):");
                            row.ConstantItem(120).AlignRight().Text($"{bill.TaxAmount:N0} VNĐ");
                        });

                        summary.Item().PaddingTop(3).LineHorizontal(0.5f).LineColor(Colors.Grey.Lighten2);

                        summary.Item().PaddingTop(3).Row(row =>
                        {
                            row.RelativeItem().AlignRight().Text("TỔNG CỘNG:").Bold().FontSize(13);
                            row.ConstantItem(120).AlignRight().Text($"{bill.FinalTotal:N0} VNĐ").Bold().FontSize(13).FontColor(Colors.Blue.Medium);
                        });
                    });
                });

                // Footer
                page.Footer().AlignCenter().Text(text =>
                {
                    text.Span("Cảm ơn quý khách! - ").FontSize(9).FontColor(Colors.Grey.Medium);
                    text.Span("Hotel Management System").FontSize(9).Italic().FontColor(Colors.Grey.Medium);
                });
            });
        });

        return document.GeneratePdf();
    }
}
