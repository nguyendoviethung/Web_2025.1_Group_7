using AutoMapper;
using backend.DTOs.Book;
using backend.DTOs.Shared;
using backend.Interfaces;

namespace backend.Services.Book
{
    public class BookService : IBookService
    {
        private readonly IBookRepository _bookRepository;
        private readonly IMapper _mapper;

        public BookService(IBookRepository bookRepository, IMapper mapper)
        {
            _bookRepository = bookRepository;
            _mapper = mapper;
        }

        public async Task<PagedResult<BookDto>> GetAllBooksAsync(BookQueryParameters queryParameters)
        {
            var pagedBooks = await _bookRepository.GetAllAsync(queryParameters);
            var bookDtos = _mapper.Map<List<BookDto>>(pagedBooks.Items);
            return new PagedResult<BookDto>(bookDtos, pagedBooks.TotalCount, pagedBooks.PageNumber, pagedBooks.PageSize);
        }

        public async Task<BookDto?> GetBookByIdAsync(int id)
        {
            var book = await _bookRepository.GetByIdAsync(id);
            return book == null ? null : _mapper.Map<BookDto>(book);
        }

        public async Task<BookDto> CreateBookAsync(CreateBookDto createBookDto)
        {
            var bookModel = _mapper.Map<backend.Models.Book>(createBookDto);
            var newBook = await _bookRepository.AddAsync(bookModel, createBookDto.AuthorIds, createBookDto.CategoryIds);
            return _mapper.Map<BookDto>(newBook);
        }

        public async Task<bool> UpdateBookAsync(int id, UpdateBookDto updateBookDto)
        {
            var book = await _bookRepository.GetByIdAsync(id);
            if (book == null)
            {
                return false;
            }

            _mapper.Map(updateBookDto, book);
            await _bookRepository.UpdateAsync(book, updateBookDto.AuthorIds, updateBookDto.CategoryIds);

            return true;
        }

        public async Task<bool> DeleteBookAsync(int id)
        {
            var book = await _bookRepository.GetByIdAsync(id);
            if (book == null)
            {
                return false;
            }

            await _bookRepository.DeleteAsync(id);
            return true;
        }
    }
}