using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HotelManagement.API.Migrations
{
    /// <inheritdoc />
    public partial class AddVoucherFieldsFix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_Users_UserId",
                table: "Notifications");

            migrationBuilder.RenameColumn(
                name: "Type",
                table: "Notifications",
                newName: "type");

            migrationBuilder.RenameColumn(
                name: "Title",
                table: "Notifications",
                newName: "title");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "Notifications",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "Notifications",
                newName: "user_id");

            migrationBuilder.RenameColumn(
                name: "Message",
                table: "Notifications",
                newName: "content");

            migrationBuilder.RenameColumn(
                name: "IsRead",
                table: "Notifications",
                newName: "is_read");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Notifications",
                newName: "created_at");

            migrationBuilder.RenameIndex(
                name: "IX_Notifications_UserId",
                table: "Notifications",
                newName: "IX_Notifications_user_id");

            migrationBuilder.AddColumn<string>(
                name: "reference_link",
                table: "Notifications",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_Users_user_id",
                table: "Notifications",
                column: "user_id",
                principalTable: "Users",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_Users_user_id",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "reference_link",
                table: "Notifications");

            migrationBuilder.RenameColumn(
                name: "type",
                table: "Notifications",
                newName: "Type");

            migrationBuilder.RenameColumn(
                name: "title",
                table: "Notifications",
                newName: "Title");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "Notifications",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "user_id",
                table: "Notifications",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "is_read",
                table: "Notifications",
                newName: "IsRead");

            migrationBuilder.RenameColumn(
                name: "created_at",
                table: "Notifications",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "content",
                table: "Notifications",
                newName: "Message");

            migrationBuilder.RenameIndex(
                name: "IX_Notifications_user_id",
                table: "Notifications",
                newName: "IX_Notifications_UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_Users_UserId",
                table: "Notifications",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "id");
        }
    }
}
