using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NotesApiV4.Models
{
	public class User
	{
		public long Id { get; set; }
		public string Email { get; set; }
		public string Password { get; set; }
		public long RoleId { get; set; }
		public Role Role { get; set; }
		public IEnumerable<Note> Notes { get; set; }

	}
}
