using MediaFramework.Models;
using Microsoft.AspNet.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace MediaFramework.Controllers
{
    public class SceneController : ApiControllerWithHub<JSONMediaHub>
    {
        
       
        
        // GET api/<controller>
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/<controller>/5
        public string Get(string id)
        {
            //var hubContext = GlobalHost.ConnectionManager.GetHubContext<JSONMediaHub>();
            //hubContext.Clients.All.send("Web API Post", id);
            Hub.Clients.All.addNewMessageToPage("Web API GET", id);
            return id;
        }

        // POST api/<controller>
        public void Post(scene value)
        {
           
            Hub.Clients.All.addNewMessageToPage("Web API POST", value);
            
        }

        // PUT api/<controller>/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/<controller>/5
        public void Delete(int id)
        {
        }
    }
}