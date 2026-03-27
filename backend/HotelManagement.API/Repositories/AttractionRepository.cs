using HotelManagement.API.Data;
using HotelManagement.API.Models;

namespace HotelManagement.API.Repositories;

public class AttractionRepository : GenericRepository<Attraction>, IAttractionRepository
{
    public AttractionRepository(HotelDbContext context) : base(context)
    {
    }
}
