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

exports.getVerifyLink = async (email, password) => {
  let messages = await getAllEmails(email, password);
  if (messages.length === 0) return null;

  return await mailjs
    .getMessage(
      messages.find(
        (message) => message.subject === "Account verification - ESET HOME"
      ).id
    )
    .then((verifyMessage) =>
      verifyMessage.data.text
        .split("\n")
        .find((line) =>
          line.includes(
            "https://login.eset.com/Register/RegistrationConfirmed?token="
          )
        )
    );
};
exports.deleteMe = async () => mailjs.deleteMe();

// getAllEmails("m46bi@leadwizzer.com","z6o6kwjw").then((res)=>console.log(res));
// getAllEmails('6jda0@leadwizzer.com', '330uxhcj').then(res => console.log(res));
// getAllEmails('6jda0@leadwizzer.com', '330uxhcj').then(res => console.log(res));