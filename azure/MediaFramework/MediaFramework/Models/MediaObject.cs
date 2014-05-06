using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MediaFramework.Models
{
    
    public class mediaObject
    {
        public string name { get; set; }
        [JsonProperty(PropertyName = "type")]
        public string MediaType { get; set; }
        public string mimeType { get; set; }
        public string anmiationIn { get; set; }
        public string anmiationOut { get; set; }
        public string cachePolicy { get; set; }
        public string tags { get; set; }
    }
}