using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NotesApiV4.Models;
using NotesApiV4.ModelsDto;

namespace NotesApiV4.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	[Authorize]
	public class NotesController : ControllerBase
	{
		private readonly NotesContext _context;

		public NotesController(NotesContext context)
		{
			_context = context;
		}

		// GET: api/Notes
		[HttpGet]
		public async Task<ActionResult<IEnumerable<NoteDto>>> GetNotes()
		{
			long userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

			return await _context.Notes
				.Where(n=> n.UserId == userId)
				.Select(n => NoteToDto(n))
				.ToListAsync();
		}

		// GET: api/Notes/5
		[HttpGet("{id}")]
		public async Task<ActionResult<NoteDto>> GetNote(long id)
		{
			long userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
			var note = await _context.Notes.FindAsync(id);
			if (note == null || note.UserId != userId)
			{
				return NotFound();
			}

			return NoteToDto(note);
		}

		// PUT: api/Notes/5
		// To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
		[HttpPut("{id}")]
		public async Task<IActionResult> PutNote(long id, NoteDto noteDto)
		{
			if (id != noteDto.Id)
			{
				return BadRequest();
			}

			var note = await _context.Notes.FindAsync(id);
			var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

			if (note== null || note.UserId != userId)
			{
				return NotFound();
			}

			note.Name = noteDto.Name;
			note.Text = noteDto.Text;
			note.IsImportant = noteDto.IsImportant;
			try
			{
				await _context.SaveChangesAsync();
			}
			catch (DbUpdateConcurrencyException) when (!NoteExists(id))
			{
				return NotFound();
			}
			return NoContent();
		}

		// POST: api/Notes
		// To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
		[HttpPost]
		public async Task<ActionResult<NoteDto>> PostNote(NoteDto noteDto)
		{
			var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

			var note = new Note
			{
				Name = noteDto.Name,
				Text = noteDto.Text,
				IsImportant = noteDto.IsImportant,
				UserId = userId
			};

			_context.Notes.Add(note);
			await _context.SaveChangesAsync();

			return CreatedAtAction(
				nameof(GetNote),
				new { id = note.Id },
				NoteToDto(note));
		}

		// DELETE: api/Notes/5
		[HttpDelete("{id}")]
		public async Task<IActionResult> DeleteNote(long id)
		{
			var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

			var note = await _context.Notes.FindAsync(id);
			if (note == null || note.UserId != userId)
			{
				return NotFound();
			}

			_context.Notes.Remove(note);
			await _context.SaveChangesAsync();

			return NoContent();
		}

		private bool NoteExists(long id)
		{
			return _context.Notes.Any(e => e.Id == id);
		}
		private static NoteDto NoteToDto(Note note)
		{
			return new NoteDto
			{
				Id = note.Id,
				Name = note.Name,
				Text = note.Text,
				IsImportant = note.IsImportant,
				UserId = note.UserId
			};
		}
	}
}
