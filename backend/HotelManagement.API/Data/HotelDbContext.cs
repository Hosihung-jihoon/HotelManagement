using HotelManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Data;

public class HotelDbContext : DbContext
{
    public HotelDbContext(DbContextOptions<HotelDbContext> options) : base(options) { }

    // ========== DbSets ==========
    public DbSet<Amenity> Amenities { get; set; }
    public DbSet<ArticleCategory> ArticleCategories { get; set; }
    public DbSet<Article> Articles { get; set; }
    public DbSet<Attraction> Attractions { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }
    public DbSet<Booking> Bookings { get; set; }
    public DbSet<BookingDetail> BookingDetails { get; set; }
    public DbSet<Invoice> Invoices { get; set; }
    public DbSet<LossAndDamage> LossAndDamages { get; set; }
    public DbSet<Membership> Memberships { get; set; }
    public DbSet<OrderService> OrderServices { get; set; }
    public DbSet<OrderServiceDetail> OrderServiceDetails { get; set; }
    public DbSet<Payment> Payments { get; set; }
    public DbSet<Permission> Permissions { get; set; }
    public DbSet<Review> Reviews { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<RolePermission> RolePermissions { get; set; }
    public DbSet<Room> Rooms { get; set; }
    public DbSet<RoomImage> RoomImages { get; set; }
    public DbSet<RoomInventory> RoomInventories { get; set; }
    public DbSet<RoomType> RoomTypes { get; set; }
    public DbSet<RoomTypeAmenity> RoomTypeAmenities { get; set; }
    public DbSet<Service> Services { get; set; }
    public DbSet<ServiceCategory> ServiceCategories { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Voucher> Vouchers { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ===== Global Query Filters (Soft Delete) =====
        modelBuilder.Entity<Amenity>()
            .HasQueryFilter(a => !a.IsDeleted);

        modelBuilder.Entity<Membership>()
            .HasQueryFilter(m => !m.IsDeleted);

        // ===== Composite Keys =====
        modelBuilder.Entity<RolePermission>()
            .HasKey(rp => new { rp.RoleId, rp.PermissionId });

        modelBuilder.Entity<RoomTypeAmenity>()
            .HasKey(rta => new { rta.RoomTypeId, rta.AmenityId });

        // ===== Unique Constraints =====
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Booking>()
            .HasIndex(b => b.BookingCode)
            .IsUnique();

        modelBuilder.Entity<Voucher>()
            .HasIndex(v => v.Code)
            .IsUnique();

        modelBuilder.Entity<Article>()
            .HasIndex(a => a.Slug)
            .IsUnique();

        // ===== Check Constraints =====
        modelBuilder.Entity<Review>()
            .ToTable(t => t.HasCheckConstraint("CK_Reviews_Rating", "[rating] >= 1 AND [rating] <= 5"));

        // ===== Seed Data: Roles =====
        modelBuilder.Entity<Role>().HasData(
            new Role { Id = 1, Name = "Admin", Description = "Quản trị viên hệ thống" },
            new Role { Id = 2, Name = "Receptionist", Description = "Nhân viên lễ tân" },
            new Role { Id = 3, Name = "Housekeeping", Description = "Nhân viên dọn phòng" },
            new Role { Id = 4, Name = "Guest", Description = "Khách hàng" }
        );

        // ===== Seed Data: Permissions =====
        modelBuilder.Entity<Permission>().HasData(
            new Permission { Id = 1, Name = "manage_users" },
            new Permission { Id = 2, Name = "manage_roles" },
            new Permission { Id = 3, Name = "manage_rooms" },
            new Permission { Id = 4, Name = "manage_bookings" },
            new Permission { Id = 5, Name = "manage_services" },
            new Permission { Id = 6, Name = "view_reports" },
            new Permission { Id = 7, Name = "manage_housekeeping" },
            new Permission { Id = 8, Name = "view_own_bookings" }
        );

        // ===== Seed Data: Role-Permissions =====
        modelBuilder.Entity<RolePermission>().HasData(
            // Admin - tất cả quyền
            new RolePermission { RoleId = 1, PermissionId = 1 },
            new RolePermission { RoleId = 1, PermissionId = 2 },
            new RolePermission { RoleId = 1, PermissionId = 3 },
            new RolePermission { RoleId = 1, PermissionId = 4 },
            new RolePermission { RoleId = 1, PermissionId = 5 },
            new RolePermission { RoleId = 1, PermissionId = 6 },
            new RolePermission { RoleId = 1, PermissionId = 7 },
            new RolePermission { RoleId = 1, PermissionId = 8 },
            // Receptionist
            new RolePermission { RoleId = 2, PermissionId = 3 },
            new RolePermission { RoleId = 2, PermissionId = 4 },
            new RolePermission { RoleId = 2, PermissionId = 5 },
            new RolePermission { RoleId = 2, PermissionId = 6 },
            // Housekeeping
            new RolePermission { RoleId = 3, PermissionId = 7 },
            // Guest
            new RolePermission { RoleId = 4, PermissionId = 8 }
        );
    }
}
