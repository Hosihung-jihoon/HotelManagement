using Microsoft.AspNetCore.SignalR;

namespace HotelManagement.API.Hubs;

public class RoomHub : Hub
{
    // Cập nhật trạng thái phòng cho tất cả client
    public async Task SendRoomStatusUpdate(int roomId, string status)
    {
        await Clients.All.SendAsync("ReceiveRoomStatusUpdate", roomId, status);
    }
}
