using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HotelManagement.API.Migrations
{
    /// <inheritdoc />
    public partial class AddHotelBranchesAndExtraColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "amenities",
                table: "Memberships",
                type: "TEXT",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "benefits",
                table: "Memberships",
                type: "TEXT",
                maxLength: 4000,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "display_order",
                table: "Memberships",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "point_multiplier",
                table: "Memberships",
                type: "decimal(6,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "redeem_options",
                table: "Memberships",
                type: "TEXT",
                maxLength: 4000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "services",
                table: "Memberships",
                type: "TEXT",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "google_maps_url",
                table: "Attractions",
                type: "TEXT",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "google_place_id",
                table: "Attractions",
                type: "TEXT",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "map_preview_image_url",
                table: "Attractions",
                type: "TEXT",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ContactRequests",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    name = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false),
                    email = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false),
                    phone = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    subject = table.Column<string>(type: "TEXT", maxLength: 255, nullable: true),
                    message = table.Column<string>(type: "TEXT", maxLength: 4000, nullable: false),
                    status = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    created_at = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContactRequests", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "HotelBranches",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    name = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false),
                    address = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    google_maps_url = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                    map_embed_link = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                    map_preview_image_url = table.Column<string>(type: "TEXT", maxLength: 2000, nullable: true),
                    google_place_id = table.Column<string>(type: "TEXT", maxLength: 255, nullable: true),
                    latitude = table.Column<decimal>(type: "decimal(10,8)", nullable: true),
                    longitude = table.Column<decimal>(type: "decimal(11,8)", nullable: true),
                    phone = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    is_main = table.Column<bool>(type: "INTEGER", nullable: false),
                    is_active = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HotelBranches", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Role_Dashboard_Period_States",
                columns: table => new
                {
                    id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    role_id = table.Column<int>(type: "INTEGER", nullable: false),
                    role_name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    dashboard_code = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    dashboard_title = table.Column<string>(type: "TEXT", maxLength: 255, nullable: false),
                    period_type = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    period_key = table.Column<string>(type: "TEXT", maxLength: 30, nullable: false),
                    period_start = table.Column<DateTime>(type: "TEXT", nullable: false),
                    period_end = table.Column<DateTime>(type: "TEXT", nullable: false),
                    dashboard_json = table.Column<string>(type: "TEXT", nullable: false),
                    comparison_json = table.Column<string>(type: "TEXT", nullable: true),
                    status = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    is_current = table.Column<bool>(type: "INTEGER", nullable: false),
                    last_event_type = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    last_event_source = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    last_event_ref_id = table.Column<int>(type: "INTEGER", nullable: true),
                    version = table.Column<int>(type: "INTEGER", nullable: false),
                    created_at = table.Column<DateTime>(type: "TEXT", nullable: false),
                    updated_at = table.Column<DateTime>(type: "TEXT", nullable: false),
                    closed_at = table.Column<DateTime>(type: "TEXT", nullable: true),
                    updated_by = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Role_Dashboard_Period_States", x => x.id);
                    table.ForeignKey(
                        name: "FK_Role_Dashboard_Period_States_Roles_role_id",
                        column: x => x.role_id,
                        principalTable: "Roles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RoomType_Services",
                columns: table => new
                {
                    room_type_id = table.Column<int>(type: "INTEGER", nullable: false),
                    service_id = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoomType_Services", x => new { x.room_type_id, x.service_id });
                    table.ForeignKey(
                        name: "FK_RoomType_Services_Room_Types_room_type_id",
                        column: x => x.room_type_id,
                        principalTable: "Room_Types",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RoomType_Services_Services_service_id",
                        column: x => x.service_id,
                        principalTable: "Services",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Role_Dashboard_Period_States_role_id",
                table: "Role_Dashboard_Period_States",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "IX_RoomType_Services_service_id",
                table: "RoomType_Services",
                column: "service_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ContactRequests");

            migrationBuilder.DropTable(
                name: "HotelBranches");

            migrationBuilder.DropTable(
                name: "Role_Dashboard_Period_States");

            migrationBuilder.DropTable(
                name: "RoomType_Services");

            migrationBuilder.DropColumn(
                name: "amenities",
                table: "Memberships");

            migrationBuilder.DropColumn(
                name: "benefits",
                table: "Memberships");

            migrationBuilder.DropColumn(
                name: "display_order",
                table: "Memberships");

            migrationBuilder.DropColumn(
                name: "point_multiplier",
                table: "Memberships");

            migrationBuilder.DropColumn(
                name: "redeem_options",
                table: "Memberships");

            migrationBuilder.DropColumn(
                name: "services",
                table: "Memberships");

            migrationBuilder.DropColumn(
                name: "google_maps_url",
                table: "Attractions");

            migrationBuilder.DropColumn(
                name: "google_place_id",
                table: "Attractions");

            migrationBuilder.DropColumn(
                name: "map_preview_image_url",
                table: "Attractions");
        }
    }
}
