using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;

namespace MediaFramework
{
    public class JSONMediaHub : Hub
    {
        
        
        
        public void Hello()
        {
            Clients.All.hello();
        }

        public void SendScene(string scene)
        {
            Clients.All.updateScene();
        }
        public void Send(string name, string message)
        {
            // Call the addNewMessageToPage method to update clients.
            Clients.All.addNewMessageToPage(name, message);
            
        }

        public static void apiSend(string message)
        {

        }
        
    }
}