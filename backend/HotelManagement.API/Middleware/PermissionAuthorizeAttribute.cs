using HotelManagement.API.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Middleware;

/// <summary>
/// Custom Authorization Attribute - Kiểm tra permission của user dựa trên JWT claims.
/// Sử dụng: [PermissionAuthorize("manage_users")] trên controller/action.
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true)]
public class PermissionAuthorizeAttribute : Attribute, IAsyncAuthorizationFilter
{
    private readonly string _permission;

    public PermissionAuthorizeAttribute(string permission)
    {
        _permission = permission;
    }

    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        // Kiểm tra user đã authenticated chưa
        var user = context.HttpContext.User;
        if (user?.Identity?.IsAuthenticated != true)
        {
            context.Result = new UnauthorizedObjectResult(new { message = "Bạn chưa đăng nhập." });
            return;
        }

        // Lấy userId từ claims
        var userIdClaim = user.FindFirst("userId")?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
        {
            context.Result = new UnauthorizedObjectResult(new { message = "Token không hợp lệ." });
            return;
        }

        // Query DB để kiểm tra permission
        var dbContext = context.HttpContext.RequestServices.GetRequiredService<HotelDbContext>();

        var hasPermission = await dbContext.Users
            .Where(u => u.Id == userId && u.RoleId != null)
            .SelectMany(u => u.Role!.RolePermissions)
            .Select(rp => rp.Permission.Name)
            .AnyAsync(p => p == _permission);

        if (!hasPermission)
        {
            context.Result = new ObjectResult(new { message = $"Bạn không có quyền: {_permission}" })
            {
                StatusCode = 403
            };
        }
    }
}
