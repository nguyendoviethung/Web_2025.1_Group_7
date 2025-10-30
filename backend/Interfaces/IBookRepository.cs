using backend.DTOs.Book;
using backend.DTOs.Shared;
using backend.Models;

namespace backend.Interfaces
{
    public interface IBookRepository
    {
        Task<PagedResult<Book>> GetAllAsync(BookQueryParameters queryParameters);
        Task<Book?> GetByIdAsync(int id);
        Task<Book> AddAsync(Book book, List<int> authorIds, List<int> categoryIds);
        Task<Book> UpdateAsync(Book book, List<int> authorIds, List<int> categoryIds);
        Task DeleteAsync(int id);
    }
}