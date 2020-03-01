using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Sitecore.Data.Items;

namespace SitecoreHackathon.Feature.Global.Areas.HackathonSite.Models
{
	public class HeaderModelView
	{
		public Item Datasource { get; set; }
		public List<Item> PrimaryNavItems { get; set; }
		public List<Item> Hackathons { get; set; }
		public Item HackathonsOverviewItem { get; set; }
	}
}