using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace HotelManagement.API.Migrations
{
    /// <inheritdoc />
    public partial class SeedUsersFromAccountMd : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "id", "email", "full_name", "membership_id", "password_hash", "phone", "role_id", "status" },
                values: new object[,]
                {
                    { 1, "vibecoding209@gmail.com", "Admin System", null, "$2a$11$VQ8eIzRm2MjRl2gjFZWon.YQkCGooN1pMFhNEn6Yaf/PLq.nqkXIG", null, 1, true },
                    { 2, "manager@hotel.com", "Hotel Manager", null, "$2a$11$w0a9bylqBIL4UxKAX1DzLeHzGGcyv703ndlrU5eGKzey3jei38sP6", null, 1, true },
                    { 3, "reception1@hotel.com", "Receptionist 1", null, "$2a$11$moigqG6DqvHapVXW50MJ5.W1UeoELEqFL/nDBgIgbakaW.mG7DRoW", null, 2, true },
                    { 4, "reception2@hotel.com", "Receptionist 2", null, "$2a$11$moigqG6DqvHapVXW50MJ5.W1UeoELEqFL/nDBgIgbakaW.mG7DRoW", null, 2, true },
                    { 5, "accountant@hotel.com", "Accountant", null, "$2a$11$moigqG6DqvHapVXW50MJ5.W1UeoELEqFL/nDBgIgbakaW.mG7DRoW", null, 1, true },
                    { 6, "hunglm@vaa.edu.vn", "Hung Le", null, "$2a$11$moigqG6DqvHapVXW50MJ5.W1UeoELEqFL/nDBgIgbakaW.mG7DRoW", null, 4, true },
                    { 7, "manhung08062@gmail.com", "Manh Hung", null, "$2a$11$moigqG6DqvHapVXW50MJ5.W1UeoELEqFL/nDBgIgbakaW.mG7DRoW", null, 4, true },
                    { 8, "dainguyen1254@gmail.com", "Dai Nguyen", null, "$2a$11$moigqG6DqvHapVXW50MJ5.W1UeoELEqFL/nDBgIgbakaW.mG7DRoW", null, 4, true },
                    { 9, "nguyenbinhan2707@gmail.com", "An Nguyen", null, "$2a$11$moigqG6DqvHapVXW50MJ5.W1UeoELEqFL/nDBgIgbakaW.mG7DRoW", null, 4, true }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "id",
                keyValue: 9);
        }
    }
}
