using Microsoft.AspNetCore.Http;

using Microsoft.AspNetCore.Http;

namespace HotelManagement.API.DTOs;

// ========== Response DTOs ==========

public class ArticleDto
{
    public int Id { get; set; }
    public int? CategoryId { get; set; }
    public int? AuthorId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Slug { get; set; }
    public string? ThumbnailUrl { get; set; }
    public DateTime? PublishedAt { get; set; }
    
    // Additional helpful properties for listing
    public string? CategoryName { get; set; }
    public string? AuthorName { get; set; }
}

public class ArticleDetailDto
{
    public int Id { get; set; }
    public int? CategoryId { get; set; }
    public int? AuthorId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Slug { get; set; }
    public string? Content { get; set; }
    public string? ThumbnailUrl { get; set; }
    public DateTime? PublishedAt { get; set; }
    
    // Additional helpful properties for details
    public string? CategoryName { get; set; }
    public string? AuthorName { get; set; }
}

// ========== Request DTOs ==========

public class CreateArticleDto
{
    public int? CategoryId { get; set; }
    public int? AuthorId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Slug { get; set; }
    public string? Content { get; set; }
    public IFormFile? ThumbnailFile { get; set; }
    public string? ThumbnailUrl { get; set; }
    public DateTime? PublishedAt { get; set; }
}

public class UpdateArticleDto
{
    public int? CategoryId { get; set; }
    public int? AuthorId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Slug { get; set; }
    public string? Content { get; set; }
    public IFormFile? ThumbnailFile { get; set; }
    public string? ThumbnailUrl { get; set; }
    public DateTime? PublishedAt { get; set; }
}
