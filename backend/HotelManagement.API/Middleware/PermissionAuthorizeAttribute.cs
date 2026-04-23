using HotelManagement.API.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Middleware;

/// <summary>
/// Custom Authorization Attribute - Kiểm tra permission của user dựa trên JWT claims.
/// Sử dụng: [PermissionAuthorize("manage_users")] hoặc [PermissionAuthorize("manage_roles", "view_roles")].
/// Logic OR: user chỉ cần có BẤT KỲ quyền nào trong danh sách là được phép.
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true)]
public class PermissionAuthorizeAttribute : Attribute, IAsyncAuthorizationFilter
{
    private readonly string[] _permissions;

    public PermissionAuthorizeAttribute(params string[] permissions)
    {
        _permissions = permissions;
    }

    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var user = context.HttpContext.User;
        if (user?.Identity?.IsAuthenticated != true)
        {
            context.Result = new UnauthorizedObjectResult(new { message = "Bạn chưa đăng nhập." });
            return;
        }

        var userIdClaim = user.FindFirst("userId")?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
        {
            context.Result = new UnauthorizedObjectResult(new { message = "Token không hợp lệ." });
            return;
        }

        var dbContext = context.HttpContext.RequestServices.GetRequiredService<HotelDbContext>();

        var userPermissions = await dbContext.Users
            .Where(u => u.Id == userId && u.RoleId != null)
            .SelectMany(u => u.Role!.RolePermissions)
            .Select(rp => rp.Permission.Name.ToLower())
            .ToListAsync();

        var requiredLower = _permissions.Select(p => p.ToLower()).ToArray();
        var hasPermission = userPermissions.Any(p => requiredLower.Contains(p));

        if (!hasPermission)
        {
            var permList = string.Join(" hoặc ", _permissions);
            context.Result = new ObjectResult(new { message = $"Bạn không có quyền: {permList}" })
            {
                StatusCode = 403
            };
        }
    }
}
