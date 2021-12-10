const Mailjs = require("@cemalgnlts/mailjs");
const mailjs = new Mailjs();

exports.createEmail = async () =>
  await mailjs.createOneAccount().then((res) => {
    if (res.status === false) return false;
    return res.data;
  });

const loginEmail = async (email, password) =>
  await mailjs.login(email, password).then((res) => res.data.id);

const getAllEmails = async (email, password) => {
  return await loginEmail(email, password)
    .then((id) => mailjs.getMessages())
    .then((res) => res.data);
};

exports.haveNewEmail = async (email, password) => {
  // check ahve new mail
  const emails = await getAllEmails(email, password);
  if (emails.length === 0) return false;
  return true;
}

exports.getVerifyLink = async (email, password) => {
  let messages = await getAllEmails(email, password);
  if (messages.length === 0) return null;

  return await mailjs
    .getMessage(messages.find((message) => message.subject === "Account verification - ESET HOME").id)
    .then((verifyMessage) => {
      if (verifyMessage.data.text) {
        let VerifyLink = verifyMessage.data.text.split("\n")[5];
       return VerifyLink ? VerifyLink : null;
      }
    }
    );
};
exports.deleteMe = async () => mailjs.deleteMe();

// getAllEmails("m46bi@leadwizzer.com","z6o6kwjw").then((res)=>console.log(res));
// getAllEmails('6jda0@leadwizzer.com', '330uxhcj').then(res => console.log(res));
// getAllEmails('6jda0@leadwizzer.com', '330uxhcj').then(res => console.log(res));