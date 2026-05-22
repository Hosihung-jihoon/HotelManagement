using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace HotelManagement.API.Migrations
{
    /// <inheritdoc />
    public partial class SeedArticlesAndCategories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Article_Categories",
                columns: new[] { "id", "name" },
                values: new object[,]
                {
                    { 1, "Tin tức" },
                    { 2, "Du lịch" },
                    { 3, "Ẩm thực" },
                    { 4, "Khuyến mãi" }
                });

            migrationBuilder.InsertData(
                table: "Articles",
                columns: new[] { "id", "attraction_id", "author_id", "category_id", "content", "is_active", "published_at", "slug", "thumbnail_url", "title" },
                values: new object[,]
                {
                    { 1, null, 1, 1, "We are thrilled to announce the launch of our brand-new Luxury Suite Collection, featuring panoramic city views, private butler service, and state-of-the-art amenities.", true, new DateTime(2025, 5, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), "grand-opening-luxury-suite-collection", "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80", "Grand Opening: Our New Luxury Suite Collection" },
                    { 2, null, 1, 2, "Beyond the famous landmarks, Saigon hides charming alleyways, rooftop bars and local markets that most tourists miss. Here are our top picks.", true, new DateTime(2025, 5, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), "top-5-hidden-gems-ho-chi-minh-city", "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80", "Top 5 Hidden Gems in Ho Chi Minh City" },
                    { 3, null, 2, 3, "Our executive chef presents a curated menu blending Vietnamese heritage with contemporary French technique. Discover the stories behind each signature dish.", true, new DateTime(2025, 5, 18, 0, 0, 0, 0, DateTimeKind.Unspecified), "culinary-journey-signature-dishes", "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80", "A Culinary Journey: Signature Dishes at Our Restaurant" },
                    { 4, null, 1, 4, "Book now and enjoy 30% discount on all room categories from June to August 2025. Includes complimentary breakfast and late check-out until 2 PM.", true, new DateTime(2025, 5, 20, 0, 0, 0, 0, DateTimeKind.Unspecified), "summer-special-30-off-all-rooms", "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80", "Summer Special: 30% Off All Room Types" },
                    { 5, null, 2, 2, "Escape the city for a day and explore the Mekong Delta, Cu Chi Tunnels, or the beaches of Vung Tau — all within two hours from our hotel.", true, new DateTime(2025, 5, 22, 0, 0, 0, 0, DateTimeKind.Unspecified), "weekend-getaway-day-trips-from-saigon", "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80", "Weekend Getaway: Day Trips from Saigon" },
                    { 6, null, 1, 1, "We have committed to reducing our carbon footprint by 50% by 2030 through solar energy, zero-waste kitchens, and eco-friendly room amenities.", true, new DateTime(2025, 6, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "sustainability-pledge-green-hotel-initiative", "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80", "Sustainability Pledge: Our Green Hotel Initiative" },
                    { 7, null, 2, 3, "Our morning buffet goes far beyond the usual. From hand-rolled bánh mì to steaming bowls of bún bò Huế, every morning is a new discovery.", true, new DateTime(2025, 6, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), "pho-beyond-vietnamese-breakfast-reinvented", "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800&q=80", "Pho & Beyond: Vietnamese Breakfast Reinvented" },
                    { 8, null, 1, 4, "Celebrate our anniversary month with double loyalty points on every booking made in June 2025. Redeem points for free nights, spa vouchers, and dining credits.", true, new DateTime(2025, 6, 8, 0, 0, 0, 0, DateTimeKind.Unspecified), "loyalty-members-double-points-june", "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80", "Loyalty Members: Double Points in June" },
                    { 9, null, 2, 2, "Planning a trip to Ha Long Bay? We have partnered with premium cruise operators to offer exclusive packages for our hotel guests at preferential rates.", true, new DateTime(2025, 6, 12, 0, 0, 0, 0, DateTimeKind.Unspecified), "exploring-ha-long-bay-cruise-guide", "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&q=80", "Exploring Ha Long Bay: A Cruise Guide" },
                    { 10, null, 1, 1, "Following multiple industry awards, our rooftop spa now operates around the clock. Enjoy deep-tissue massages, aromatherapy, and hydrotherapy any time of day or night.", true, new DateTime(2025, 6, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), "award-winning-spa-open-24-7", "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80", "Award-Winning Spa: Now Open 24/7" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Articles",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Articles",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Articles",
                keyColumn: "id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Articles",
                keyColumn: "id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Articles",
                keyColumn: "id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Articles",
                keyColumn: "id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Articles",
                keyColumn: "id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Articles",
                keyColumn: "id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Articles",
                keyColumn: "id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "Articles",
                keyColumn: "id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "Article_Categories",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Article_Categories",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Article_Categories",
                keyColumn: "id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Article_Categories",
                keyColumn: "id",
                keyValue: 4);
        }
    }
}
