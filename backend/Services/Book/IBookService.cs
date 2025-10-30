using backend.DTOs.Book;
using backend.DTOs.Shared;

namespace backend.Services.Book
{
    public interface IBookService
    {
        Task<PagedResult<BookDto>> GetAllBooksAsync(BookQueryParameters queryParameters);
        Task<BookDto?> GetBookByIdAsync(int id);
        Task<BookDto> CreateBookAsync(CreateBookDto createBookDto);
        Task<bool> UpdateBookAsync(int id, UpdateBookDto updateBookDto);
        Task<bool> DeleteBookAsync(int id);
    }
}