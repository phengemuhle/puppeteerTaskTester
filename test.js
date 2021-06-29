const puppeteer = require("puppeteer");
const chalk = require("chalk");
const args = process.argv.slice(2);
const url = args[0];
const log = console.log;

async function taskTester() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const page = await browser.newPage();

  await page.goto(url);
  if (page.on()) {
    await trippleClickThrough();
  }

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

  function delay(time) {
    return new Promise(function (resolve) {
      log("delaying");
      setTimeout(resolve, time);
    });
  }

  async function buttonPressLogic() {
    let newTask = page.url().split("/");
    log(chalk.yellowBright(newTask[newTask.length - 1] + " is starteing now."));

    page.on("console", async (e) => {

      const type = await page.evaluate(() => localStorage.getItem("type"));
      if (type == 4) {
        if (e.text() === "choice") {
          const stim = await page.evaluate(() => localStorage.getItem("stim"));
          await page.keyboard.type(stim, { delay: 200 });
          log(chalk.greenBright(`Sound was present on the ${stim}${stim == 1 ? "st" : "nd"} choice`));
          log(chalk.blueBright(`Fast pressed ${stim}`))
        }
      } else if (type == 3) {
        await delay(100);
        try {
          if (await page.waitForSelector(".ThankYou", { timeout: 5000 })) {
            log(chalk.red("Task complete"));
            return;
          }
        } catch (error) {
          log(chalk.red("Start of new task"));
          await page.keyboard.type("1", { delay: 200 });
          await page.keyboard.type("1", { delay: 200 });
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
