using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Sitecore;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Mvc.Controllers;
using Sitecore.Mvc.Presentation;
using SitecoreHackathon.Feature.Global.Areas.HackathonSite.Models;

namespace SitecoreHackathon.Feature.Global.Areas.HackathonSite.Controllers
{
    public class GlobalController : SitecoreController
    {
	    private const string HeaderSettingsRelativeItemPath = "/Configuration/Header Settings"; //TODO: Change to find setting item by template
	    private const string FooterSettingsRelativeItemPath = "/Configuration/Footer Settings"; //TODO: Change to find setting item by template
        private readonly string _startPath = Sitecore.Context.Site.StartPath;
        private const string BasePageTemplateId = "{1399DCA6-05D5-4992-ABD8-CC0BAEFEC5D3}";
        private const string HackathonYearPageTemplateId = "{E88917CA-C93C-4ED4-9E99-906C4A11C81C}";
        private const string HackathonsOverviewPageTemplateId = "{4FFA9ED5-15C5-458F-A6DA-41E24EF6952C}";

        // GET: HackathonSite/Global
        public ActionResult HeaderIndex()
        {
            HeaderModelView model = new HeaderModelView();
	        model.Datasource = GetHeaderSettings();
	        model.PrimaryNavItems = GetPrimaryNavItems();
	        model.Hackathons = GetHackathonItems();
	        model.HackathonsOverviewItem = GetHackathonsOverviewItem();
            return View("~/Areas/HackathonSite/Views/Global/Header.cshtml", model);
        }

        public ActionResult FooterIndex()
        {
	        FooterModelView model = new FooterModelView();
	        model.Datasource = GetFooterSettings();
	        return View("~/Areas/HackathonSite/Views/Global/Footer.cshtml", model);
        }

        private Item GetFooterSettings()
        {
	        var footerSettingsItemPath = $"{_startPath}{FooterSettingsRelativeItemPath}";
	        return Sitecore.Context.Database.GetItem(footerSettingsItemPath);
        }

        private Item GetHeaderSettings()
        {
	        var headerSettingsItemPath = $"{_startPath}{HeaderSettingsRelativeItemPath}";
	        return Sitecore.Context.Database.GetItem(headerSettingsItemPath);
        }

        private List<Item> GetPrimaryNavItems()
        {
	        return Sitecore.Context.Database.GetItem(_startPath).Children.Where(i => i.TemplateID == new ID(BasePageTemplateId)).ToList();
        }

        private List<Item> GetHackathonItems()
        {
	        var hackathonsOverviewItem =  GetHackathonsOverviewItem();
	        return hackathonsOverviewItem != null ? GetHackathonsOverviewItem().Children.Where(i => i.TemplateID == new ID(HackathonYearPageTemplateId)).ToList() : new List<Item>();
        }

        private Item GetHackathonsOverviewItem()
        {
	        return Context.Database.GetItem(_startPath).Children.FirstOrDefault(i => i.TemplateID == new ID(HackathonsOverviewPageTemplateId));
        }
    }
}