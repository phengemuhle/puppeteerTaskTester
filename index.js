const puppeteer = require("puppeteer");
const chalk = require("chalk");
const args = process.argv.slice(2);
// const url = args[0];
const log = console.log;

async function taskTester(url) {
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

  async function trippleClickThrough() {
    await page.keyboard.type("q", { delay: 200 });
    await page.keyboard.type("q", { delay: 200 });
    await page.keyboard.type("q", { delay: 200 });
    await buttonPressLogic();
  }

  async function continueScript() {
    await page.keyboard.type("q", { delay: 200 });
    await page.keyboard.type("q", { delay: 200 });
    await buttonPressLogic();
  }

  function delay(time) {
    return new Promise(function (resolve) {
      setTimeout(resolve, time);
    });
  }

  async function buttonPressLogic() {
    let newTask = page.url().split("/");
    log(chalk.yellowBright(newTask[newTask.length - 1] + " is starteing now."));
    page.on("console", async (e) => {
      const session = await page.evaluate(() =>
        localStorage.getItem("session")
      );
      const type = await page.evaluate(() => localStorage.getItem("type"));
      const testType = await page.evaluate(() =>
        localStorage.getItem("testType")
      );
      let threshold = 30;
      if (testType != 3) {
        console.log("Test type " + type + " and the stimulas is " + session);
      } else {
        delay(100000);
      }
      if (type == 2) {
        if (session >= threshold) {
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
      } else if (type == 1) {
        if (session >= threshold) {
          await page.keyboard.type("q");
          log(chalk.greenBright("Fast press q"));
        } else {
          await page.keyboard.type("e");
          log(chalk.blueBright("Fast press e"));
        }
      } else if (type == 3) {
        await delay(100);
        try {
          if (await page.waitForSelector(".ThankYou", { timeout: 5000 })) {
            return;
            //     await delay(10000000000);
            // if(false)
            // log(chalk.cyanBright("The trial is complete!"));
            // await delay(5000)
            // await page.keyboard.type("q", { delay: 200 });
            // await delay(1000000)
            // try {
            //   const fetchLinkResponse = await (await page.waitForResponse(response => response.status())).text();
            //   log(chalk.redBright(fetchLinkResponse))
            //   log(
            //     chalk.greenBright(
            //       "The response to the AWS fetchLink call was " +
            //         fetchLinkResponse
            //     ))
            // await delay(1000000)
            // browser.close();
            // } catch (error) {
            //   log(chalk.redBright(error))
            //   browser.close();
            // }
            // await delay(10000)
            // // log(
            // //   chalk.greenBright(
            // //     "The response to the AWS fetchLink call was " +
            // //       fetchLinkResponse.status()
            // //   )
            // // );
            // expect(fetchLinkResponse.status()).toBe(200);
            // await delay(30000)
          }
          // browser.close();
        } catch (error) {
          log(chalk.red("Start of new task"));
          await page.keyboard.type("q", { delay: 200 });
          await page.keyboard.type("q", { delay: 200 });
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
