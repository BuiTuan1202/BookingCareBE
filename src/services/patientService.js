import db from '../models/index';
require('dotenv').config();
import _ from 'lodash';
import emailService from './emailService'
import { v4 as uuidv4 } from 'uuid';

let buildUrlEmail = (doctorId, token) => {

    let result = `${process.env.REACT_URL}/verify-booking?token=${token}&doctorId=${doctorId}`
    return result;
}
let postBookingAppointmentService = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.email || !data.doctorId || !data.timeType || !data.date) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter',
                })
            } else {

                let token = uuidv4(); // ⇨ '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
                await emailService.sendSimpleEmail({
                    receiverEmail: data.email,
                    patientName: data.fullName,
                    time: data.timeString,
                    doctorName: data.doctorName,
                    language: data.language,
                    redirectLink: buildUrlEmail(data.doctorId, token)
                })
                //upsert patient
                let user = await db.User.findOrCreate({
                    where: { email: data.email },
                    defaults: {
                        email: data.email,
                        roleId: 'R3'
                    }
                });
                // create a booking record
                if (user && user[0]) {
                    await db.Booking.findOrCreate({
                        where: { patientId: user[0].id },
                        defaults: {
                            statusId: 'S1',
                            doctorId: data.doctorId,
                            patientId: user[0].id,
                            date: data.date,
                            timeType: data.timeType,
                            token: token
                        }
                    })
                }
                resolve({
                    errCode: 0,
                    message: 'save info patient success',
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}
let postVerifyBookingAppointmentService = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.token || !data.doctorId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter',
                })
            } else {
                let appointment = await db.Booking.findOne({
                    where: {
                        doctorId: data.doctorId,
                        token: data.token,
                        statusId: 'S1'
                    },
                    raw: false
                })
                if (appointment) {
                    appointment.statusId = 'S2'
                    await appointment.save();
                    resolve({
                        errCode: 0,
                        errMessage: 'update the appointment success',
                    })
                } else {
                    resolve({
                        errCode: 2,
                        errMessage: 'appointment schedule activated or nonexistent',
                    })
                }
            }
        } catch (e) {
            reject(e);
        }
    })
}
module.exports = {
    postBookingAppointmentService: postBookingAppointmentService,
    postVerifyBookingAppointmentService: postVerifyBookingAppointmentService
}