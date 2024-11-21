const express = require("express");
const cron = require("node-cron");
const app = express();
const { emailSender } = require("../utilities/emailSender");
//.............cronJob.............//
//send email after 10 seconds//
cron.schedule(
  "*/10 * * * * *",
  () => {
    // console.log("in cronjob");
    //   emailSender(
    //     "syedawais.24@hotmail.com",
    //     "muhammadshahzad07618@gmail.com",
    //     "12'O clock",
    //     `<h3>Hi,</h3><br>
    //               <p>its 12 Am</p>.`
    //   );
  },
  null, //optional
  true, //optional
  "Canada/Central" //set timeZone of Canada
);
//..........................//

// 0 0 0 * * * cronJob at everyMidnight or at 12Am everyday
