var express=require("express");
var fileuploader=require("express-fileupload");
var cloudinary=require("cloudinary").v2;
var mysql2=require("mysql2");

var app = express();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyDY7Fp1UqAYH6BGVA_SUzhVS6ZqTdc1ogo");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
app.use(fileuploader());

app.listen(2005,function(){
    console.log("Server Started at Port no: 2005")
})
app.use(express.static("public"));
app.use(express.urlencoded(true));
app.use(express.json()); 

app.get("/signup", function (req, resp) {
  // resp.send("signup page");
  let path = __dirname + "/public/index.html";
  resp.sendFile(path);

})
app.use(express.urlencoded(true));
cloudinary.config({
  cloud_name: 'dphsefooj',
  api_key: '424586339496585',
  api_secret: '-RFdJcCXe8jjUATwvE3RJYNpSjQ' // Click 'View API Keys' above to copy your API secret
});


let dbConfig = "mysql://avnadmin:AVNS_In0-FIBr9nMot9zYx4w@mysql-1bad1d36-i8695590-3f28.j.aivencloud.com:22152/newdb";

/*let mysqlVen = mysql2.createConnection(dbConfig);*/
/*mysqlVen.connect(function (errKuch) {
  if (errKuch == null)
    console.log("Aiven connected successfully");
  else
    console.log(errKuch.message)
})*/
let mysqlVen = mysql2.createPool(dbConfig);
console.log("Aiven connected sucessfully");
/*mySqlVen.connect(function(errKuch)
{
    if (errKuch==null)
         console.log("Aiven connected sucessfully");

    else
        console.log(errKuch.message)
})*/


app.post("/signup",function (req, resp) {
    let emailid = req.body.txtEmail;
  let pwd = req.body.txtPwd;
  let uType = req.body.utype;
  mysqlVen.query(
    "INSERT INTO users (emailid, pwd, utype, dos, status) VALUES (?, ?, ?, CURRENT_DATE(), 1)",
    [emailid, pwd, uType],
    function (errKuch) {
      if (errKuch == null) {
        resp.send("Record Saved Successfully....Badhai");
      } else {
        resp.send(errKuch.message);
      }
    })
})
app.get("/chk-email", function(req, resp) {
  mysqlVen.query(
    "select * from users where emailid = ?", 
    [req.query.txtEmail], 
    function(err, allRecords) {
      if (allRecords.length == 0)
        resp.send("Available...");
      else
        resp.send("Already Taken...");
    }
  );
});



app.get("/do-login", function (req, resp) {
    let emailid = req.query.loginEmail;
    let pwd = req.query.loginPwd;

    let query = "SELECT * FROM users WHERE emailid = ? AND pwd = ?";

    mysqlVen.query(query, [emailid, pwd], function (err, allRecords) {

        if (allRecords.length == 0) 
          {
            resp.send("Invalid");
          }

            
            else if (allRecords[0].status==1){

                resp.send(allRecords[0].utype);
                }
            
        else
          resp.send("Blocked");
      });
    })
app.post("/update-user-status", (req, res) => {
  console.log("Incoming body:", req.body); 
  let emailid = req.body.emailid;

  let query = "UPDATE users SET status = 0 WHERE emailid = ?";
  mysqlVen.query(query, [emailid], function (err, result) {
    if (err) {
      res.send("Database error");
    } else {
      res.send("Status updated via email");
    }
  });
});
app.post("/resume-user-status", (req, res) => {
  let emailid = req.body.emailid;

  let query = "UPDATE users SET status = 1 WHERE emailid = ?";
  mysqlVen.query(query, [emailid], function (err, result) {
    if (err) {
      res.send("Database error while resuming");
    } else {
      res.send("User resumed successfully");
    }
  });
});

app.post("/org",  async function (req, resp) {
  let picurl = "";
  if (req.files != null) 
  {
    let fName = req.files.profilePic.name;
   let fullPath = __dirname + "/public/uploads/" + fName;
    req.files.profilePic.mv(fullPath);

    await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
      picurl = picUrlResult.url;   //will give u the url of ur pic on cloudinary server
     
      console.log(picurl);
    });
  }
  else
    picurl = "nopic.jpg";

let inputEmail = req.body.inputEmail;
    let orgName = req.body.orgName;
    let regNo = req.body.regNo;
    let Address = req.body.Address;
    let city = req.body.city;
    let dealsSports = req.body.dealsSports;
    let website = req.body.website;
    let instaLink = req.body.instaLink;
    let orgHead=req.body.orgHead;
    let contactNo = req.body.contactNo;
    let otherInformation = req.body.otherInformation;

   mysqlVen.query(
    "INSERT INTO organizers (emailid, orgname, regnumber, address, city, sports, website, instagram, head, contact, info, picurl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [inputEmail, orgName, regNo, Address, city, dealsSports, website, instaLink,orgHead, contactNo, otherInformation, picurl],
        function (err) {
            if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        resp.send("Error: Email already exists (primary key violation)");
      } else {
        resp.send("Error: " + err.message);
      }
    } else {
      resp.send("Record Saved Successfully");
    }

        }
    )
})
app.post("/update-user", async function (req, resp) {
      
  let picurl = "";
  if (req.files != null) {
    let fName = req.files.profilePic.name;
    let fullPath = __dirname + "/public/uploads/" + fName;
    req.files.profilePic.mv(fullPath);

    await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
      picurl = picUrlResult.url;

      console.log(picurl);
    });
  }
  else
    
  picurl = req.body.hdn;


  let inputEmail = req.body.inputEmail;
    let orgName = req.body.orgName;
    let regNo = req.body.regNo;
    let Address = req.body.Address;
    let city = req.body.city;
    let dealsSports = req.body.dealsSports;
    let website = req.body.website;
    let instaLink = req.body.instaLink;
    let orgHead=req.body.orgHead;
    let contactNo = req.body.contactNo;
    let otherInformation = req.body.otherInformation;

  mysqlVen.query(
  "UPDATE organizers SET orgname=?, regnumber=?, address=?, city=?, sports=?, website=?, instagram=?, head=?, contact=?, info=?, picurl=? WHERE emailid=?",
  [orgName, regNo, Address, city, dealsSports, website, instaLink, orgHead, contactNo, otherInformation, picurl, inputEmail],
  function (errKuch, result)
 {
   if (errKuch == null) {
  if (result.affectedRows == 1)
    resp.json({ message: "Record updated successfully", picurl });
  else
    resp.json({ message: "Invalid email id" });
} else {
  resp.json({ message: "DB Error", error: errKuch.message });
}
})
})
app.get("/get-organizer", function (req, resp) {
  mysqlVen.query(
    "SELECT * FROM organizers WHERE emailid = ?",
    [req.query.emailid],
    function (err, allRecords) {
      if(allRecords.length==0)
                resp.send("No Record Found");
            else
                resp.json(allRecords);
      })
    }
  )

  
 app.post("/postTour", function (req, resp) {
  let rid = null; 
  let emailid = req.body.emailid;
  let eventss = req.body.eventss;
  let doe = req.body.doe;
  let toe = req.body.toe;
  let address = req.body.address;
  let city = req.body.city;
  let sports = req.body.sports;
  let minAge = req.body.minAge;
  let maxAge = req.body.maxAge;
  let lastDate = req.body.lastDate;
  let fee = req.body.fee;
  let prize = req.body.prize;
  let contact = req.body.contact;

  mysqlVen.query(
    "INSERT INTO tournaments (rid,emailid, eventss, doe, toe, address, city, sports, minAge, maxAge, lastDate, fee, prize, contact) VALUES (null,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [emailid, eventss, doe, toe, address, city, sports, minAge, maxAge, lastDate, fee, prize, contact],
    function (errKuch) {
      if (errKuch == null) {
        resp.send("Tournament posted successfully!");
      } else {
        resp.send(errKuch.message);
      }
    }
  );
});

app.get("/do-fetch-all-tournaments",function(req,resp)
{
        mysqlVen.query("select * from tournaments",function(err,allRecords)
        {
                    resp.send(allRecords);
        })
})


app.get("/delete-one", function (req, resp) {
  const rid = req.query.rid;

  mysqlVen.query("DELETE FROM tournaments WHERE rid = ?", [rid], function (err, result) {
    if (err == null) {
      if (result.affectedRows == 1) {
        resp.send(`Tournament deleted successfully.`);
      } else {
        resp.send("No tournament found with that ID.");
      }
    } else {
      resp.send("Error deleting tournament: " + err.message);
    }
  });
});


app.get("/do-fetch-all-tour",function(req,resp)
{
  console.log(req.query)
        mysqlVen.query("select * from tournaments where city=? and sports=?",[req.query.kuchcity,req.query.kuchsports],function(err,allRecords)
        {
          console.log(allRecords)
                    resp.send(allRecords);
        })
})
app.get("/do-fetch-all-cities", function (req, resp) {
  const sql = "SELECT DISTINCT city FROM tournaments";

  mysqlVen.query(sql, function (err, result) {
    if (err) {
      resp.send("Error fetching cities: " + err.message);
    } else {
      resp.send(result);
    }
  });
});

app.get("/do-fetch-all-organizers",function(req,resp)
{
        mysqlVen.query("select * from organizers",function(err,allRecords)
        {
                    resp.send(allRecords);
        })
})




async function RajeshBansalKaChirag(imgurl)
{
const myprompt = "Read the text on picture and tell all the information in adhaar card and give output STRICTLY in JSON format {adhaar_number:'', name:'', gender:'', dob: ''}. Dont give output as string."   
    const imageResp = await fetch(imgurl)
        .then((response) => response.arrayBuffer());

    const result = await model.generateContent([
        {
            inlineData: {
                data: Buffer.from(imageResp).toString("base64"),
                mimeType: "image/jpeg",
            },
        },
        myprompt,
    ]);
    console.log(result.response.text())
            
            const cleaned = result.response.text().replace(/```json|```/g, '').trim();
            const jsonData = JSON.parse(cleaned);
            console.log(jsonData);

    return jsonData

}

app.post("/player", async function (req, resp) {
  let acardpicurl = "";
  let profilepicurl = "";
  let jsonData = [];

  try {
    if (req.files != null) {
      // Upload Aadhar Pic
      let fName = req.files.acardpicurl.name;
      let locationtosave = __dirname + "/public/uploads/" + fName;
      await req.files.acardpicurl.mv(locationtosave);

      await cloudinary.uploader.upload(locationtosave).then(async function (picUrlResult) {
        acardpicurl = picUrlResult.url;

        // AI Extraction
        try {
          jsonData = await RajeshBansalKaChirag(acardpicurl);
        } catch (err) {
          console.log("cloudinary crash:", err.message);
        }

        // Upload Profile Pic
        try {
          if (req.files.profilepicurl != null) {
            let fName = req.files.profilepicurl.name;
            let locationtosave = __dirname + "/public/uploads/" + fName;
            await req.files.profilepicurl.mv(locationtosave);

            await cloudinary.uploader.upload(locationtosave).then(function (picUrlResult) {
              profilepicurl = picUrlResult.url;
            });
          } else {
            profilepicurl = "nopic.jpg";
          }
        } catch (err) {
          console.log("cloudinary crash:", err.message);
        }

        // Capture Form Data
        let email = req.body.emailid;
        let address = req.body.Address;
        let contact = req.body.contact;
        let game = req.body.game;
        let otherinfo = req.body.otherinfo;

        // Insert into MySQL
        mysqlVen.query(
          "insert into players values(?,?,?,?,?,?,?,?,?,?)",
          [email, acardpicurl, profilepicurl, jsonData.name, jsonData.dob, jsonData.gender, address, contact, game, otherinfo],
          function (errKuch, result) {
            if (errKuch == null) {
              resp.json({
                message: "profile complete",
                picurl: profilepicurl,
                name: jsonData.name,
                dob: jsonData.dob,
                gender: jsonData.gender
              });
            } else {
              resp.status(500).json({ message: errKuch.message });
            }
          }
        );
      });
    } else {
      resp.send("No files uploaded.");
    }
  } catch (err) {
    console.log("Outer try-catch error:", err.message);
    resp.send("Server error");
  }
});

app.post("/update-player", async function (req, resp) {
  let picurl = "";

  if (req.files != null) {
    let fName = req.files.profilepicurl.name;
    let fullPath = __dirname + "/public/uploads/" + fName;
    req.files.profilepicurl.mv(fullPath);

    await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
      picurl = picUrlResult.url;

      console.log(picurl);
    });
  } else {
    picurl = req.body.hdn;
  }

  let email = req.body.emailid;
  let name = req.body.name;
  let dob = req.body.dob;
  let gender = req.body.gender;
  let Address = req.body.Address;
  let contact = req.body.contact;
  let game = req.body.game;
  let otherinfo = req.body.otherinfo;

  mysqlVen.query(
    "UPDATE players SET name=?, dob=?, gender=?, address=?, contact=?, game=?, otherinfo=?, profilepicurl=? WHERE email=?",
    [name, dob, gender, Address, contact, game, otherinfo, picurl, email],
    function (errKuch, result) {
      if (errKuch == null) {
        if (result.affectedRows == 1)
          resp.json({ message: "Record updated successfully", picurl });
        else
          resp.json({ message: "Invalid email id" });
      } else {
        resp.json({ message: "DB Error", error: errKuch.message });
      }
    }
  );
});
app.get("/get-player", function (req, resp) {
  mysqlVen.query(
    "SELECT * FROM players WHERE email = ?",
    [req.query.emailid],
    function (err, allRecords) {
      if (allRecords.length == 0) {
        resp.json("No Record Found");
      } else {

        resp.json(allRecords);
      }
    }
  );
});
app.get("/do-fetch-all-players",function(req,resp)
{
        mysqlVen.query("select * from players",function(err,allRecords)
        {
                    resp.send(allRecords);
        })
})


app.get("/do-fetch-all-tournamentso", function (req, resp) {
  let emailid = req.query.email;

  mysqlVen.query(
    "SELECT * FROM tournaments WHERE emailid = ?",
    [emailid],
    function (err, allRecords) {
      resp.send(allRecords);
    }
  );
});


 app.post("/update-password", async function (req, resp) {
  let emailid = req.body.emailid;
  let oldPwd = req.body.oldPwd;
  let newPwd = req.body.newPwd;
  console.log("Email:", emailid, "Old Password:", oldPwd);

 mysqlVen.query(
  "UPDATE users SET pwd=? WHERE emailid=? AND pwd=? AND utype='player'",
  [newPwd, emailid, oldPwd],
  function (errKuch, result) {
    if (errKuch == null) {
      if (result.affectedRows == 1)
        resp.send("Password updated successfully");
      else
        resp.send("Invalid email ID, old password, or user type is not 'player'");
    } else {
      resp.send("DB Error: " + errKuch.message);
    }
  }
);
});




app.get("/do-fetch-all-users",function(req,resp)
{
        mysqlVen.query("select * from users",function(err,allRecords)
        {
                    resp.send(allRecords);
        })
})
