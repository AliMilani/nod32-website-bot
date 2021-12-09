const puppeteer = require("puppeteer");
const mail = require("./mail");
const fs = require("fs");

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: {
        width: 1920,
        height: 1080,
      },
    });
    const page = await browser.newPage();
      await page.goto("https://login.eset.com/Register/Index");

    // eneter the text to .account__entry #Email selector
    // const tempMailAccount =
    let mailAccount = await mail.createEmail();
    console.log(mailAccount);
    page.setDefaultNavigationTimeout( 90000 );
    await page.type(".account__entry #Email", mailAccount.username);
    await page.type(".account__entry #Password", mailAccount.password+"!Aa1234");
    await page.type(".account__entry #ConfirmPassword", mailAccount.password+"!Aa1234");
    await page.select(".account__entry #SelectedCountry", "232");
    await page.click('[type="submit"][value="Create account"');

      let totalChecks = 0;
      while (!await mail.getVerifyLink(mailAccount.username,mailAccount.password)) {
          console.log("Waiting for the link to be verified");
          await new Promise((resolve) => setTimeout(resolve, 2000));
          console.log(await mail.getVerifyLink(mailAccount.username,mailAccount.password));
          //exit browser
          totalChecks++
          if (totalChecks > 30) {
              console.log("email verification link not found",totalChecks);
              await browser.close();
            }
        }
        console.log("email verification link found !! open after 5 seconds");
        await new Promise((resolve) => setTimeout(resolve, 5000));
    //   await page.goto(await mail.getVerifyLink(mailAccount.username, mailAccount.password));
    //   await page.waitForNavigation();
      await new Promise((resolve) => setTimeout(resolve, 8000));
      await page.waitForSelector('[data-r="home-overview-empty-add-license-btn"]');
      await page.click('[data-r="home-overview-empty-add-license-btn"]');

      await page.waitForSelector('[data-r="license-associate-modal-try-license-btn"]');
      await page.click('[data-r="license-associate-modal-try-license-btn"]');//Try a license for free
      //   await page.waitForNavigation();
      
      
      await page.waitForSelector('[robot="device-protect-os-card-Windows"]');
      await page.click('[robot="device-protect-os-card-Windows"]');// os windows
      //   await page.click('[robot="device-protect-os-card-Android"]');// os android
      
      await page.waitForSelector('[data-r="device-protect-choose-platform-continue-btn"]');
      await page.click('[data-r="device-protect-choose-platform-continue-btn"]');// continue button
      //   await page.waitForNavigation();
      
      
      await page.waitForSelector('input');
      await page.type('input', mailAccount.username, {delay: 100});// email
      await page.click('[data-r="device-protect-get-installer-send-email-btn"]');// continue button
      await page.waitForSelector('[data-r="common-base-modal-header-close-btn"]');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await page.click('[data-r="common-base-modal-header-close-btn"]');// close icon button
      
      // go to https://home.eset.com/licenses
    //   await page.goto("https://home.eset.com/licenses");
    //   await page.waitForNavigation();

      // wait for load #license-list-large-previews > ion-row > ion-col > ion-card > ion-button
    //   await page.click('[data-r*="btn"]');// continue button
      //refresh page after 5 seconds with interval for 10 times
       page.exposeFunction('Lisance', ({ type, detail }) => {
        console.log(`Event fired: ${type}, detail: ${detail}`);
    });
      page.waitForSelector('[data-r="license-list-open-detail-page-btn"]', { timeout: 240000 })
          .then(() => page.click('[data-r="license-list-open-detail-page-btn"]'));
    //   await new Promise((resolve) => setTimeout(resolve, 30000));
    //     await page.goto("https://home.eset.com/licenses");
    //   await new Promise((resolve) => setTimeout(resolve, 30000));
    //   await page.goto("https://home.eset.com/licenses");

      //clear interval after 10 times

      await page.waitForSelector('[data-r="license-list-open-detail-page-btn"]', { timeout: 120000 });
      await page.click('[data-r="license-list-open-detail-page-btn"]');// continue button
      await new Promise((resolve) => setTimeout(resolve, 2000));
    //   await page.waitForSelector('.detail-info-section:first-child ion-col:last-child ion-text[color="dark"]');
      const html = await page.content();
      //append html to file
          await fs.appendFile("lisance.html", html, function (err) {
            if (err) throw err;
            console.log("Saved!");
          });
        await browser.close();

  } catch (error) {
    console.log("our error", error);
  }
})();
