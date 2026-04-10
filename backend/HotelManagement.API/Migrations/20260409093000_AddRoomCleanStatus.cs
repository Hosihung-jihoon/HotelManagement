using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HotelManagement.API.Migrations
{
    public partial class AddRoomCleanStatus : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "cleaning_status",
                table: "Rooms",
                maxLength: 50,
                nullable: true,
                defaultValue: "clean");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "cleaning_status",
                table: "Rooms");
        }
    }
}
