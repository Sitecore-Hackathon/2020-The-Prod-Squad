using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Sitecore.Collections;
using Sitecore.Data.Items;
using SitecoreHackathon.Feature.Participants.Areas.HackathonSite.Models;

namespace SitecoreHackathon.Feature.Participants.Areas.HackathonSite.Controllers
{
    public class TeamListingController : Controller
    {
        // GET: HackathonSite/TeamListing
        public ActionResult Index()
        {
            var model = new TeamListingModel();
            var currentPage = Sitecore.Context.Item;
            var countries = currentPage.Axes.GetDescendants().Any(x => 
                x.TemplateName.ToLower() == "country") ? currentPage.Axes.GetDescendants().Where(
                y => y.TemplateName.ToLower() == "country") : new List<Item>();
            var teams = new List<Team>();
            foreach (var country in countries)
            {
                var countryTeams = country.GetChildren().Where(c => c.TemplateName.ToLower() == "team");
                teams.AddRange(countryTeams.Select(t => new Team()
                {
                    InnerItem = t,
                    TeamName = t.Fields["Team Name"] != null ? t.Fields["Team Name"].Value : "",
                    TeamLogo = t.Fields["Team Logo"] != null ? t.Fields["Team Logo"] : null,
                    CountryName = country.Name,
                    TeamMembers = t.GetChildren().Where(m => m.TemplateName.ToLower() == "team member").Select(i =>
                        new TeamMember()
                        {
                            InnerItem = i,
                            FullName = i.Fields["Full Name"] != null ? i.Fields["Full Name"].Value : "",
                            TwitterUrl = i.Fields["Twitter Url"] != null ? i.Fields["Twitter Url"].Value : "",
                            LinkedInUrl = i.Fields["LinkedIn Url"] != null ? i.Fields["LinkedIn Url"].Value : "",
                            GitHubUrl = i.Fields["Github Url"] != null ? i.Fields["Github Url"].Value : "",
                        }).ToList()

                }));
                model.Teams = teams;
            }
            return View(model);
        }
    }
}