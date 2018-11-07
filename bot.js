//Getting the content
const puppeteer = require('puppeteer');
const CREDS = require('./creds.json');
const readline = require('readline');

// starting the bot
(async () => {
  console.log('# launching bot..');
  const browser = await puppeteer.launch(
    {
      args: ["--disable-notifications"]
    }
  );

  // headless: false,

  const page = await browser.newPage();
  await page.setViewport({width: 1500, height: 900});

  console.log('# Going to website..');
  await page.goto('https://www.facebook.com/');

  console.log('# loging in..');
  await page.type('#email', CREDS.username);
  await page.type('#pass', CREDS.password);
  await page.click('input[type="submit"]');
  await page.waitForSelector('#globalContainer');

  // going into group
  await page.goto('https://www.facebook.com/groups/x/?sorting_setting=CHRONOLOGICAL');
  await page.waitForSelector('div[aria-label="News Feed"]');

  //function to crawl the target group
  async function crawlGroup () {
    let loopCount = 5;
    let a = 0;
    console.log('# initiating for loop');
    // for (a=0; a <= loopCount; a++) {
    for (;;) {
      a++

      //making sure everything is loaded
      await page.waitForSelector('div[aria-label="News Feed"]');

      // getting timestamp
      let newestPostTimestamp = await page.evaluate( function(){
        return document.querySelector('div[aria-label="News Feed"] div[role="feed"]:nth-child(2) > div:nth-child(2) .timestampContent').innerText
      });

      // if new post was found 
      // Just now
      if (newestPostTimestamp == 'Just now') {

        // getting text of latest post if timestamp meets criteria
        let newestPostText = await page.evaluate( function(){
          return document.querySelector('div[aria-label="News Feed"] div[role="feed"]:nth-child(2) > div:nth-child(2) .userContent p').innerText;
        });

        console.log('\x1b[32m%s\x1b[0m', '# Match found!');
        console.log('# timestamp:', newestPostTimestamp);
        console.log('# Post ----------------' + '\n' + newestPostText + '\n' + '----------------------');

        // Let's choose what we want to do
        readline.emitKeypressEvents(process.stdin);
        process.stdin.setRawMode(true);
        process.stdin.on('keypress', (str, key) => {
          
          if (key.ctrl && key.name === 'y') {
            console.log('\x1b[32m%s\x1b[0m', 'tu paspaudei TAIP');
            console.log('\x1b[32m%s\x1b[0m', 'darau....');
            
            // Adding + to a comment for that post
            // also playing a sound? https://github.com/Marak/play.js

          } else if (key.ctrl && key.name === 'n') {
            console.log('\x1b[31m%s\x1b[0m','tu paspaudei NE');
            console.log('\x1b[31m%s\x1b[0m','uzdarau....');
            process.stdin.resume();

          } else {
            console.log(`# You pressed a random key, so closing..`);
            process.exit();
          }
        });
        console.log("# Should we go for a ride, sir?");

      } else {
        console.log('\x1b[33m%s\x1b[0m', '# last post was added ' + newestPostTimestamp + " moving on. Loop count - " + a);
      }

      // if for loop limit is reached
      // if (a == loopCount) {
      //   await browser.close();
      // } else {
        // console.log('# for loop count:', a);
        await page.reload();
      // }
    }
  }

  crawlGroup();
})();
