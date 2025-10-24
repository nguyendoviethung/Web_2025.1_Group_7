using backend.DTOs.Publisher;

namespace backend.Services.Publisher
{
    public interface IPublisherService
    {
        Task<IEnumerable<PublisherDto>> GetAllPublishersAsync();
        Task<PublisherDto?> GetPublisherByIdAsync(int id);
        Task<PublisherDto> CreatePublisherAsync(CreatePublisherDto createPublisherDto);
        Task<bool> UpdatePublisherAsync(int id, UpdatePublisherDto updatePublisherDto);
        Task<bool> DeletePublisherAsync(int id);
    }
}