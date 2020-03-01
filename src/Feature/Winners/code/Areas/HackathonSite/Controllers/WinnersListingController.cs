using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using SitecoreHackathon.Feature.Winners.Areas.HackathonSite.Models;

namespace SitecoreHackathon.Feature.Winners.Areas.HackathonSite.Controllers
{
    public class WinnersListingController : Controller
    {
        // GET: HackathonSite/WinnersListing
        public ActionResult Index()
        {
            var model = new WinnersListingModel();
            model.WinnerDetails = new List<WinnerDetail>();
            var currentPage = Sitecore.Context.Item;
            var winnerDetailPages = currentPage.Axes.GetDescendants().Where(x => x.TemplateName.ToLower() == "winner").ToList();

            foreach (var winnerDetailPage in winnerDetailPages)
            {
                var winningTeamId = winnerDetailPage.Fields["Winning Team"] != null
                    ? winnerDetailPage.Fields["Winning Team"].Value
                    : "";
                var winningTeamItem = !string.IsNullOrEmpty(winningTeamId)
                    ? Sitecore.Context.Database.GetItem(winningTeamId)
                    : null;
                if (winningTeamItem != null)
                {
                    model.WinnerDetails.Add(new WinnerDetail()
                    {
                        WinnerItem = winnerDetailPage,
                        WinningTeam = new Team()
                        {
                            InnerItem = winningTeamItem,
                            TeamName = winningTeamItem.Fields["Team Name"].Value,
                            TeamLogo = winningTeamItem.Fields["Team Logo"],
                            CountryName = winningTeamItem.Parent.Fields["Country Name"].Value,
                            TeamMembers = winningTeamItem.GetChildren()
                                .Where(m => m.TemplateName.ToLower() == "team member")
                                .Select(i =>
                                    new TeamMember()
                                    {
                                        InnerItem = i,
                                        FullName = i.Fields["Full Name"] != null ? i.Fields["Full Name"].Value : "",
                                        TwitterUrl = i.Fields["Twitter Url"] != null
                                            ? i.Fields["Twitter Url"].Value
                                            : "",
                                        LinkedInUrl = i.Fields["LinkedIn Url"] != null
                                            ? i.Fields["LinkedIn Url"].Value
                                            : "",
                                        GitHubUrl = i.Fields["Github Url"] != null ? i.Fields["Github Url"].Value : "",
                                    }).ToList()
                        }
                    });
                }
            }
            
            return View(model);
        }
    }
}