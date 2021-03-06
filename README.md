![website](https://github.com/alpiepho/pup-lynda/workflows/website/badge.svg)

# pup-lynda

Deployed on GitHub pages [here](https://alpiepho.github.io/pup-lynda/).


A tool to gather Lynda.com classes completed along with details.

When run as a Node.js tool, it will parse all the Completed Courses of the configured
user, It will save that data as ./artifact/sample/json, and it will generate

- public/index.html
- artifacts/lynda-summary.mdx

The associated GH Action will deploy the index.html file.  

The learning-summary.mdx can be manually copied to the my-blog2 directory and committed 
to that repo as post in the blog.


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

### Local Test of index.html

- cd public
- python -m SimpleHTTPServer
- open http://localhost:8000/

## Know Issues

- options must be set in code


## Some References

https://miyakogi.github.io/pyppeteer/_modules/pyppeteer/launcher.html

## Future changes:

Some ideas for future changes:

- Create summary page from data
- Add GH Actions to autogenerate page on a schedule




