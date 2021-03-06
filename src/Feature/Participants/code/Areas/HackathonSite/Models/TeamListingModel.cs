﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Sitecore.Data.Fields;
using Sitecore.Data.Items;

namespace SitecoreHackathon.Feature.Participants.Areas.HackathonSite.Models
{
    public class TeamListingModel
    {
        public List<Team> Teams { get; set; }
    }

    public class Team
    {
        public Item InnerItem { get; set; }
        public string TeamName { get; set; }
        public ImageField TeamLogo { get; set; } 
        public string CountryName { get; set; }
        public List<TeamMember> TeamMembers { get; set; }
    }

    public class TeamMember
    {
        public Item InnerItem { get; set; }
        public string FullName { get; set; }
        public string TwitterUrl { get; set; }
        public string LinkedInUrl { get; set; }
        public string GitHubUrl { get; set; }
    }

}