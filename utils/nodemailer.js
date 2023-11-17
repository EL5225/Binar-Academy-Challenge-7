require("dotenv").config();
const { google } = require("googleapis");
const nodemailer = require("nodemailer");
const path = require("path");
const ejs = require("ejs");

const {
  GOOGLE_REFRESH_TOKEN,
  GOOGLE_SENDER_EMAIL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
} = process.env;

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET
);

oauth2Client.setCredentials({
  refresh_token: GOOGLE_REFRESH_TOKEN,
});

const sendEmail = async (to, subject, html) => {
  try {
    const accessToken = await oauth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: GOOGLE_SENDER_EMAIL,
        clientId: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        refreshToken: GOOGLE_REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });
    transport.sendMail({ to, subject, html });
  } catch (error) {
    console.log(error);
  }
};

const getHTML = (filename, data) => {
  return new Promise((resolve, reject) => {
    const currentPath = path.resolve(__dirname, `../views/${filename}`);

    ejs.renderFile(currentPath, data, (err, html) => {
      if (err) {
        return reject(err);
      }

      return resolve(html);
    });
  });
};

module.exports = { sendEmail, getHTML };
