fs = require('fs');

base = require('./base');
site = require('./site');

const HTML_FILE = "./public/index.html";
const MD_FILE = "./artifacts/lynda-summary.md";

const html1 = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width", initial-scale=1.0"/>
    <meta name="Description" content="Lynda.com Courses Completed">
    <meta name="theme-color" content="#d36060"/>
    <title>
    Lynda.com Courses Completed
    </title>
    <link rel="stylesheet" href="./style.css" />
    <link rel="manifest" href="./manifest.json" />
    <link rel="icon"
      type="image/png" 
      href="./favicon.ico" />
  </head>
  <body class="body">
    <main>
    <article class="page">
      <h1>Lynda.com Courses Completed</h1>
`;

const html2 = `
    </article>
  </body>
</html>
`;

const md1 = `---
title: Lynda.com Completed Courses
date: "2020-04-28"
description: "Summary of my Lynda.com Completed Courses"
---

(Warning: many images) This a summary of all the Lynda.com courses I have completed. 
This is just the direct  Lynda.com courses.  This list of for historical purposes, since
most of current courses are on "LinkedIn Learning", after subscribing to the LinkedIn 
premium plan.

A full summary with more details can be found [here](https://alpiepho.github.io/pup-lynda/).

`;

const md2 = `
`;

function build_hours_minutes(data) {
  // Derive timestamps and duration, sort
  let totalMin = 0;
  data['completed-courses'].forEach(entry => {
    // assume "An Bm" or "Bm"
    let temp = entry['duration'].split(' ');
    if (temp.length == 2) {
      val = parseInt(temp[0].replace('h', ''));
      totalMin += val*60;
      val = parseInt(temp[1].replace('m', ''));
      totalMin += val;
    }
    if (temp.length == 1) {
      val = parseInt(temp[0].replace('m', ''));
      totalMin += val;      
    }
    entry['released-ts'] = Date.parse(entry['released-date']);
    entry['completed-ts'] = Date.parse(entry['completed-date']);
  });

  totalH = Math.floor(totalMin / 60); 
  totalM = totalMin - (totalH*60);
  return [totalH, totalM];
}

function build_html(data, totalH, totalM) {
  // generate artifacts from data - html
  let htmlStr = html1;
  htmlStr += "      <p>Totals - Course: " + data['completed-courses'].length + ", Time: " + totalH + "h " + totalM + "m</p><br/>\n\n";
  htmlStr += "      <ul>";
  data['completed-courses'].forEach(entry => {
    htmlStr += "            <li>\n";
    htmlStr += "              <ul>\n";
    htmlStr += "                <li>\n";

    htmlStr += "                  <p><img src=\"" + entry['img'] + "\"</img></p>\n";


    htmlStr += "                  <a target=\"_blank\" href=\"" + entry['link'] + "\">\n";
    htmlStr += "                    " + entry['title'] + "\n";
    htmlStr += "                  </a>\n";
    htmlStr += "                </li>\n";
    if (entry['linkedin']) {
      htmlStr += "                <li><a target=\"_blank\" href=\"" + entry['linkedin'] + "\">" + entry['author'] + "</a></li>\n";
    } else {
      htmlStr += "                <li>" + entry['author'] + "</li>\n";
    }
    htmlStr += "                <li>" + entry['released-date'] + "</li>\n";
    htmlStr += "                <li>" + entry['duration'] + "</li>\n";
    htmlStr += "                <li>" + entry['completed-date'] + "</li>\n";
    htmlStr += "                <li class=\"details\">" + entry['details'] + "</li>\n";
    htmlStr += "              </ul>\n";
    htmlStr += "            </li>\n";
  });
  htmlStr += "      </ul>";
  htmlStr += html2;
  fs.writeFileSync(HTML_FILE, htmlStr);
}

function build_md(data, totalH, totalM) {
  // generate markdown (.mdx) for blog
  let mdStr = md1;
  mdStr += "Total Completed Courses: " + data['completed-courses'].length + ", Time: " + totalH + "h " + totalM + "m\n";
  mdStr += "<br/>\n";
  mdStr += "<br/>\n";
  mdStr += "<br/>\n";
  mdStr += "\n";
  data['completed-courses'].forEach(entry => {
    mdStr += "\n";
    if (entry['img']) {
      mdStr += "![thumbnail](" + entry['img'] + ")\n";
    }
    mdStr += "\n";
    mdStr += "[" + entry['title'] + "](" + entry['link'] + ")\n";
    mdStr += "- " + entry['author'] + "\n";
    mdStr += "- " + entry['released-date'] + "\n";
    mdStr += "- " + entry['duration'] + "\n";
    mdStr += "- " + entry['completed-date'] + "\n";
    mdStr += "<br/>\n";
    mdStr += "<br/>\n";
    mdStr += "<br/>\n";
      mdStr += "\n";
  });
  mdStr += md2;
  fs.writeFileSync(MD_FILE, mdStr);
}

const main = async () => {
  // INTERNAL OPTIONS
  options = { 
    browserType:     "firefox", // "chrome, firefox"
    headless:        false,     // run without windows
    forceFullGather:  true,     // skip test for number of course
    scrollToBottom:   true,     // scroll page to bottom (WARNING: non-visible thumbnails are not loaded until page is scrolled)
    gatherDetails:    true,     // parse the details
    useSampleData:   false,     // skip browser and use sample data file
    saveSampleData:   true,     // save to sample data file
    screenshot:      false,     // take snapshots
    screenshotDir:    "/tmp/pup_lynda_screenshots"
  }
  const browser = await base.browser_init(options);
  if (!options.useSampleData) {
    options.version = await browser.version();
  }
  console.log("options:");
  console.log(options);

  // login, get list of completed courses, logout
  data = {}
  await site.process_login(browser, options);
  await site.process_completed(browser, options, data);
  await site.process_logout(browser, options);
  await base.browser_close(browser);

  //DEBUG
  // console.log("data:");
  // console.log(JSON.stringify(data, null, space=2));

  if (data['completed-courses'].length > 0) {
    [totalH, totalM] = build_hours_minutes(data);
    data['completed-courses'].sort((a, b) => (a['completed-ts'] < b['completed-ts']) ? 1 : -1) // decending
    build_html(data, totalH, totalM);
    build_md(data, totalH, totalM);

    //   // Derive timestamps and duration, sort
    // let totalMin = 0;
    // data['completed-courses'].forEach(entry => {
    //   // assume "An Bm" or "Bm"
    //   let temp = entry['duration'].split(' ');
    //   if (temp.length == 2) {
    //     val = parseInt(temp[0].replace('h', ''));
    //     totalMin += val*60;
    //     val = parseInt(temp[1].replace('m', ''));
    //     totalMin += val;
    //   }
    //   if (temp.length == 1) {
    //     val = parseInt(temp[0].replace('m', ''));
    //     totalMin += val;      
    //   }
    //   entry['released-ts'] = Date.parse(entry['released-date']);
    //   entry['completed-ts'] = Date.parse(entry['completed-date']);
    // });

    // totalH = Math.floor(totalMin / 60); 
    // totalM = totalMin - (totalH*60);




    // // generate artifacts from data - html
    // let htmlStr = html1;
    // htmlStr += "      <p>Totals - Course: " + data['completed-courses'].length + ", Time: " + totalH + "h " + totalM + "m</p><br/>\n\n";
    // htmlStr += "      <ul>";
    // data['completed-courses'].forEach(entry => {
    //   htmlStr += "            <li>\n";
    //   htmlStr += "              <ul>\n";
    //   htmlStr += "                <li>\n";

    //   htmlStr += "                  <p><img src=\"" + entry['img'] + "\"</img></p>\n";


    //   htmlStr += "                  <a target=\"_blank\" href=\"" + entry['link'] + "\">\n";
    //   htmlStr += "                    " + entry['title'] + "\n";
    //   htmlStr += "                  </a>\n";
    //   htmlStr += "                </li>\n";
    //   if (entry['linkedin']) {
    //     htmlStr += "                <li><a target=\"_blank\" href=\"" + entry['linkedin'] + "\">" + entry['author'] + "</a></li>\n";
    //   } else {
    //     htmlStr += "                <li>" + entry['author'] + "</li>\n";
    //   }
    //   htmlStr += "                <li>" + entry['released-date'] + "</li>\n";
    //   htmlStr += "                <li>" + entry['duration'] + "</li>\n";
    //   htmlStr += "                <li>" + entry['completed-date'] + "</li>\n";
    //   htmlStr += "                <li class=\"details\">" + entry['details'] + "</li>\n";
    //   htmlStr += "              </ul>\n";
    //   htmlStr += "            </li>\n";
    // });
    // htmlStr += "      </ul>";
    // htmlStr += html2;
    // fs.writeFileSync(HTML_FILE, htmlStr);
    
    // // generate markdown (.mdx) for blog
    // let mdStr = md1;
    // mdStr += "Total Completed Courses: " + data['completed-courses'].length + ", Time: " + totalH + "h " + totalM + "m\n";
    // mdStr += "<br/>\n";
    // mdStr += "<br/>\n";
    // mdStr += "<br/>\n";
    // mdStr += "\n";
    // data['completed-courses'].forEach(entry => {
    //   mdStr += "\n";
    //   if (entry['img']) {
    //     mdStr += "![thumbnail](" + entry['img'] + ")\n";
    //   }
    //   mdStr += "\n";
    //   mdStr += "[" + entry['title'] + "](" + entry['link'] + ")\n";
    //   mdStr += "- " + entry['author'] + "\n";
    //   mdStr += "- " + entry['released-date'] + "\n";
    //   mdStr += "- " + entry['duration'] + "\n";
    //   mdStr += "- " + entry['completed-date'] + "\n";
    //   mdStr += "<br/>\n";
    //   mdStr += "<br/>\n";
    //   mdStr += "<br/>\n";
    //     mdStr += "\n";
    // });
    // mdStr += md2;
    // fs.writeFileSync(MD_FILE, mdStr);
  }

  console.log("done.");
};

main();

  
  