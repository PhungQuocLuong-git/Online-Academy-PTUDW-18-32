const nodeMailer = require('nodemailer')
const adminEmail = 'nhom15webhcmus@gmail.com'
const adminPassword = 'adminAdm1n'
const mailHost = 'smtp.gmail.com'
const mailPort = 587
const sendMail = (to, subject, htmlContent) => {
  const transporter = nodeMailer.createTransport({
    host: mailHost,
    port: mailPort,
    secure: false,
    auth: {
      user: adminEmail,
      pass: adminPassword
    }
  })
  const options = {
    from: adminEmail, 
    to: to, 
    subject: subject, 
    html: htmlContent 
  }
  return transporter.sendMail(options)
}
module.exports = {
  sendMail: sendMail
}