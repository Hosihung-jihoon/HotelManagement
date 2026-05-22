using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HotelManagement.API.Migrations
{
    /// <inheritdoc />
    public partial class AddAttractionViFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "description_vi",
                table: "Attractions",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "name_vi",
                table: "Attractions",
                type: "TEXT",
                maxLength: 255,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "description_vi",
                table: "Attractions");

            migrationBuilder.DropColumn(
                name: "name_vi",
                table: "Attractions");
        }
    }
}
