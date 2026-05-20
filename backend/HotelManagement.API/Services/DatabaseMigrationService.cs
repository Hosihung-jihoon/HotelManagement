using HotelManagement.API.Data;
using HotelManagement.API.Helpers;
using HotelManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Services;

public class DatabaseMigrationService
{
    private readonly HotelDbContext _context;
    private readonly ILogger<DatabaseMigrationService> _logger;

    public DatabaseMigrationService(HotelDbContext context, ILogger<DatabaseMigrationService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task RunAsync()
    {
        _logger.LogInformation("DatabaseMigrationService: Checking for missing schema...");
        try
        {
            await AddMembershipColumnsIfMissing();
            await EnsureHotelBranchesTable();
            await EnsureAttractionSchema();
            await EnsureHotelBranchSchema();
            await EnsureMembershipSchema();
            await EnsureRoomTypeServicesTable();
            await EnsureContactRequestsTable();
            await EnsureCanonicalMembershipSeedAsync();
            await EnsureCanonicalMembershipDataAsync();
            await EnsureDashboardTableFullSchema();
            _logger.LogInformation("DatabaseMigrationService: Schema check complete.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "DatabaseMigrationService: Schema migration failed.");
        }
    }

    private async Task AddMembershipColumnsIfMissing()
    {
        var sql = @"
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Memberships]') AND name = 'amenities')
                ALTER TABLE [dbo].[Memberships] ADD [amenities] NVARCHAR(1000) NULL;
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Memberships]') AND name = 'services')
                ALTER TABLE [dbo].[Memberships] ADD [services] NVARCHAR(1000) NULL;";
        await _context.Database.ExecuteSqlRawAsync(sql);
        _logger.LogInformation("DatabaseMigrationService: Memberships legacy columns checked.");
    }

    private async Task EnsureHotelBranchesTable()
    {
        var sql = @"
            IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'HotelBranches' AND type = 'U')
            BEGIN
                CREATE TABLE [dbo].[HotelBranches] (
                    [id]         INT IDENTITY(1,1) NOT NULL,
                    [name]       NVARCHAR(255) NOT NULL,
                    [address]    NVARCHAR(500) NULL,
                    [latitude]   DECIMAL(10,8) NULL,
                    [longitude]  DECIMAL(11,8) NULL,
                    [phone]      NVARCHAR(50) NULL,
                    [is_main]    BIT NOT NULL DEFAULT 0,
                    [is_active]  BIT NOT NULL DEFAULT 1,
                    CONSTRAINT [PK_HotelBranches] PRIMARY KEY CLUSTERED ([id] ASC)
                );
            END";

        await _context.Database.ExecuteSqlRawAsync(sql);
        _logger.LogInformation("DatabaseMigrationService: HotelBranches table checked.");
    }

    private async Task EnsureAttractionSchema()
    {
        var sql = @"
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Attractions]') AND name = 'google_maps_url')
                ALTER TABLE [dbo].[Attractions] ADD [google_maps_url] NVARCHAR(2000) NULL;
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Attractions]') AND name = 'map_preview_image_url')
                ALTER TABLE [dbo].[Attractions] ADD [map_preview_image_url] NVARCHAR(2000) NULL;
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Attractions]') AND name = 'google_place_id')
                ALTER TABLE [dbo].[Attractions] ADD [google_place_id] NVARCHAR(255) NULL;";
        await _context.Database.ExecuteSqlRawAsync(sql);
        _logger.LogInformation("DatabaseMigrationService: Attractions schema checked.");
    }

    private async Task EnsureHotelBranchSchema()
    {
        var sql = @"
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[HotelBranches]') AND name = 'google_maps_url')
                ALTER TABLE [dbo].[HotelBranches] ADD [google_maps_url] NVARCHAR(2000) NULL;
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[HotelBranches]') AND name = 'map_embed_link')
                ALTER TABLE [dbo].[HotelBranches] ADD [map_embed_link] NVARCHAR(2000) NULL;
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[HotelBranches]') AND name = 'map_preview_image_url')
                ALTER TABLE [dbo].[HotelBranches] ADD [map_preview_image_url] NVARCHAR(2000) NULL;
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[HotelBranches]') AND name = 'google_place_id')
                ALTER TABLE [dbo].[HotelBranches] ADD [google_place_id] NVARCHAR(255) NULL;";
        await _context.Database.ExecuteSqlRawAsync(sql);
        _logger.LogInformation("DatabaseMigrationService: HotelBranches schema checked.");
    }

    private async Task EnsureMembershipSchema()
    {
        var sql = @"
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Memberships]') AND name = 'display_order')
                ALTER TABLE [dbo].[Memberships] ADD [display_order] INT NOT NULL DEFAULT 0;
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Memberships]') AND name = 'point_multiplier')
                ALTER TABLE [dbo].[Memberships] ADD [point_multiplier] DECIMAL(6,2) NULL DEFAULT 1;
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Memberships]') AND name = 'benefits')
                ALTER TABLE [dbo].[Memberships] ADD [benefits] NVARCHAR(4000) NULL;
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Memberships]') AND name = 'redeem_options')
                ALTER TABLE [dbo].[Memberships] ADD [redeem_options] NVARCHAR(4000) NULL;";
        await _context.Database.ExecuteSqlRawAsync(sql);
        _logger.LogInformation("DatabaseMigrationService: Memberships schema checked.");
    }

    private async Task EnsureRoomTypeServicesTable()
    {
        var sql = @"
            IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'RoomType_Services' AND type = 'U')
            BEGIN
                CREATE TABLE [dbo].[RoomType_Services] (
                    [room_type_id] INT NOT NULL,
                    [service_id] INT NOT NULL,
                    CONSTRAINT [PK_RoomType_Services] PRIMARY KEY CLUSTERED ([room_type_id], [service_id]),
                    CONSTRAINT [FK_RoomType_Services_RoomTypes] FOREIGN KEY ([room_type_id]) REFERENCES [dbo].[Room_Types]([id]) ON DELETE CASCADE,
                    CONSTRAINT [FK_RoomType_Services_Services] FOREIGN KEY ([service_id]) REFERENCES [dbo].[Services]([id]) ON DELETE CASCADE
                );
            END";
        await _context.Database.ExecuteSqlRawAsync(sql);
        _logger.LogInformation("DatabaseMigrationService: RoomType_Services table checked.");
    }

    private async Task EnsureContactRequestsTable()
    {
        var sql = @"
            IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'ContactRequests' AND type = 'U')
            BEGIN
                CREATE TABLE [dbo].[ContactRequests] (
                    [id] INT IDENTITY(1,1) NOT NULL,
                    [name] NVARCHAR(255) NOT NULL,
                    [email] NVARCHAR(255) NOT NULL,
                    [phone] NVARCHAR(50) NULL,
                    [subject] NVARCHAR(255) NULL,
                    [message] NVARCHAR(4000) NOT NULL,
                    [status] NVARCHAR(50) NOT NULL DEFAULT 'New',
                    [created_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME(),
                    CONSTRAINT [PK_ContactRequests] PRIMARY KEY CLUSTERED ([id] ASC)
                );
            END";
        await _context.Database.ExecuteSqlRawAsync(sql);
        _logger.LogInformation("DatabaseMigrationService: ContactRequests table checked.");
    }

    private async Task EnsureCanonicalMembershipSeedAsync()
    {
        foreach (var definition in CanonicalMembershipDefinitions())
        {
            var exists = await _context.Memberships
                .IgnoreQueryFilters()
                .AnyAsync(m => m.TierName == definition.TierName && !m.IsDeleted);
            if (exists)
            {
                continue;
            }

            _context.Memberships.Add(new Membership
            {
                TierName = definition.TierName,
                MinPoints = definition.MinPoints,
                DiscountPercent = definition.DiscountPercent,
                DisplayOrder = definition.DisplayOrder,
                PointMultiplier = definition.PointMultiplier,
                Amenities = definition.Amenities,
                Services = definition.Services,
                Benefits = definition.Benefits,
                RedeemOptions = definition.RedeemOptions,
                IsDeleted = false
            });
        }

        await _context.SaveChangesAsync();
        _logger.LogInformation("DatabaseMigrationService: Canonical membership seed checked.");
    }

    private async Task EnsureCanonicalMembershipDataAsync()
    {
        var memberships = await _context.Memberships
            .IgnoreQueryFilters()
            .OrderBy(m => m.Id)
            .ToListAsync();

        foreach (var definition in CanonicalMembershipDefinitions())
        {
            var matches = memberships
                .Where(m => MembershipTierCatalog.MapToCanonicalName(m.TierName) == definition.TierName)
                .OrderBy(m => m.IsDeleted)
                .ThenBy(m => m.Id)
                .ToList();

            var primary = matches.FirstOrDefault();
            if (primary == null)
            {
                primary = new Membership();
                memberships.Add(primary);
                _context.Memberships.Add(primary);
            }

            ApplyCanonicalDefinition(primary, definition);
            primary.IsDeleted = false;

            foreach (var duplicate in matches.Skip(1))
            {
                duplicate.IsDeleted = true;
            }
        }

        foreach (var membership in memberships.Where(m => !m.IsDeleted && !MembershipTierCatalog.IsCanonical(m.TierName)))
        {
            membership.IsDeleted = true;
        }

        await _context.SaveChangesAsync();
        await RemapUsersToCanonicalMembershipAsync();
        _logger.LogInformation("DatabaseMigrationService: Canonical membership data synchronized.");
    }

    private async Task RemapUsersToCanonicalMembershipAsync()
    {
        var canonicalMemberships = await _context.Memberships
            .IgnoreQueryFilters()
            .Where(m => !m.IsDeleted && MembershipTierCatalog.CanonicalTierNames.Contains(m.TierName))
            .OrderBy(m => m.DisplayOrder)
            .ThenBy(m => m.MinPoints)
            .ToListAsync();

        var defaultTier = canonicalMemberships.FirstOrDefault(m => m.TierName == MembershipTierCatalog.Dong)
            ?? canonicalMemberships.FirstOrDefault();
        if (defaultTier == null)
        {
            return;
        }

        var membershipById = await _context.Memberships
            .IgnoreQueryFilters()
            .ToDictionaryAsync(m => m.Id);

        var users = await _context.Users
            .Include(u => u.Bookings)
                .ThenInclude(b => b.Invoice)
            .ToListAsync();

        foreach (var user in users)
        {
            membershipById.TryGetValue(user.MembershipId ?? 0, out var currentMembership);
            var shouldRemap = currentMembership == null
                || currentMembership.IsDeleted
                || !MembershipTierCatalog.IsCanonical(currentMembership.TierName);

            if (!shouldRemap)
            {
                continue;
            }

            var totalSpent = user.Bookings
                .Where(b => b.Invoice != null && b.Invoice.Status == "Paid")
                .Sum(b => b.Invoice!.FinalTotal ?? 0m);
            var totalPoints = (int)Math.Floor(totalSpent / 10000m);

            var mappedTier = canonicalMemberships
                .Where(m => (m.MinPoints ?? 0) <= totalPoints)
                .OrderBy(m => m.DisplayOrder)
                .ThenBy(m => m.MinPoints)
                .LastOrDefault() ?? defaultTier;

            user.MembershipId = mappedTier.Id;
        }

        await _context.SaveChangesAsync();
    }

    private static void ApplyCanonicalDefinition(Membership membership, CanonicalMembershipDefinition definition)
    {
        membership.TierName = definition.TierName;
        membership.DisplayOrder = definition.DisplayOrder;
        membership.MinPoints = definition.MinPoints;
        membership.DiscountPercent = definition.DiscountPercent;
        membership.PointMultiplier = definition.PointMultiplier;
        membership.Amenities = definition.Amenities;
        membership.Services = definition.Services;
        membership.Benefits = definition.Benefits;
        membership.RedeemOptions = definition.RedeemOptions;
    }

    private static CanonicalMembershipDefinition[] CanonicalMembershipDefinitions() =>
    [
        new(MembershipTierCatalog.Dong, 1, 0, 5m, 1.00m,
            "Nuoc chao mung",
            "Uu tien check-in",
            "Giam 5% gia phong\nUu tien check-in\nNuoc chao mung",
            "500 diem = voucher 50.000d"),
        new(MembershipTierCatalog.Bac, 2, 2000, 7m, 1.20m,
            "Late checkout neu con phong",
            "Giam 10% spa/F&B",
            "Giam 7% gia phong\n10% spa/F&B\nLate checkout neu con phong",
            "500 diem = voucher 50.000d\n1.500 diem = breakfast for 2"),
        new(MembershipTierCatalog.Vang, 3, 8000, 10m, 1.50m,
            "Upgrade neu con phong",
            "Giam 15% spa/F&B",
            "Giam 10% gia phong\nUpgrade neu con phong\n15% spa/F&B\nQua sinh nhat",
            "1.500 diem = breakfast for 2\n3.000 diem = airport transfer"),
        new(MembershipTierCatalog.KimCuong, 4, 20000, 15m, 2.00m,
            "Late checkout bao dam",
            "Airport transfer",
            "Giam 15% gia phong\nHo tro uu tien\nLate checkout bao dam\nAirport transfer",
            "3.000 diem = airport transfer\n5.000 diem = room upgrade 1 hang"),
    ];

    private async Task EnsureDashboardTableFullSchema()
    {
        var createSql = @"
            IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Role_Dashboard_Period_States' AND type = 'U')
            BEGIN
                CREATE TABLE [dbo].[Role_Dashboard_Period_States] (
                    [id]                INT IDENTITY(1,1) NOT NULL,
                    [role_id]           INT              NOT NULL,
                    [role_name]         NVARCHAR(100)    NOT NULL DEFAULT '',
                    [dashboard_code]    VARCHAR(100)     NOT NULL,
                    [dashboard_title]   NVARCHAR(255)    NOT NULL DEFAULT '',
                    [period_type]       VARCHAR(20)      NOT NULL,
                    [period_key]        VARCHAR(30)      NOT NULL,
                    [period_start]      DATETIME2(7)     NOT NULL,
                    [period_end]        DATETIME2(7)     NOT NULL,
                    [dashboard_json]    NVARCHAR(MAX)    NOT NULL DEFAULT '{{}}',
                    [comparison_json]   NVARCHAR(MAX)    NULL,
                    [status]            VARCHAR(20)      NOT NULL DEFAULT 'OPEN',
                    [is_current]        BIT              NOT NULL DEFAULT 0,
                    [last_event_type]   VARCHAR(100)     NULL,
                    [last_event_source] VARCHAR(100)     NULL,
                    [last_event_ref_id] INT              NULL,
                    [version]           INT              NOT NULL DEFAULT 1,
                    [created_at]        DATETIME2(7)     NOT NULL DEFAULT SYSUTCDATETIME(),
                    [updated_at]        DATETIME2(7)     NOT NULL DEFAULT SYSUTCDATETIME(),
                    [closed_at]         DATETIME2(7)     NULL,
                    [updated_by]        INT              NULL,
                    CONSTRAINT [PK_Role_Dashboard_Period_States] PRIMARY KEY CLUSTERED ([id] ASC),
                    CONSTRAINT [FK_DashPeriod_Role] FOREIGN KEY ([role_id]) REFERENCES [dbo].[Roles]([id])
                );
            END";
        await _context.Database.ExecuteSqlRawAsync(createSql);

        var alterSql = @"
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Role_Dashboard_Period_States]') AND name = 'role_name')
                ALTER TABLE [dbo].[Role_Dashboard_Period_States] ADD [role_name] NVARCHAR(100) NOT NULL DEFAULT '';
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Role_Dashboard_Period_States]') AND name = 'dashboard_title')
                ALTER TABLE [dbo].[Role_Dashboard_Period_States] ADD [dashboard_title] NVARCHAR(255) NOT NULL DEFAULT '';
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Role_Dashboard_Period_States]') AND name = 'is_current')
                ALTER TABLE [dbo].[Role_Dashboard_Period_States] ADD [is_current] BIT NOT NULL DEFAULT 0;
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Role_Dashboard_Period_States]') AND name = 'last_event_type')
                ALTER TABLE [dbo].[Role_Dashboard_Period_States] ADD [last_event_type] VARCHAR(100) NULL;
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Role_Dashboard_Period_States]') AND name = 'last_event_source')
                ALTER TABLE [dbo].[Role_Dashboard_Period_States] ADD [last_event_source] VARCHAR(100) NULL;
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Role_Dashboard_Period_States]') AND name = 'last_event_ref_id')
                ALTER TABLE [dbo].[Role_Dashboard_Period_States] ADD [last_event_ref_id] INT NULL;
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Role_Dashboard_Period_States]') AND name = 'created_at')
                ALTER TABLE [dbo].[Role_Dashboard_Period_States] ADD [created_at] DATETIME2(7) NOT NULL DEFAULT SYSUTCDATETIME();
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Role_Dashboard_Period_States]') AND name = 'closed_at')
                ALTER TABLE [dbo].[Role_Dashboard_Period_States] ADD [closed_at] DATETIME2(7) NULL;";
        await _context.Database.ExecuteSqlRawAsync(alterSql);

        var indexSql = @"
            IF NOT EXISTS (
                SELECT 1 FROM sys.indexes
                WHERE name = N'UX_RoleDashboardPeriod_Role_Dashboard_Period'
                  AND object_id = OBJECT_ID(N'[dbo].[Role_Dashboard_Period_States]')
            )
            BEGIN
                CREATE UNIQUE INDEX [UX_RoleDashboardPeriod_Role_Dashboard_Period]
                    ON [dbo].[Role_Dashboard_Period_States] (role_id, dashboard_code, period_type, period_key);
            END";
        await _context.Database.ExecuteSqlRawAsync(indexSql);

        _logger.LogInformation("DatabaseMigrationService: Role_Dashboard_Period_States table checked.");
    }

    private sealed record CanonicalMembershipDefinition(
        string TierName,
        int DisplayOrder,
        int MinPoints,
        decimal DiscountPercent,
        decimal PointMultiplier,
        string Amenities,
        string Services,
        string Benefits,
        string RedeemOptions
    );
}
