using HotelManagement.API.DTOs;
using HotelManagement.API.Models;
using HotelManagement.API.Repositories;

namespace HotelManagement.API.Services;

public class ArticleService : IArticleService
{
    private readonly IArticleRepository _repository;

    public ArticleService(IArticleRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<ArticleDto>> GetAllAsync()
    {
        var entities = await _repository.GetAllWithDetailsAsync();

        return entities.Select(e => new ArticleDto
        {
            Id = e.Id,
            CategoryId = e.CategoryId,
            AuthorId = e.AuthorId,
            Title = e.Title,
            Slug = e.Slug,
            ThumbnailUrl = e.ThumbnailUrl,
            PublishedAt = e.PublishedAt,
            IsActive = e.IsActive,
            AttractionId = e.AttractionId,
            CategoryName = e.Category?.Name,
            AuthorName = e.Author?.FullName,
            AttractionName = e.Attraction?.Name
        });
    }

    public async Task<ArticleDetailDto?> GetByIdAsync(int id)
    {
        var entity = await _repository.GetByIdWithDetailsAsync(id);
        if (entity == null) return null;

        return new ArticleDetailDto
        {
            Id = entity.Id,
            CategoryId = entity.CategoryId,
            AuthorId = entity.AuthorId,
            Title = entity.Title,
            Slug = entity.Slug,
            Content = entity.Content,
            ThumbnailUrl = entity.ThumbnailUrl,
            PublishedAt = entity.PublishedAt,
            IsActive = entity.IsActive,
            AttractionId = entity.AttractionId,
            CategoryName = entity.Category?.Name,
            AuthorName = entity.Author?.FullName,
            AttractionName = entity.Attraction?.Name
        };
    }

    public async Task<ArticleDetailDto?> GetBySlugAsync(string slug)
    {
        var entity = await _repository.GetBySlugWithDetailsAsync(slug);
        if (entity == null) return null;

        return new ArticleDetailDto
        {
            Id = entity.Id,
            CategoryId = entity.CategoryId,
            AuthorId = entity.AuthorId,
            Title = entity.Title,
            Slug = entity.Slug,
            Content = entity.Content,
            ThumbnailUrl = entity.ThumbnailUrl,
            PublishedAt = entity.PublishedAt,
            IsActive = entity.IsActive,
            AttractionId = entity.AttractionId,
            CategoryName = entity.Category?.Name,
            AuthorName = entity.Author?.FullName,
            AttractionName = entity.Attraction?.Name
        };
    }

    public async Task<ArticleDto> CreateAsync(CreateArticleDto dto)
    {
        var entity = new Article
        {
            CategoryId = dto.CategoryId,
            AuthorId = dto.AuthorId,
            Title = dto.Title,
            Slug = dto.Slug,
            Content = dto.Content,
            ThumbnailUrl = dto.ThumbnailUrl,
            PublishedAt = dto.PublishedAt ?? DateTime.UtcNow,
            IsActive = dto.IsActive,
            AttractionId = dto.AttractionId
        };

        var created = await _repository.CreateAsync(entity);

        // Fetch again to get related data like CategoryName and AuthorName
        return await MapToDtoAsync(created);
    }

    public async Task<bool> UpdateAsync(int id, UpdateArticleDto dto)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null) return false;

        entity.CategoryId = dto.CategoryId;
        entity.AuthorId = dto.AuthorId;
        entity.Title = dto.Title;
        entity.Slug = dto.Slug;
        entity.Content = dto.Content;
        entity.ThumbnailUrl = dto.ThumbnailUrl;
        entity.PublishedAt = dto.PublishedAt;
        entity.AttractionId = dto.AttractionId;
        if (dto.IsActive.HasValue) entity.IsActive = dto.IsActive.Value;

        await _repository.UpdateAsync(entity);
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        if (!await _repository.ExistsAsync(id)) return false;

        await _repository.DeleteAsync(id);
        return true;
    }

    private async Task<ArticleDto> MapToDtoAsync(Article entity)
    {
        var fullEntity = await _repository.GetByIdWithDetailsAsync(entity.Id);
        if (fullEntity == null) return new ArticleDto();

        return new ArticleDto
        {
            Id = fullEntity.Id,
            CategoryId = fullEntity.CategoryId,
            AuthorId = fullEntity.AuthorId,
            Title = fullEntity.Title,
            Slug = fullEntity.Slug,
            ThumbnailUrl = fullEntity.ThumbnailUrl,
            PublishedAt = fullEntity.PublishedAt,
            IsActive = fullEntity.IsActive,
            AttractionId = fullEntity.AttractionId,
            CategoryName = fullEntity.Category?.Name,
            AuthorName = fullEntity.Author?.FullName,
            AttractionName = fullEntity.Attraction?.Name
        };
    }
}
