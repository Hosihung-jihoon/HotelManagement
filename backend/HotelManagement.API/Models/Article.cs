using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HotelManagement.API.Models;

[Table("Articles")]
public class Article
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("category_id")]
    public int? CategoryId { get; set; }

    [Column("author_id")]
    public int? AuthorId { get; set; }

    [Required]
    [Column("title")]
    public string Title { get; set; } = string.Empty;

    [Column("slug")]
    [MaxLength(255)]
    public string? Slug { get; set; }

    [Column("content")]
    public string? Content { get; set; }

    [Column("thumbnail_url")]
    public string? ThumbnailUrl { get; set; }

    [Column("published_at")]
    public DateTime? PublishedAt { get; set; }

    // Navigation
    [ForeignKey("CategoryId")]
    public ArticleCategory? Category { get; set; }

    [ForeignKey("AuthorId")]
    public User? Author { get; set; }
}
