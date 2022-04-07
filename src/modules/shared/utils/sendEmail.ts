import nodemailer from "nodemailer";

export const sendEmail = async (
  to: string,
  heading: string,
  url: string
): Promise<void> => {
  // const testAccount = await nodemailer.createTestAccount();
  // console.log(testAccount);

  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: "d64wejrqxespzirk@ethereal.email",
      pass: "H2AK36DjbrHfSy4mNP",
    },
  });

  const info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>',
    to,
    subject: heading,
    html: `
    <html>
      <body>
        <h1>
          ${heading}
        </h1>
        <a href="${url}">
        Click here to confirm
        </a>
      </body>
    </html>
    `,
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
};
