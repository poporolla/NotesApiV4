using System;
using System.Collections.Generic;
using System.Linq;
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
	public class UsersController : ControllerBase
	{
		private readonly NotesContext _context;

		public UsersController(NotesContext context)
		{
			_context = context;
		}

		// GET: api/Users
		[Authorize(Roles = "admin")]
		[HttpGet]
		public async Task<ActionResult<IEnumerable<User>>> GetUsers()
		{
			return await _context.Users.Include(u=>u.Role).ToListAsync();
		}

		// GET: api/Users/5
		[Authorize(Roles = "admin")]
		[HttpGet("{id}")]
		public async Task<ActionResult<User>> GetUser(long id)
		{
			var user = await _context.Users.FindAsync(id);

			if (user == null)
			{
				return NotFound();
			}

			return user;
		}

		// PUT: api/Users/5
		// To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
		[Authorize(Roles = "admin")]
		[HttpPut("{id}")]
		public async Task<IActionResult> PutUser(long id, User user)
		{
			if (id != user.Id)
			{
				return BadRequest();
			}

			_context.Entry(user).State = EntityState.Modified;

			try
			{
				await _context.SaveChangesAsync();
			}
			catch (DbUpdateConcurrencyException)
			{
				if (!UserExists(id))
				{
					return NotFound();
				}
				else
				{
					throw;
				}
			}

			return NoContent();
		}

		// POST: api/Users
		// To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
		[HttpPost]
		public async Task<ActionResult<User>> PostUser(LoginDto loginDto)
		{

			if (string.IsNullOrEmpty(loginDto.Email) || string.IsNullOrEmpty(loginDto.Password))
			{
				return BadRequest(new { errorText = "Empty username or password." });
			}
			if (_context.Users.Any(u => u.Email == loginDto.Email))
			{
				return BadRequest(new { errorText = "This email is already in use." });
			}
			var userRoleId = _context.Roles.FirstOrDefault(r => r.Name == "user").Id;
			var user = new User { Email = loginDto.Email, Password = loginDto.Password, RoleId = userRoleId };
			_context.Users.Add(user);
			await _context.SaveChangesAsync();

			return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
		}

		// DELETE: api/Users/5
		[Authorize(Roles = "admin")]
		[HttpDelete("{id}")]
		public async Task<IActionResult> DeleteUser(long id)
		{
			var user = await _context.Users.FindAsync(id);
			if (user == null)
			{
				return NotFound();
			}

			_context.Users.Remove(user);
			await _context.SaveChangesAsync();

			return NoContent();
		}

		private bool UserExists(long id)
		{
			return _context.Users.Any(e => e.Id == id);
		}
	}
}
