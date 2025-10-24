using backend.Models;

namespace backend.Interfaces
{
    public interface IBookRepository
    {
        Task<IEnumerable<Book>> GetAllAsync();
        Task<Book?> GetByIdAsync(int id);
        Task<Book> AddAsync(Book book, List<int> authorIds, List<int> categoryIds);
        Task<Book> UpdateAsync(Book book, List<int> authorIds, List<int> categoryIds);
        Task DeleteAsync(int id);
    }
}