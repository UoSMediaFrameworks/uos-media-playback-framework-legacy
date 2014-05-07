using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MediaFramework.Models
{
    public class scene
    {
        public int id { get; set; }

        public int version { get; set; }

        public int name { get; set; }

        public List<mediaObject> mediaObjects { get; set; }
    }
}