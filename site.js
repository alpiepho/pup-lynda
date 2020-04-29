require("dotenv").config();
base = require("./base");
fs = require("fs");

PUP_URL_BASE = "https://www.lynda.com";
PUP_URL_LOGIN =
  "https://www.lynda.com/portal/patron?org=poudrelibraries.org&triedlogout=true";
PUP_URL_LOGOUT = PUP_URL_BASE + "/signout";

PUP_URL_COMPLETED=PUP_URL_BASE+"/history";

// in ms
PAGE_WAIT = 1000;
PAGE_WAIT_LOGIN = 2000;
PAGE_WAIT_LOGIN_DONE = 3000;
PAGE_WAIT_COMPLETED = 3000;
PAGE_WAIT_DETAILS = 1000;

const SAMPLE_FILE = "./artifacts/sample.json";

const sampleData = require(SAMPLE_FILE);

const process_login = async (browser, options) => {
  if (options.useSampleData) {
    return;
  }
  var waitMs = PAGE_WAIT_LOGIN + base.random_int(100);
  //console.log('process_login')
  const page = await base.browser_get(browser, PUP_URL_LOGIN, waitMs);
  await base.process_options(browser, options);
  await page.type("#card-number", process.env.PUP_USERNAME);
  await base.delay(waitMs);
  await page.type("#card-pin", process.env.PUP_PASSWORD);
  await base.delay(waitMs);
  await page.click("#submit-library-card");
  await base.delay(PAGE_WAIT_LOGIN_DONE);
  await base.process_options(browser, options);
  //console.log("process_login done")
};

const process_logout = async (browser, options) => {
  if (options.useSampleData) {
    return;
  }
  //console.log('process_logout')
  const page = await base.browser_get(browser, PUP_URL_LOGOUT, PAGE_WAIT);
  //console.log("process_logout done")
};

async function auto_scroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 400;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 500);
    });
  });
}

// const process_course_details = async (browser, options, href) => {
//   //console.log("process_course_details");
//   var newdata;

//   const page = await base.browser_get(browser, href, PAGE_WAIT_DETAILS);

//   newdata = await page.evaluate(() => {
//     let result = {};
//     // parse: courses
//     // TODO:
//     //  - course details
//     //  - author LinkedIn link
//     //  - course toc
//     //    - sections
//     //      - title
//     //      - subsections
//     //        - title
//     //        - description
//     //        - durration
//     //  - course exercise files?
//     //  - **could** also grab transcript???

//     result['linkedin'] = "";
//     result['details'] = "";
//     a = document.querySelectorAll('a.course-author-entity__meta-action');
//     if (a.length) {
//       result['linkedin'] = a[0].href;
//     }
//     a = document.querySelectorAll('.classroom-layout-panel-layout__main p');
//     if (a.length) {
//       result['details'] = a[0].innerText;
//     }
//     return result;
//   });
//   return [newdata['linkedin'], newdata['details']];
//   //console.log("process_course_details done");
// };

const process_completed = async (browser, options, data) => {
  //console.log("process_completed");
  var newdata;

  if (options.useSampleData) {
    newdata = sampleData;
  } else {
    const page = await base.browser_get(
      browser,
      PUP_URL_COMPLETED,
      PAGE_WAIT_COMPLETED
    );

    newdata = await page.evaluate(() => {
      let result = {};

      // parse: '104 Courses'
      let count = document.querySelector("#course-count")
        .innerText;
      result["count"] = count.split(" ")[0];
      return result;
    });

    // check for optimization, of count is same, then we are done.
    if (!options.forceFullGather && sampleData["count"] == newdata["count"]) {
      console.log("same expected course count, nothing to do.");
      data["completed-courses"] = [];
      return;
    }

    if (options.scrollToBottom) {
      try {
        while (true) {
          await auto_scroll(page);
          await page.click("#show-more-history");    
        }
      } catch {}
    }
    await base.delay(PAGE_WAIT_COMPLETED);
    await base.process_options(browser, options);

    newdata = await page.evaluate(() => {
      let result = {};

      // parse: '104 Courses'
      let count = document.querySelector("#course-count")
        .innerText;
      result["count"] = count.split(" ")[0];

      result['completed-courses'] = []
      let card_conts = document.querySelectorAll(".card-cont");
      for (i=0; i<card_conts.length; i++) {
        let entry = {};
        entry['title'] = "";
        entry['link'] = "";
        entry['author'] = "";
        entry['released-date'] = "";
        entry['duration'] = "";
        entry['completed-date'] = "";
        entry['img'] = "";
        entry['linkedin'] = "";
        entry['details'] = "";
        entry['title'] = card_conts[i].querySelector('h3').innerText;
        entry['link'] = card_conts[i].querySelector('a').href;
        temp = card_conts[i].querySelector('.meta-author');
        if (temp) entry['author'] = temp.innerText;
        //entry["released-date"] = newdata["released"][i];
        //if (temp) entry['released-date'] = temp;
        temp = card_conts[i].querySelector('.meta-duration');
        if (temp) entry['duration'] = temp.innerText;
        temp = card_conts[i].querySelector('.access-date');
        if (temp) entry['completed-date'] = temp.innerText;
        temp = card_conts[i].querySelector('img');
        if (temp) entry['img'] = temp.src;
        //entry["linkedin"] = newdata["linkedin"][i];
        //if (temp) entry['linkedin'] = temp;
        temp = card_conts[i].querySelector('.meta-description');
        if (temp) entry['details'] = temp.innerText;
        temp = card_conts[i].querySelector('.view-certificate');
        if (temp) {
          result['completed-courses'].push(entry);
        }
      }
      return result;
    });

    if (options.saveSampleData) {
      fs.writeFileSync(SAMPLE_FILE, JSON.stringify(newdata, null, 2));
    }
  }

   data["completed-courses"] = newdata["completed-courses"];
  //console.log("process_completed done");
};

exports.process_login = process_login;
exports.process_logout = process_logout;
exports.process_completed = process_completed;
