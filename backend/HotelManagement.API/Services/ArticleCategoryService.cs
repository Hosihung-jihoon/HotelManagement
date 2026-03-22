using HotelManagement.API.DTOs;
using HotelManagement.API.Models;
using HotelManagement.API.Repositories;

namespace HotelManagement.API.Services;

public class ArticleCategoryService : IArticleCategoryService
{
    private readonly IArticleCategoryRepository _repository;

    public ArticleCategoryService(IArticleCategoryRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<ArticleCategoryDto>> GetAllAsync()
    {
        var entities = await _repository.GetAllAsync();

        return entities.Select(e => new ArticleCategoryDto
        {
            Id = e.Id,
            Name = e.Name
        });
    }

    public async Task<ArticleCategoryDetailDto?> GetByIdAsync(int id)
    {
        var entity = await _repository.GetByIdWithArticlesAsync(id);
        if (entity == null) return null;

        return new ArticleCategoryDetailDto
        {
            Id = entity.Id,
            Name = entity.Name,
            TotalArticles = entity.Articles?.Count ?? 0
        };
    }

    public async Task<ArticleCategoryDto> CreateAsync(CreateArticleCategoryDto dto)
    {
        var entity = new ArticleCategory
        {
            Name = dto.Name
        };

        var created = await _repository.CreateAsync(entity);

        return new ArticleCategoryDto
        {
            Id = created.Id,
            Name = created.Name
        };
    }

    public async Task<bool> UpdateAsync(int id, UpdateArticleCategoryDto dto)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null) return false;

        entity.Name = dto.Name;

        await _repository.UpdateAsync(entity);
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        if (!await _repository.ExistsAsync(id)) return false;

        await _repository.DeleteAsync(id);
        return true;
    }
}
