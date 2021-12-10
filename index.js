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
          console.log(await mail.haveNewEmail(mailAccount.username, mailAccount.password));
          totalChecks++
          if (totalChecks > 30) {
              console.log("email verification link not found",totalChecks);
              await browser.close();
            }
        }
      console.log("email verification link found !! open after 2 seconds");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await page.goto(await mail.getVerifyLink(mailAccount.username, mailAccount.password));

      await new Promise((resolve) => setTimeout(resolve, 5000));
      await page.waitForSelector('[data-r="home-overview-empty-add-license-btn"]');
      await page.click('[data-r="home-overview-empty-add-license-btn"]');

      await page.waitForSelector('[data-r="license-associate-modal-try-license-btn"]');
      await page.click('[data-r="license-associate-modal-try-license-btn"]');//Try a license for free
      
      await page.waitForSelector('[robot="device-protect-os-card-Windows"]');
      await page.click('[robot="device-protect-os-card-Windows"]');// os windows
      //   await page.click('[robot="device-protect-os-card-Android"]');// os android
      
      await page.waitForSelector('[data-r="device-protect-choose-platform-continue-btn"]');
      await page.click('[data-r="device-protect-choose-platform-continue-btn"]');// continue button
      
      
      await page.waitForSelector('input');
      await page.type('input', mailAccount.username, {delay: 100});// email
      await page.click('[data-r="device-protect-get-installer-send-email-btn"]');// continue button
      await page.waitForSelector('[data-r="common-base-modal-header-close-btn"]');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await page.click('[data-r="common-base-modal-header-close-btn"]');// close icon button

       page.exposeFunction('Lisance', ({ type, detail }) => {
        console.log(`Event fired: ${type}, detail: ${detail}`);
    });
      page.waitForSelector('[data-r="license-list-open-detail-page-btn"]', { timeout: 240000 })
          .then(() => page.click('[data-r="license-list-open-detail-page-btn"]'));

      let allowTotry = true;
      page.waitForSelector('[data-r="license-list-open-detail-page-btn"]', { timeout: 240000 })
          .then(() => allowTotry = false)
          .then(() => page.click('[data-r="license-list-open-detail-page-btn"]')).catch(err => {
              console.log("error", err);
          }
          );
      await page.waitForSelector('.detail-info-section:first-child ion-col:last-child ion-text[color="dark"]', { timeout: 250000 });

    //   await page.waitForSelector('[data-r="license-list-open-detail-page-btn"]', { timeout: 120000 });
    //   await page.click('[data-r="license-list-open-detail-page-btn"]');// continue button
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const lisanceHandle = await page.$('.detail-info-section:first-child ion-col:last-child ion-text[color="dark"]');
      const lisanceKey = await page.evaluate((elenebt) => elenebt.innerHTML, lisanceHandle);
      await lisanceHandle.dispose();
      console.log(lisanceKey);


      fs.appendFileSync('./lisanceKeys.txt', lisanceKey + '\n');

  } catch (error) {
    console.log("our error", error);
  }
})();
