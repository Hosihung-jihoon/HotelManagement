using HotelManagement.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace HotelManagement.API.Data;

public class HotelDbContext : DbContext
{
    private readonly string _dbProvider;

    public HotelDbContext(DbContextOptions<HotelDbContext> options, IConfiguration configuration) 
        : base(options)
    {
        _dbProvider = configuration["DatabaseProvider"] ?? "SqlServer";
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        // Suppress PendingModelChangesWarning caused by EF tools version mismatch
        optionsBuilder.ConfigureWarnings(w =>
            w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning)
             .Ignore(Microsoft.EntityFrameworkCore.Diagnostics.CoreEventId.PossibleIncorrectRequiredNavigationWithQueryFilterInteractionWarning));
    }

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
    public DbSet<RoomTypeService> RoomTypeServices { get; set; }
    public DbSet<Service> Services { get; set; }
    public DbSet<ServiceCategory> ServiceCategories { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Voucher> Vouchers { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<Equipment> Equipments { get; set; }
    public DbSet<HotelBranch> HotelBranches { get; set; }
    public DbSet<ContactRequest> ContactRequests { get; set; }
    public DbSet<RoleDashboardPeriodState> DashboardSnapshots { get; set; }

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

        modelBuilder.Entity<RoomTypeService>()
            .HasKey(rts => new { rts.RoomTypeId, rts.ServiceId });

        modelBuilder.Entity<RoomType>()
            .Property(rt => rt.SizeSqm)
            .HasPrecision(10, 2);

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
        // Cú pháp khác nhau giữa SQL Server ([rating]) và SQLite ("rating")
        if (_dbProvider.Equals("Sqlite", StringComparison.OrdinalIgnoreCase))
        {
            modelBuilder.Entity<Review>()
                .ToTable(t => t.HasCheckConstraint("CK_Reviews_Rating", "\"rating\" >= 1 AND \"rating\" <= 5"));
        }
        else
        {
            modelBuilder.Entity<Review>()
                .ToTable(t => t.HasCheckConstraint("CK_Reviews_Rating", "[rating] >= 1 AND [rating] <= 5"));
        }

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

        // ===== Seed Data: Users =====
        modelBuilder.Entity<User>().HasData(
            new User 
            { 
                Id = 1, 
                FullName = "Admin System", 
                Email = "vibecoding209@gmail.com", 
                PasswordHash = "$2a$11$VQ8eIzRm2MjRl2gjFZWon.YQkCGooN1pMFhNEn6Yaf/PLq.nqkXIG", // admin
                RoleId = 1, 
                Status = true 
            },
            new User 
            { 
                Id = 2, 
                FullName = "Hotel Manager", 
                Email = "manager@hotel.com", 
                PasswordHash = "$2a$11$w0a9bylqBIL4UxKAX1DzLeHzGGcyv703ndlrU5eGKzey3jei38sP6", // manager
                RoleId = 1, 
                Status = true 
            },
            new User 
            { 
                Id = 3, 
                FullName = "Receptionist 1", 
                Email = "reception1@hotel.com", 
                PasswordHash = "$2a$11$moigqG6DqvHapVXW50MJ5.W1UeoELEqFL/nDBgIgbakaW.mG7DRoW", // 123456
                RoleId = 2, 
                Status = true 
            },
            new User 
            { 
                Id = 4, 
                FullName = "Receptionist 2", 
                Email = "reception2@hotel.com", 
                PasswordHash = "$2a$11$moigqG6DqvHapVXW50MJ5.W1UeoELEqFL/nDBgIgbakaW.mG7DRoW", // 123456
                RoleId = 2, 
                Status = true 
            },
            new User 
            { 
                Id = 5, 
                FullName = "Accountant", 
                Email = "accountant@hotel.com", 
                PasswordHash = "$2a$11$moigqG6DqvHapVXW50MJ5.W1UeoELEqFL/nDBgIgbakaW.mG7DRoW", // 123456
                RoleId = 1, 
                Status = true 
            },
            new User 
            { 
                Id = 6, 
                FullName = "Hung Le", 
                Email = "hunglm@vaa.edu.vn", 
                PasswordHash = "$2a$11$moigqG6DqvHapVXW50MJ5.W1UeoELEqFL/nDBgIgbakaW.mG7DRoW", // 123456
                RoleId = 4, 
                Status = true 
            },
            new User 
            { 
                Id = 7, 
                FullName = "Manh Hung", 
                Email = "manhung08062@gmail.com", 
                PasswordHash = "$2a$11$moigqG6DqvHapVXW50MJ5.W1UeoELEqFL/nDBgIgbakaW.mG7DRoW", // 123456
                RoleId = 4, 
                Status = true 
            },
            new User 
            { 
                Id = 8, 
                FullName = "Dai Nguyen", 
                Email = "dainguyen1254@gmail.com", 
                PasswordHash = "$2a$11$moigqG6DqvHapVXW50MJ5.W1UeoELEqFL/nDBgIgbakaW.mG7DRoW", // 123456
                RoleId = 4, 
                Status = true 
            },
            new User 
            { 
                Id = 9, 
                FullName = "An Nguyen", 
                Email = "nguyenbinhan2707@gmail.com", 
                PasswordHash = "$2a$11$moigqG6DqvHapVXW50MJ5.W1UeoELEqFL/nDBgIgbakaW.mG7DRoW", // 123456
                RoleId = 4, 
                Status = true 
            }
        );
        // ===== Seed Data: Article Categories =====
        modelBuilder.Entity<ArticleCategory>().HasData(
            new ArticleCategory { Id = 1, Name = "Tin tức" },
            new ArticleCategory { Id = 2, Name = "Du lịch" },
            new ArticleCategory { Id = 3, Name = "Ẩm thực" },
            new ArticleCategory { Id = 4, Name = "Khuyến mãi" }
        );

        // ===== Seed Data: Articles =====
        modelBuilder.Entity<Article>().HasData(
            new Article
            {
                Id = 1,
                CategoryId = 1,
                AuthorId = 1,
                Title = "Grand Opening: Our New Luxury Suite Collection",
                Slug = "grand-opening-luxury-suite-collection",
                Content = "We are thrilled to announce the launch of our brand-new Luxury Suite Collection, featuring panoramic city views, private butler service, and state-of-the-art amenities.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
                PublishedAt = new DateTime(2025, 5, 10),
                IsActive = true
            },
            new Article
            {
                Id = 2,
                CategoryId = 2,
                AuthorId = 1,
                Title = "Top 5 Hidden Gems in Ho Chi Minh City",
                Slug = "top-5-hidden-gems-ho-chi-minh-city",
                Content = "Beyond the famous landmarks, Saigon hides charming alleyways, rooftop bars and local markets that most tourists miss. Here are our top picks.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80",
                PublishedAt = new DateTime(2025, 5, 14),
                IsActive = true
            },
            new Article
            {
                Id = 3,
                CategoryId = 3,
                AuthorId = 2,
                Title = "A Culinary Journey: Signature Dishes at Our Restaurant",
                Slug = "culinary-journey-signature-dishes",
                Content = "Our executive chef presents a curated menu blending Vietnamese heritage with contemporary French technique. Discover the stories behind each signature dish.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
                PublishedAt = new DateTime(2025, 5, 18),
                IsActive = true
            },
            new Article
            {
                Id = 4,
                CategoryId = 4,
                AuthorId = 1,
                Title = "Summer Special: 30% Off All Room Types",
                Slug = "summer-special-30-off-all-rooms",
                Content = "Book now and enjoy 30% discount on all room categories from June to August 2025. Includes complimentary breakfast and late check-out until 2 PM.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
                PublishedAt = new DateTime(2025, 5, 20),
                IsActive = true
            },
            new Article
            {
                Id = 5,
                CategoryId = 2,
                AuthorId = 2,
                Title = "Weekend Getaway: Day Trips from Saigon",
                Slug = "weekend-getaway-day-trips-from-saigon",
                Content = "Escape the city for a day and explore the Mekong Delta, Cu Chi Tunnels, or the beaches of Vung Tau — all within two hours from our hotel.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80",
                PublishedAt = new DateTime(2025, 5, 22),
                IsActive = true
            },
            new Article
            {
                Id = 6,
                CategoryId = 1,
                AuthorId = 1,
                Title = "Sustainability Pledge: Our Green Hotel Initiative",
                Slug = "sustainability-pledge-green-hotel-initiative",
                Content = "We have committed to reducing our carbon footprint by 50% by 2030 through solar energy, zero-waste kitchens, and eco-friendly room amenities.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80",
                PublishedAt = new DateTime(2025, 6, 1),
                IsActive = true
            },
            new Article
            {
                Id = 7,
                CategoryId = 3,
                AuthorId = 2,
                Title = "Pho & Beyond: Vietnamese Breakfast Reinvented",
                Slug = "pho-beyond-vietnamese-breakfast-reinvented",
                Content = "Our morning buffet goes far beyond the usual. From hand-rolled bánh mì to steaming bowls of bún bò Huế, every morning is a new discovery.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800&q=80",
                PublishedAt = new DateTime(2025, 6, 5),
                IsActive = true
            },
            new Article
            {
                Id = 8,
                CategoryId = 4,
                AuthorId = 1,
                Title = "Loyalty Members: Double Points in June",
                Slug = "loyalty-members-double-points-june",
                Content = "Celebrate our anniversary month with double loyalty points on every booking made in June 2025. Redeem points for free nights, spa vouchers, and dining credits.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
                PublishedAt = new DateTime(2025, 6, 8),
                IsActive = true
            },
            new Article
            {
                Id = 9,
                CategoryId = 2,
                AuthorId = 2,
                Title = "Exploring Ha Long Bay: A Cruise Guide",
                Slug = "exploring-ha-long-bay-cruise-guide",
                Content = "Planning a trip to Ha Long Bay? We have partnered with premium cruise operators to offer exclusive packages for our hotel guests at preferential rates.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&q=80",
                PublishedAt = new DateTime(2025, 6, 12),
                IsActive = true
            },
            new Article
            {
                Id = 10,
                CategoryId = 1,
                AuthorId = 1,
                Title = "Award-Winning Spa: Now Open 24/7",
                Slug = "award-winning-spa-open-24-7",
                Content = "Following multiple industry awards, our rooftop spa now operates around the clock. Enjoy deep-tissue massages, aromatherapy, and hydrotherapy any time of day or night.",
                ThumbnailUrl = "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80",
                PublishedAt = new DateTime(2025, 6, 15),
                IsActive = true
            }
        );
    }
}
