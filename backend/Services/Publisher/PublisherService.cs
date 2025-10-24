using AutoMapper;
using backend.DTOs.Publisher;
using backend.Interfaces;

namespace backend.Services.Publisher
{
    public class PublisherService : IPublisherService
    {
        private readonly IPublisherRepository _publisherRepository;
        private readonly IMapper _mapper;

        public PublisherService(IPublisherRepository publisherRepository, IMapper mapper)
        {
            _publisherRepository = publisherRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<PublisherDto>> GetAllPublishersAsync()
        {
            var publishers = await _publisherRepository.GetAllAsync();
            return _mapper.Map<IEnumerable<PublisherDto>>(publishers);
        }

        public async Task<PublisherDto?> GetPublisherByIdAsync(int id)
        {
            var publisher = await _publisherRepository.GetByIdAsync(id);
            return publisher == null ? null : _mapper.Map<PublisherDto>(publisher);
        }

        public async Task<PublisherDto> CreatePublisherAsync(CreatePublisherDto createPublisherDto)
        {
            var publisherModel = _mapper.Map<backend.Models.Publisher>(createPublisherDto);
            var newPublisher = await _publisherRepository.AddAsync(publisherModel);
            return _mapper.Map<PublisherDto>(newPublisher);
        }

        public async Task<bool> UpdatePublisherAsync(int id, UpdatePublisherDto updatePublisherDto)
        {
            var publisher = await _publisherRepository.GetByIdAsync(id);
            if (publisher == null)
            {
                return false;
            }

            _mapper.Map(updatePublisherDto, publisher);
            await _publisherRepository.UpdateAsync(publisher);

            return true;
        }

        public async Task<bool> DeletePublisherAsync(int id)
        {
            var publisher = await _publisherRepository.GetByIdAsync(id);
            if (publisher == null)
            {
                return false;
            }

            await _publisherRepository.DeleteAsync(id);
            return true;
        }
    }
}