using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NotesApiV4.Models;
using NotesApiV4.ModelsDto;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace NotesApiV4.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class AccountController : Controller
	{
		private readonly NotesContext _context;

		public AccountController(NotesContext context)
		{
			_context = context;
		}
		[HttpPost("/token")]
		public IActionResult Token(LoginDto user)
		{
			var username = user.Email;
			var password = user.Password;
			var identity = GetIdentity(username, password);
			if (identity == null)
			{
				return BadRequest(new { errorText = "Invalid username or password." });
			}

			var now = DateTime.UtcNow;
			// создаем JWT-токен
			var jwt = new JwtSecurityToken(
					issuer: AuthOptions.ISSUER,
					audience: AuthOptions.AUDIENCE,
					notBefore: now,
					claims: identity.Claims,
					expires: now.Add(TimeSpan.FromMinutes(AuthOptions.LIFETIME)).AddDays(1),
					signingCredentials: new SigningCredentials(AuthOptions.GetSymmetricSecurityKey(), SecurityAlgorithms.HmacSha256));
			var encodedJwt = new JwtSecurityTokenHandler().WriteToken(jwt);

			var response = new
			{
				access_token = encodedJwt,
				username = identity.Name
			};

			return Json(response);
			
		}

		private ClaimsIdentity GetIdentity(string username, string password)
		{
			var user =
				_context.Users
				.Include(u=>u.Role)
				.FirstOrDefault(u => u.Email == username && u.Password == password);
			if(user != null)
			{
				var claims = new List<Claim>
				{
					new Claim(ClaimsIdentity.DefaultNameClaimType, user.Email),
					new Claim(ClaimsIdentity.DefaultRoleClaimType, user.Role.Name),
					new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
				};
				var claimsIdentity = new ClaimsIdentity(
						claims,
						"Token",
						ClaimsIdentity.DefaultNameClaimType,
						ClaimsIdentity.DefaultRoleClaimType);
				return claimsIdentity;
			}
			return null;
		}
	}
}
