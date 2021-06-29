const puppeteer = require("puppeteer");
const chalk = require("chalk");
const args = process.argv.slice(2);
const url = args[0];
const log = console.log;


//****** Variable explinations ********
//    Type 1 - is a speed test.
//    Type 2 - is a confidence test
//    Type 3 - is any screen not in a task(Continue, Next, End)
//    Type 4 - is a choice between option 1 and 2 on which had stimuli
//    Session is a number passed from the test that represents the stimuli
//      and is compared aginst the Threshold
//    Treshold is defined in the test as to what qualifies a correct 
//      answer or not this will change based on visual, audio, or choice
//    The 3 types of tests (testType) looked for are
//      Choice - 2IFC, choose between two scenarios looking for stimuli
//      Audio - is the audio stimuli played
//      Visual - is the visual stimuli played





async function taskTester() {
  // const browser = await puppeteer.launch({
  //   headless: false,
  //   defaultViewport: null,
  // });

  const browser = await puppeteer.launch({
  headless: false,
    defaultViewport: null,
});

  const page = await browser.newPage();
  // const url = 'http://localhost:3000/#/?id=1'

  await page.goto(url);
  if (page.on()) {
    await trippleClickThrough();
  }

//Clicks through instructions on the first screen 
  async function trippleClickThrough() {
    let type = await page.evaluate(() => localStorage.getItem("testType"));
    if (type === "choice") {
      await page.keyboard.type("1", { delay: 200 });
      await page.keyboard.type("1", { delay: 200 });
      await page.keyboard.type("1", { delay: 200 });
    } else {
      await page.keyboard.type("q", { delay: 200 });
      await page.keyboard.type("q", { delay: 200 });
      await page.keyboard.type("q", { delay: 200 });
    }
    await buttonPressLogic();
  }

  async function doubleClickThrough() {
    let type = await page.evaluate(() => localStorage.getItem("testType"));
    if (type === "choice") {
      await page.keyboard.type("1", { delay: 200 });
      await page.keyboard.type("1", { delay: 200 });
    } else {
      await page.keyboard.type("q", { delay: 200 });
      await page.keyboard.type("q", { delay: 200 });
    }
  }

//Delay script by time in MS 
  function delay(time) {
    return new Promise(function (resolve) {
      setTimeout(resolve, time);
    });
  }

  async function buttonPressLogic() {
// Prints the name of each new task as it starts
    let newTask = page.url().split("/");
    log(chalk.yellowBright(newTask[newTask.length - 1] + " is starteing now."));
    
    page.on("console", async (e) => {

//Local storage variables describing test events 
      const session = await page.evaluate(() =>
        localStorage.getItem("session")
      );
      const type = await page.evaluate(() =>
        localStorage.getItem("type")
      );
      const thresh = await page.evaluate(() =>
        localStorage.getItem("thresh")
      );
      const testType = await page.evaluate(() =>
        localStorage.getItem("testType")
      );

//Describes the type of test and what the stated stimulas was
      if (type == 1 || type == 2) {
        log("Test type is " +
          chalk.magentaBright(`${type == 1 ? "Speed" : "Rating"}`) +
          " and the " + chalk.magentaBright(testType) +
          " stimulas is " +
          chalk.green(session));
      } else {
        delay(5000);
      }
//Start of test logic, looking at test type and stated threshhold 
      if (type == 1) {
        if (session > thresh) {
          await page.keyboard.type("q");
          log(chalk.greenBright("Fast press q"));
        } else {
          await page.keyboard.type("e");
          log(chalk.blueBright("Fast press e"));
        }
      }else if (type == 2) {
        if (session > thresh) {
          await page.keyboard.down("q");
          await delay(700);
          await page.keyboard.up("q");
          log(chalk.greenBright("Long press q"));
        } else {
          await page.keyboard.down("e");
          await delay(700);
          await page.keyboard.up("e");
          log(chalk.blueBright("Long press e"));
        }
      } else if (type == 4) {
        if (e.text() === "choice") {
          // const stim = await page.evaluate(() => localStorage.getItem("stim"));
          await page.keyboard.type(session, { delay: 200 });
          log(chalk.greenBright(`Sound was present on the ${session}${session == 1 ? "st" : "nd"} choice`));
          log(chalk.blueBright(`Fast pressed ${session}`))
        }
      }else if (type == 3) {
        await delay(100);
        try {
         
          //Checks if it is the end of the survey, if so looks at the response,
          //if not clicks through to the next task.

          if (await page.waitForSelector(".ThankYou", { timeout: 3000 })) {
            log(chalk.redBright("End of Trial"))
            await delay(2)
            await page.keyboard.type("q");
            log(chalk.greenBright("Pressed q back to survey"));
            await page.on('response', response => {
              if (response.url().endsWith("/default/saveTaskData")) {
                chalk.yellowBright("response code for save: ", response.status())
                console.log("response code: ", response.status());
              } else if (response.url().endsWith("/default/fetchLink")) {
                chalk.yellowBright("response code for fetch: ", response.status())
                console.log("response code: ", response.status());
              }
                // do something here
            });
            await delay(2147483647)
            await delay(2147483647)
            await delay(2147483647)
            await delay(2147483647)
            return;
          }
        } catch (error) {
          log(chalk.red("Start of new task"));
          await doubleClickThrough()
        }
        newTask = page.url().split("/");
        log(
          chalk.yellowBright(newTask[newTask.length - 1] + " is starting now.")
        );
      } else {
        log(chalk.redBright("Oops something went wrong, no test type passed"));
      }
    });
  }
}


taskTester();
