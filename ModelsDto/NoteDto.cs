using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NotesApiV4.ModelsDto
{
	public class NoteDto
	{
		public long Id { get; set; }
		public string Name { get; set; }
		public string Text { get; set; }
		public bool IsImportant { get; set; }
		public long UserId { get; set; }


	}
}
