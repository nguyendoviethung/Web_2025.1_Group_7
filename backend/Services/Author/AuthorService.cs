using AutoMapper;
using backend.DTOs.Author;
using backend.Interfaces;
using backend.Models;

namespace backend.Services.Author
{
    public class AuthorService : IAuthorService
    {
        private readonly IAuthorRepository _authorRepository;
        private readonly IMapper _mapper;

        public AuthorService(IAuthorRepository authorRepository, IMapper mapper)
        {
            _authorRepository = authorRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<AuthorDto>> GetAllAuthorsAsync()
        {
            var authors = await _authorRepository.GetAllAsync();
            return _mapper.Map<IEnumerable<AuthorDto>>(authors);
        }

        public async Task<AuthorDto?> GetAuthorByIdAsync(int id)
        {
            var author = await _authorRepository.GetByIdAsync(id);
            return author == null ? null : _mapper.Map<AuthorDto>(author);
        }

        public async Task<AuthorDto> CreateAuthorAsync(CreateAuthorDto createAuthorDto)
        {
            var authorModel = _mapper.Map<Models.Author>(createAuthorDto);
            var newAuthor = await _authorRepository.AddAsync(authorModel);
            return _mapper.Map<AuthorDto>(newAuthor);
        }

        public async Task<bool> UpdateAuthorAsync(int id, UpdateAuthorDto updateAuthorDto)
        {
            var author = await _authorRepository.GetByIdAsync(id);
            if (author == null)
            {
                return false;
            }

            _mapper.Map(updateAuthorDto, author);
            await _authorRepository.UpdateAsync(author);

            return true;
        }

        public async Task<bool> DeleteAuthorAsync(int id)
        {
            var author = await _authorRepository.GetByIdAsync(id);
            if (author == null)
            {
                return false;
            }

            await _authorRepository.DeleteAsync(id);
            return true;
        }
    }
}