![website](https://github.com/alpiepho/pup-lynda/workflows/website/badge.svg)

# pup-lynda

Deployed on GitHub pages [here](https://alpiepho.github.io/pup-lynda/).


A tool to gather Lynda.com classes completed along with details.

## TODO

- scroll down history page
- parse each "card"
  - title, author, description, details, completed, link
  - (need navigation) 
  - release
  - course details
  - author LinkedIn link
  - course toc
    - sections
      - title
      - subsections
        - title
        - description
        - durration
  - course exercise files?
  - **could** also grab transcript???

- need to programatically deal with "not completed" tags (how to align)

- fix GH Action to deploy
- improve index.html
    - summary info (name, toc, li link, number courses, sum time etc)
    - better style
- improve .md
- test with headless

- compare to pup-learning to capture those improvements


## Mac Install

Install npm from the website or homebrew.  You will also need yarn.

NOTE: Normally, you can use either npm or yarn to install modules.  The debug of
Chrome with DNS Manager (mising a valid certificate), discovered that we need older
versions of some packages.  This can be done with either npm or yarn.  We currently only
have this setup with the yarn.lock file.

## Linux Install

For a Unbuntu system, use:

<pre>
sudo apt-get install -y npm yarn
</pre>

For other distributions, please search on Google.

## Install then run

First, there is a one-time setup of enviroment variables like:

```
export PUP_USERNAME=<Lynda User Name>
export PUP_PASSWORD=<Lynda User Password>
yarn install
```

From a command line:

```
yarn start
```

This should take a few minutes to navigate thru all the tabs.  It takes snapshot images
and saves them in 'screenshots'.  

You can also runs this 'headless' or without a browser window.  Look for 'headless' in site.js.  To verify, you should see the screenshots generated.


## Internal Settings

There are number of things can be changed quickly in the source code.  Eventually they
will be added as program options.

Look for "INTERNAL OPTION".

### Chromium vs Firefox for Puppeteer

Puppeteer can run automated tests with both Chrome (technically the Chromium build) and
Firefox.

### Headless

Headless is the ability to run a web page without showing on the screen.  This mode can
be used for automated testing.  This works with both Chrome and Firefox.

### Screenshots

This feature allows capturing an image of the web page while the test is running. 

## Know Issues

TBD


## Some References

https://miyakogi.github.io/pyppeteer/_modules/pyppeteer/launcher.html

## Future changes:

Some ideas for future changes:

- Create summary page from data
- Add GH Actions to autogenerate page on a schedule




