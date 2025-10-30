using backend.DTOs.Book;
using backend.DTOs.Shared;
using backend.Services.Book;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookController : ControllerBase
    {
        private readonly IBookService _bookService;

        public BookController(IBookService bookService)
        {
            _bookService = bookService;
        }

        // GET: api/Book
        [HttpGet]
        public async Task<ActionResult<PagedResult<BookDto>>> GetBooks([FromQuery] BookQueryParameters queryParameters)
        {
            var books = await _bookService.GetAllBooksAsync(queryParameters);
            return Ok(books);
        }

        // GET: api/Book/5
        [HttpGet("{id}")]
        public async Task<ActionResult<BookDto>> GetBook(int id)
        {
            var bookDto = await _bookService.GetBookByIdAsync(id);
            if (bookDto == null)
            {
                return NotFound();
            }
            return Ok(bookDto);
        }

        // POST: api/Book
        [HttpPost]
        public async Task<ActionResult<BookDto>> PostBook(CreateBookDto createBookDto)
        {
            var newBookDto = await _bookService.CreateBookAsync(createBookDto);
            return CreatedAtAction(nameof(GetBook), new { id = newBookDto.BookId }, newBookDto);
        }

        // PUT: api/Book/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutBook(int id, UpdateBookDto updateBookDto)
        {
            var wasUpdated = await _bookService.UpdateBookAsync(id, updateBookDto);
            if (!wasUpdated)
            {
                return NotFound();
            }
            return NoContent();
        }

        // DELETE: api/Book/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBook(int id)
        {
            var wasDeleted = await _bookService.DeleteBookAsync(id);
            if (!wasDeleted)
            {
                return NotFound();
            }
            return NoContent();
        }
    }
}