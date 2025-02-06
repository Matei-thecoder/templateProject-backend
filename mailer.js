const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service:"yahoo",
    auth: {
      user: process.env.EMAIL_USER, // Your Mail.com email address
      pass: process.env.EMAIL_PASSWORD, // Your Mail.com email password
    },
    
  });
  

  transporter.verify((error, success) => {
    if (error) {
      console.error("SMTP connection failed:", error);
      console.log('here');
  console.log("Email User:", process.env.EMAIL_USER);
console.log("Email Pass:", process.env.EMAIL_PASSWORD);
    } else {
      console.log("SMTP Server is ready to send emails.");
    }
  });
    

  const sendEmail = async (to, manufacturer, model, fault, comments, estimatedPrice) => {
    const subject = "Order Notification – Repair Estimate for Your Device";
  
    const message = `
  Dear Customer,
  
  We have received your order and conducted an assessment of your device. Below are the details of your request:
  
  - Manufacturer: ${manufacturer}
  - Model: ${model}
  - Reported Fault: ${fault}
  - Additional Comments: ${comments}
  
  Based on our evaluation, the estimated cost for the repair/service is **$${estimatedPrice}**.
  
  Please confirm if you would like us to proceed with the repair. If you have any questions or require further clarification, feel free to reach out.
  
  Best regards,  
  TemplateProject
  templateproject@mail.com
    `;
  
    try {
      const info = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text: message,
      });
  
      console.log("Email sent:", info.response);
      return { success: true, message: "Email sent successfully" };
    } catch (error) {
      console.error("Error sending email:", error);
      return { success: false, message: "Failed to send email" };
    }
  };
  
  
  // Export function
  module.exports = sendEmail;