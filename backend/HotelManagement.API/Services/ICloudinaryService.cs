namespace HotelManagement.API.Services;

public interface ICloudinaryService
{
    Task<string> UploadImageAsync(IFormFile file, string folder = "hotel");
    Task<bool> DeleteImageAsync(string publicId);
}
