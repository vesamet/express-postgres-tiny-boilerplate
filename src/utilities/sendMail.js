const nodemailer = require("nodemailer")

async function sendMail(type, email, token) {
  try {
    //Stop the request if Block email environment variable is truty
    if (process.env.SMTP_BLOCK_EMAIL == "true") {
      console.log(
        "request for " +
          type +
          " received. Email not sent because SMTP_BLOCK_EMAIL is set to true."
      )
      console.log("Token given is : " + token)
      return
    }
    //Define transporter
    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PW
      },
      debug: true
    })
    //Define email:
    //You may define other email templates by adding them in the switch case.
    var subject, text, actionUrl, message, actionLabel
    switch (type) {
      case "emailConfirmation":
        subject = "Confirm Your Email ✔"
        actionUrl = process.env.APP_URL + "/?confirmEmail=" + token
        actionLabel = "CONFIRM YOUR EMAIL"
        message = "Confirm your Email by clicking on the link below:<br> "
        text = message + actionUrl
        break
      case "resetPassword":
        subject = "Reset Your Password ✔"
        actionUrl = process.env.APP_URL + "/?resetPassword=" + token
        actionLabel = "RESET YOUR PASSWORD"
        message = "Define a new pasword by following the link below:<br> "
        text = message + actionUrl
        break
      case "passwordChange":
        subject = "Password Changed"
        actionUrl = ""
        actionLabel = ""
        message = `Hi there. We just wanted to inform you that your password has been successfully changed.<br>
          If you aren't the one who changed it, please request a password reset by following the corresponding link on the login page.`
        text = message
        break
      default:
        throw "No email template defined"
    }
    //Send mail
    let info = await transporter.sendMail({
      from:
        '"' +
        process.env.SMTP_FROM_NAME +
        '" <' +
        process.env.SMTP_FROM_EMAIL +
        ">", // sender address
      to: [email], // list of receivers
      subject: subject,
      text: text,
      html:
        `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>` +
        process.env.APP_NAME +
        `</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin: 0; padding: 0;">
<table border="0" cellpadding="0" cellspacing="0" width="100%">	
<tr>
  <td style="padding: 10px 0 30px 0;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border: 1px solid #cccccc; border-collapse: collapse;">
      <tr>
        <td align="center" bgcolor="#70bbd9" style="padding: 4px 0 4px 0; color: #153643; font-size: 28px; font-weight: bold; font-family: Arial, sans-serif;">
        </td>
      </tr>
      <tr>
        <td bgcolor="#ffffff" style="padding: 40px 30px 40px 30px;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="color: #153643; font-family: Arial, sans-serif; font-size: 24px;">
                <b>Almost done!</b>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px 0 30px 0; color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;">
                ` +
        message +
        ` <a href="` +
        actionUrl +
        `" style="color: SlateBlue;">` +
        actionLabel +
        `</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td bgcolor="#ee4c50" style="padding: 30px 30px 30px 30px;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;" width="75%">
                &reg; ` +
        process.env.APP_NAME +
        `<br/>
              </td>
              <td align="right" width="25%">
                <table border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-family: Arial, sans-serif; font-size: 12px; font-weight: bold;">
                    </td>
                    <td style="font-size: 0; line-height: 0;" width="20">&nbsp;</td>
                    <td style="font-family: Arial, sans-serif; font-size: 12px; font-weight: bold;">
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </td>
</tr>
</table>
</body>
</html>
    `
    })
    console.log("Message sent: %s", info.messageId)
    return info.messageId
  } catch (error) {
    throw error
  }
}
module.exports = sendMail
