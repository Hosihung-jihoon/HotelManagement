using Microsoft.AspNetCore.SignalR;

namespace HotelManagement.API.Hubs;

/// <summary>
/// SignalR Hub cho thông báo realtime.
/// Client lắng nghe event "ReceiveNotification" để nhận thông báo.
/// </summary>
public class NotificationHub : Hub
{
    /// <summary>
    /// Gửi thông báo tới một user cụ thể (theo connectionId hoặc group).
    /// Trong thực tế, nên map userId → connectionId và gửi qua Groups.
    /// </summary>
    public async Task SendNotification(string userId, string title, string message, string type = "info")
    {
        await Clients.Group(userId).SendAsync("ReceiveNotification", new
        {
            title,
            message,
            type,
            createdAt = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Broadcast thông báo tới tất cả client đang kết nối.
    /// </summary>
    public async Task BroadcastNotification(string title, string message, string type = "info")
    {
        await Clients.All.SendAsync("ReceiveNotification", new
        {
            title,
            message,
            type,
            createdAt = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Khi client connect, tự join group theo userId (nếu có).
    /// </summary>
    public override async Task OnConnectedAsync()
    {
        var userId = Context.GetHttpContext()?.Request.Query["userId"].ToString();
        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, userId);
        }
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.GetHttpContext()?.Request.Query["userId"].ToString();
        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, userId);
        }
        await base.OnDisconnectedAsync(exception);
    }
}
