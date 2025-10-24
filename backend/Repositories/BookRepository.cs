using backend.Data;
using backend.Interfaces;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories
{
    public class BookRepository : IBookRepository
    {
        private readonly LibraryDbContext _context;

        public BookRepository(LibraryDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Book>> GetAllAsync()
        {
            return await _context.Books
                .Include(b => b.Publisher)
                .Include(b => b.BookAuthors).ThenInclude(ba => ba.Author)
                .Include(b => b.BookCategories).ThenInclude(bc => bc.Category)
                .ToListAsync();
        }

        public async Task<Book?> GetByIdAsync(int id)
        {
            return await _context.Books
                .Include(b => b.Publisher)
                .Include(b => b.BookAuthors).ThenInclude(ba => ba.Author)
                .Include(b => b.BookCategories).ThenInclude(bc => bc.Category)
                .FirstOrDefaultAsync(b => b.BookId == id);
        }

        public async Task<Book> AddAsync(Book book, List<int> authorIds, List<int> categoryIds)
        {
            book.BookAuthors = authorIds.Select(authorId => new BookAuthor { AuthorId = authorId }).ToList();
            book.BookCategories = categoryIds.Select(categoryId => new BookCategory { CategoryId = categoryId }).ToList();

            _context.Books.Add(book);
            await _context.SaveChangesAsync();
            return book;
        }

        public async Task<Book> UpdateAsync(Book book, List<int> authorIds, List<int> categoryIds)
        {
            // Update scalar properties
            _context.Entry(book).State = EntityState.Modified;

            // Update many-to-many relationships
            book.BookAuthors = authorIds.Select(authorId => new BookAuthor { BookId = book.BookId, AuthorId = authorId }).ToList();
            book.BookCategories = categoryIds.Select(categoryId => new BookCategory { BookId = book.BookId, CategoryId = categoryId }).ToList();

            await _context.SaveChangesAsync();
            return book;
        }

        public async Task DeleteAsync(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book != null)
            {
                _context.Books.Remove(book);
                await _context.SaveChangesAsync();
            }
        }
    }
}