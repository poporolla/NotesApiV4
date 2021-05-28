using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NotesApiV4.Models
{
	public class NotesContext : DbContext
	{
		public DbSet<Role> Roles { get; set; }
		public DbSet<User> Users { get; set; }
		public DbSet<Note> Notes { get; set; }
		public NotesContext(DbContextOptions<NotesContext> options) 
			: base(options)
		{

		}
	}
}
