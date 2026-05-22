using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HotelManagement.API.Migrations
{
    /// <inheritdoc />
    public partial class AddArticleExcerptAndReadTime : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "excerpt",
                table: "Articles",
                type: "TEXT",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "read_time",
                table: "Articles",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Articles",
                keyColumn: "id",
                keyValue: 1,
                columns: new[] { "excerpt", "read_time" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "Articles",
                keyColumn: "id",
                keyValue: 2,
                columns: new[] { "excerpt", "read_time" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "Articles",
                keyColumn: "id",
                keyValue: 3,
                columns: new[] { "excerpt", "read_time" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "Articles",
                keyColumn: "id",
                keyValue: 4,
                columns: new[] { "excerpt", "read_time" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "Articles",
                keyColumn: "id",
                keyValue: 5,
                columns: new[] { "excerpt", "read_time" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "Articles",
                keyColumn: "id",
                keyValue: 6,
                columns: new[] { "excerpt", "read_time" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "Articles",
                keyColumn: "id",
                keyValue: 7,
                columns: new[] { "excerpt", "read_time" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "Articles",
                keyColumn: "id",
                keyValue: 8,
                columns: new[] { "excerpt", "read_time" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "Articles",
                keyColumn: "id",
                keyValue: 9,
                columns: new[] { "excerpt", "read_time" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "Articles",
                keyColumn: "id",
                keyValue: 10,
                columns: new[] { "excerpt", "read_time" },
                values: new object[] { null, null });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "excerpt",
                table: "Articles");

            migrationBuilder.DropColumn(
                name: "read_time",
                table: "Articles");
        }
    }
}
