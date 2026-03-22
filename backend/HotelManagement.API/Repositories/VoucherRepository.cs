using HotelManagement.API.Data;
using HotelManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Repositories;

public class VoucherRepository : GenericRepository<Voucher>, IVoucherRepository
{
    public VoucherRepository(HotelDbContext context) : base(context)
    {
    }

    public async Task<Voucher?> GetByCodeAsync(string code)
    {
        return await _dbSet.FirstOrDefaultAsync(v => v.Code == code);
    }
}
