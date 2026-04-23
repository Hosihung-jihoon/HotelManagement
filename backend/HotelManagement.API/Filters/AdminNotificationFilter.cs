using HotelManagement.API.DTOs;
using HotelManagement.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.Infrastructure;

namespace HotelManagement.API.Filters;

/// <summary>
/// Intercepts successful POST/PUT/DELETE requests to auto-generate notifications.
/// </summary>
public class AdminNotificationFilter : IAsyncActionFilter
{
    private readonly IServiceProvider _serviceProvider;

    public AdminNotificationFilter(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var executedContext = await next();

        // Chỉ xử lý nếu HTTP request là một trong các thao tác thay đổi dữ liệu (POST, PUT, PATCH, DELETE)
        var method = context.HttpContext.Request.Method;
        if (method != "POST" && method != "PUT" && method != "PATCH" && method != "DELETE")
        {
            return;
        }

        // Chỉ tạo thông báo nếu kết quả thành công (Status 2xx)
        if (executedContext.Exception == null && executedContext.Result is ObjectResult or StatusCodeResult or IStatusCodeActionResult)
        {
            var statusCode = (executedContext.Result as IStatusCodeActionResult)?.StatusCode;
            if (statusCode.HasValue && statusCode.Value >= 200 && statusCode.Value < 300)
            {
                var controllerName = context.RouteData.Values["controller"]?.ToString() ?? "Trang";
                var actionName = GetActionText(method);

                // Nếu có API không muốn thông báo thì có thể cấu hình thêm ignore list ở đây
                if (controllerName.Equals("Notifications", StringComparison.OrdinalIgnoreCase))
                {
                    return;
                }

                // Tiêu đề của thông báo
                var title = $"Hệ thống cảnh báo";
                var message = $"Đã {actionName} {controllerName} thành công.";

                // Thêm một chút mô tả user nếu có
                var userName = context.HttpContext.User.Identity?.Name;
                if (!string.IsNullOrEmpty(userName))
                {
                    message += $" (Bởi: {userName})";
                }

                // Dùng Scoped Service để gọi NotificationService
                using var scope = _serviceProvider.CreateScope();
                var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

                // Để UserId = null => System Broadcast (tất cả các admin đều nhận được)
                var dto = new CreateNotificationDto
                {
                    UserId = null,
                    Title = title,
                    Message = message,
                    Type = GetNotificationType(method) // "success", "info", "warning", "error"
                };

                await notificationService.CreateAsync(dto);
            }
        }
    }

    private static string GetActionText(string httpMethod)
    {
        return httpMethod.ToUpper() switch
        {
            "POST" => "tạo mới",
            "PUT" or "PATCH" => "cập nhật",
            "DELETE" => "xóa",
            _ => "thay đổi"
        };
    }

    private static string GetNotificationType(string httpMethod)
    {
        return httpMethod.ToUpper() switch
        {
            "DELETE" => "warning",
            _ => "success"
        };
    }
}
