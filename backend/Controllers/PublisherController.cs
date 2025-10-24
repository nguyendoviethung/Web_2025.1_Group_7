using backend.DTOs.Publisher;
using backend.Services.Publisher;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PublisherController : ControllerBase
    {
        private readonly IPublisherService _publisherService;

        public PublisherController(IPublisherService publisherService)
        {
            _publisherService = publisherService;
        }

        // GET: api/Publisher
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PublisherDto>>> GetPublishers()
        {
            var publishers = await _publisherService.GetAllPublishersAsync();
            return Ok(publishers);
        }

        // GET: api/Publisher/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PublisherDto>> GetPublisher(int id)
        {
            var publisherDto = await _publisherService.GetPublisherByIdAsync(id);
            if (publisherDto == null)
            {
                return NotFound();
            }
            return Ok(publisherDto);
        }

        // POST: api/Publisher
        [HttpPost]
        public async Task<ActionResult<PublisherDto>> PostPublisher(CreatePublisherDto createPublisherDto)
        {
            var newPublisherDto = await _publisherService.CreatePublisherAsync(createPublisherDto);
            return CreatedAtAction(nameof(GetPublisher), new { id = newPublisherDto.PublisherId }, newPublisherDto);
        }

        // PUT: api/Publisher/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPublisher(int id, UpdatePublisherDto updatePublisherDto)
        {
            var wasUpdated = await _publisherService.UpdatePublisherAsync(id, updatePublisherDto);
            if (!wasUpdated)
            {
                return NotFound();
            }
            return NoContent();
        }

        // DELETE: api/Publisher/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePublisher(int id)
        {
            var wasDeleted = await _publisherService.DeletePublisherAsync(id);
            if (!wasDeleted)
            {
                return NotFound();
            }
            return NoContent();
        }
    }
}