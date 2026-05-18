using HotelManagement.API.Data;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.API.Services;

/// <summary>
/// Chạy khi startup: tự động thêm cột / bảng còn thiếu (Database First, idempotent).
/// </summary>
public class DatabaseMigrationService
{
    private readonly HotelDbContext _context;
    private readonly ILogger<DatabaseMigrationService> _logger;

    public DatabaseMigrationService(HotelDbContext context, ILogger<DatabaseMigrationService> logger)
    {
        _context = context;
        _logger  = logger;
    }

    public async Task RunAsync()
    {
        _logger.LogInformation("DatabaseMigrationService: Checking for missing schema...");
        if (_context.Database.IsSqlite())
        {
            _logger.LogInformation("DatabaseMigrationService: Running on SQLite. Skipping SQL Server specific schema checks.");
            return;
        }
        try
        {
            await AddMembershipColumnsIfMissing();
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
        _logger.LogInformation("DatabaseMigrationService: Memberships columns checked.");
    }

    private async Task EnsureDashboardTableFullSchema()
    {
        // Step 1: Create table with full schema if not exists
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
                    [dashboard_json]    NVARCHAR(MAX)    NOT NULL DEFAULT '{}',
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

        // Step 2: Add missing columns for tables created before schema update
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

        // Step 3: Create unique index if not exists
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
}
