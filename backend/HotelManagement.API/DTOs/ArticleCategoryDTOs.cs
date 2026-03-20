namespace HotelManagement.API.DTOs;

// ========== Response DTOs ==========

public class ArticleCategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class ArticleCategoryDetailDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int TotalArticles { get; set; }
}

// ========== Request DTOs ==========

public class CreateArticleCategoryDto
{
    public string Name { get; set; } = string.Empty;
}

public class UpdateArticleCategoryDto
{
    public string Name { get; set; } = string.Empty;
}
