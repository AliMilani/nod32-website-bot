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
      while (!await mail.haveNewEmail(mailAccount.username, mailAccount.password)) {
          console.log("Waiting for the link to be verified 30/" + totalChecks);
          await new Promise((resolve) => setTimeout(resolve, 2000));
          totalChecks++
          if (totalChecks > 10) {
              console.log("email verification link not found");
              // close the process
              process.exit(1);

              //   await browser.close();
          }
      }
      console.log("email verification link found !! open after 2 seconds");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      let verifyLink = await mail.getVerifyLink(mailAccount.username, mailAccount.password);
      console.log('verify Link:', verifyLink);
      await page.goto(verifyLink);
      console.log("email verification link opened");

      await new Promise((resolve) => setTimeout(resolve, 8000));
      //wait for load HTMLElement

      console.log("bot is running");

    //   await page.waitForSelector('[data-r="home-overview-empty-add-license-btn"]');
      await page.evaluate(() => {
          document.querySelector('[data-r="home-overview-empty-add-license-btn"]').click();
      });
      //   await page.click('[data-r="home-overview-empty-add-license-btn"]');
      console.log("clicked add license");
      await page.waitForSelector('[data-r="license-associate-modal-try-license-btn"]');
      await page.click('[data-r="license-associate-modal-try-license-btn"]');//Try a license for free
      console.log("clicked Try a license for free");
      await page.waitForSelector('[robot="device-protect-os-card-Windows"]');
      await page.click('[robot="device-protect-os-card-Windows"]');// os windows
      //   await page.click('[robot="device-protect-os-card-Android"]');// os android
      console.log("Os selected");
      await page.waitForSelector('[data-r="device-protect-choose-platform-continue-btn"]');
      await page.click('[data-r="device-protect-choose-platform-continue-btn"]');// continue button
      
      
      await page.waitForSelector('input');
      await page.type('input', mailAccount.username, {delay: 100});// email
      await page.click('[data-r="device-protect-get-installer-send-email-btn"]');// continue button
      await page.waitForSelector('[data-r="common-base-modal-header-close-btn"]');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await page.click('[data-r="common-base-modal-header-close-btn"]');// close icon button
      console.log("Waiting for recive license section...");

      page.waitForSelector('[data-r="license-list-open-detail-page-btn"]', { timeout: 240000 })
          .then(() => page.click('[data-r="license-list-open-detail-page-btn"]'))
          .then(() => console.log("license recived"))
          .catch(() => console.log("license not recived"));

      console.log("Waiting for recive license key...");
      await page.waitForSelector('.detail-info-section:first-child ion-col:last-child ion-text[color="dark"]', { timeout: 250000 });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const licenseHandle = await page.$('.detail-info-section:first-child ion-col:last-child ion-text[color="dark"]');
      const licenseKey = await page.evaluate((elenebt) => elenebt.innerHTML, licenseHandle);
      await licenseHandle.dispose();
      console.log(`\n license key: ${licenseKey} \n \n username: ${mailAccount.username} \n password: ${mailAccount.password + "!Aa1234"}\n`);


      fs.appendFileSync('./licenseKeys.txt', licenseKey + '\n');
      console.log("license key saved to licenseKeys.txt");

      await browser.close();
      console.log("browser closed");

  } catch (error) {
    console.log("our error", error);
  }
})();
