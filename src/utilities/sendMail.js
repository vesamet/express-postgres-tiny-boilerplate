const nodemailer = require("nodemailer")

async function sendMail(type, email, token) {
  try {
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
    //Define token:
    const actionUrl = process.env.APP_URL + "/?confirmEmail=" + token
    // send mail with defined transport object
    if (type === "emailConfirmation") {
      let info = await transporter.sendMail({
        from:
          '"' +
          process.env.SMTP_FROM_NAME +
          '" <' +
          process.env.SMTP_FROM_EMAIL +
          ">", // sender address
        to: [email], // list of receivers
        subject: "Confirm Your Email ✔",
        text:
          "Confirm your Email by clicking on the following link:" +
          process.env.APP_URL,
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
                      Click on the following link to confirm your email: <a href="` +
          actionUrl +
          `" style="color: SlateBlue;">` +
          actionUrl +
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
    } else {
      return false
    }
  } catch (error) {
    throw error
  }
}
module.exports = sendMail
