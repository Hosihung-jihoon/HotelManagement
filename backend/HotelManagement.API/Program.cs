using System.Text;
using HotelManagement.API.Data;
using HotelManagement.API.Hubs;
using HotelManagement.API.Models;
using HotelManagement.API.Repositories;
using HotelManagement.API.Services;
using HotelManagement.API.Filters;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// ========== DbContext ==========
var dbProvider = builder.Configuration["DatabaseProvider"] ?? "SqlServer";

builder.Services.AddDbContext<HotelDbContext>(options =>
{
    if (dbProvider.Equals("Sqlite", StringComparison.OrdinalIgnoreCase))
        options.UseSqlite(builder.Configuration.GetConnectionString("SqliteConnection")
            ?? "Data Source=hotel.db");
    else
        options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

// ========== Repositories (DI) ==========
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<IRoomTypeRepository, RoomTypeRepository>();
builder.Services.AddScoped<IArticleCategoryRepository, ArticleCategoryRepository>();
builder.Services.AddScoped<IArticleRepository, ArticleRepository>();
builder.Services.AddScoped<IAttractionRepository, AttractionRepository>();
builder.Services.AddScoped<IRoomInventoryRepository, RoomInventoryRepository>();
builder.Services.AddScoped<IBookingRepository, BookingRepository>();
builder.Services.AddScoped<IVoucherRepository, VoucherRepository>();
builder.Services.AddScoped<IRoomRepository, RoomRepository>();
builder.Services.AddScoped<IServiceCategoryRepository, ServiceCategoryRepository>();
builder.Services.AddScoped<IServiceRepository, ServiceRepository>();
builder.Services.AddScoped<IAmenityRepository, AmenityRepository>();
builder.Services.AddScoped<IMembershipRepository, MembershipRepository>();
builder.Services.AddScoped<IInvoiceRepository, InvoiceRepository>();
builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();
builder.Services.AddScoped<IOrderServiceRepository, OrderServiceRepository>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<IAuditLogRepository, AuditLogRepository>();

// ========== Services (DI) ==========
builder.Services.AddScoped<IRoomTypeService, RoomTypeService>();
builder.Services.AddScoped<IRoomService, RoomService>();
builder.Services.AddScoped<ICloudinaryService, CloudinaryService>();
builder.Services.AddScoped<IServiceCategoryService, ServiceCategoryService>();
builder.Services.AddScoped<IServiceService, ServiceService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<IArticleCategoryService, ArticleCategoryService>();
builder.Services.AddScoped<IArticleService, ArticleService>();
builder.Services.AddScoped<IAttractionService, AttractionService>();
builder.Services.AddScoped<IRoomInventoryService, RoomInventoryService>();
builder.Services.Configure<HotelManagement.API.Models.CloudinarySettings>(builder.Configuration.GetSection("CloudinarySettings"));
builder.Services.AddScoped<ICloudinaryService, CloudinaryService>();
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<IVoucherService, VoucherService>();
builder.Services.AddScoped<IAmenityService, AmenityService>();
builder.Services.AddScoped<IMembershipService, MembershipService>();
builder.Services.AddScoped<IInvoiceService, InvoiceService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IOrderServiceService, OrderServiceService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<ILossAndDamageService, LossAndDamageService>();
builder.Services.AddScoped<IPasswordResetService, PasswordResetService>();
builder.Services.AddScoped<IEquipmentService, EquipmentService>();
builder.Services.AddScoped<IAuditLogService, AuditLogService>();

// ========== JWT Authentication ==========
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(secretKey)
    };
});

// ========== SignalR ==========
builder.Services.AddSignalR();

// ========== Controllers ==========
builder.Services.AddControllers(options => 
{
    options.Filters.Add<AdminNotificationFilter>();
});

// ========== Swagger (có Bearer Token) ==========
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new()
    {
        Title = "Hotel Management API",
        Version = "v1",
        Description = "API quản lý khách sạn - Nhóm 7"
    });

    // Thêm Bearer Token vào Swagger UI (Swashbuckle v10 / OpenAPI.NET v2)
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Nhập JWT token. Ví dụ: eyJhbGciOi..."
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ========== CORS ==========
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// ========== Local SQLite bootstrap ==========
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<HotelDbContext>();
    var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
    var runtimeDbProvider = configuration["DatabaseProvider"] ?? "SqlServer";

    if (runtimeDbProvider.Equals("Sqlite", StringComparison.OrdinalIgnoreCase))
    {
        db.Database.EnsureCreated();

        if (!db.Users.Any(u => u.Email == "vibecoding209@gmail.com"))
        {
            db.Users.Add(new User
            {
                FullName = "System Administrator",
                Email = "vibecoding209@gmail.com",
                Phone = "0000000000",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin"),
                RoleId = 1,
                Status = true
            });
        }

        if (!db.Users.Any(u => u.Email == "manager@hotel.com"))
        {
            db.Users.Add(new User
            {
                FullName = "Hotel Manager",
                Email = "manager@hotel.com",
                Phone = "0111222333",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("manager"),
                RoleId = 2, // Receptionist/Manager role
                Status = true
            });
        }

        if (!db.Users.Any(u => u.Email == "reception1@hotel.com"))
        {
            db.Users.Add(new User
            {
                FullName = "Receptionist 01",
                Email = "reception1@hotel.com",
                Phone = "0987654321",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("reception"),
                RoleId = 3,
                Status = true
            });
        }

        // ========== Seed RoomTypes & Rooms for Demo ==========
        if (!db.RoomTypes.Any())
        {
            var rts = new List<RoomType>
            {
                new RoomType { Name = "Standard Room", BasePrice = 1200000, CapacityAdults = 2, CapacityChildren = 1, Description = "Phòng tiêu chuẩn tiện nghi." },
                new RoomType { Name = "Deluxe Ocean View", BasePrice = 2850000, CapacityAdults = 2, CapacityChildren = 2, Description = "Phòng Deluxe view biển tuyệt đẹp." },
                new RoomType { Name = "Family Suite", BasePrice = 4500000, CapacityAdults = 4, CapacityChildren = 2, Description = "Phòng gia đình rộng rãi." },
                new RoomType { Name = "Presidential Suite", BasePrice = 15000000, CapacityAdults = 2, CapacityChildren = 0, Description = "Hạng phòng sang trọng nhất." }
            };
            db.RoomTypes.AddRange(rts);
            db.SaveChanges();

            // Create some rooms for each type
            foreach (var rt in rts)
            {
                for (int i = 1; i <= 5; i++)
                {
                    db.Rooms.Add(new Room
                    {
                        RoomNumber = $"{rt.Name.Substring(0, 1)}{i:D2}",
                        Status = "Available",
                        CleanStatus = "clean",
                        RoomTypeId = rt.Id
                    });
                }
            }
        }

        db.SaveChanges();
    }
}

// ========== Middleware Pipeline ==========
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Hotel Management API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// ========== SignalR Hub ==========
app.MapHub<NotificationHub>("/hubs/notification");

app.Run();
