const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mohdmushraf913131@gmail.com",
    pass: "nhjk juji msjg xvlf",
  },
});

const sendReorderEmail = async (productName, productQuantity, reorderLevel) => {
  const mailOptions = {
    from: "mohdmushraf913131@gmail.com",
    to: "theremushraf@gmail.com",
    subject: `Reorder Alert: ${productName}`,
    text: `The stock level of ${productName} has reached the reorder level.\nCurrent quantity: ${productQuantity}\nReorder level: ${reorderLevel}`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("📩 Email sent:", info.response);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};

module.exports = { sendReorderEmail };
