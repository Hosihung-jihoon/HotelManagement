using HotelManagement.API.Models;

namespace HotelManagement.API.Repositories;

public interface IVoucherRepository : IGenericRepository<Voucher>
{
    Task<Voucher?> GetByCodeAsync(string code);
}
