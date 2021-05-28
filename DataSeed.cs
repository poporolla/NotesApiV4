using Microsoft.EntityFrameworkCore;
using NotesApiV4.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NotesApiV4
{
	public class DataSeed
	{
		public static void SeedData(NotesContext context)
		{
			if (!context.Roles.Any())
			{
				var roles = new List<Role>() { new Role { Name = "admin" }, new Role { Name = "user" } };
				context.Roles.AddRange(roles);
				context.SaveChanges();
			}
			if (!context.Users.Any())
			{
				var adminRole = context.Roles.FirstOrDefault(elem => elem.Name == "admin");
				var adminUser = new User { Email = "admin@email.ru", Password = "12345", Role = adminRole };
				context.Users.Add(adminUser);
				context.SaveChanges();
			}
		}
	}
}
