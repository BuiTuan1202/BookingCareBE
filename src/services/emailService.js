require('dotenv').config();
import nodemailer from 'nodemailer'

let sendSimpleEmail = async (dataSend) => {

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_APP, // generated ethereal user
            pass: process.env.EMAIL_APP_PASSWORD, // generated ethereal password
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"Booking Care" <buivantuan12022000@gmail.com>', // sender address
        to: dataSend.receiverEmail, // list of receivers
        subject: "Thông tin đặt lịch khám bệnh", // Subject line
        html: getBodyHTMLEmail(dataSend), // html body
    });
}

let getBodyHTMLEmail = (dataSend) => {
    let result = '';
    if (dataSend.language === 'vi') {
        result = `
        <h3> xin chào ${dataSend.patientName}</h3>
        <p>Bạn nhận được email này vì đã đặt lịch khám online trên BookingCare</p>
        <p>Thông tin đặt lịch khám bệnh:</p>
        <div><b>Thời gian: ${dataSend.time}</b></div>
        <div><b>Bác sĩ: ${dataSend.doctorName}</b></div>

        <p>Nếu các thông tin trên là đúng, vui lồng click vào đường link này để 
        xác nhận và hoàn tất thủ tục đặt lịch khám bệnh</p>
        <div>
        <a href=${dataSend.redirectLink} target="_blank"> Click here</a>
        </div>
        <div>Xin chân thành cảm ơn</div>
        `
    }
    if (dataSend.language === 'en') {
        result = `
        <h3> Dear ${dataSend.patientName}</h3>
        <p>You received this email for booking online on BookingCare</p>
        <p>Medical appointment information:</p>
        <div><b>Time: ${dataSend.time}</b></div>
        <div><b>Doctor: ${dataSend.doctorName}</b></div>

        <p>If the above information is true, please click on this link to 
        confirm and complete the procedure for booking medical examinations</p>
        <div>
        <a href=${dataSend.redirectLink} target="_blank"> Click here</a>
        </div>
        <div>Thank you very much.</div>
        `
    }
    return result;
}

let sendAttachment = async (dataSend) => {

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_APP, // generated ethereal user
            pass: process.env.EMAIL_APP_PASSWORD, // generated ethereal password
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"Booking Care" <buivantuan12022000@gmail.com>', // sender address
        to: dataSend.email, // list of receivers
        subject: "Thông báo hoàn thành khám bệnh", // Subject line
        html: getBodyHTMLEmailBill(dataSend), // html body
        attachments: [
            {   // define custom content type for the attachment
                filename: `Bill-${dataSend.patientId}-${new Date().getTime()}.png`,
                content: dataSend.imgBase64.split("base64")[1],
                encoding: 'base64'
            },
        ],
    });
}
let getBodyHTMLEmailBill = (dataSend) => {
    let result = '';
    if (dataSend.language === 'vi') {
        result = `
        <h3> Xin chào ${dataSend.patientName},</h3>
        <p>Bạn nhận được email này vì đã hoàn thành quy trình khám bệnh tại BookingCare</p>
        <p>Thông tin đơn thuốc/ hóa đơn được gửi trong file đính kèm</p>
     
        <div>Xin chân thành cảm ơn</div>
        `
    }
    if (dataSend.language === 'en') {
        result = `
        <h3> Dear ${dataSend.patientName},</h3>
        <p>You received this email because you have completed your medical examination at BookingCare</p>
        <p>Prescription/invoice information sent in attachments</p>

        <div>Thank you very much.</div>
        `
    }
    return result;
}

module.exports = {
    sendSimpleEmail: sendSimpleEmail,
    sendAttachment: sendAttachment
}