import db from '../models/index';
require('dotenv').config();
import _ from 'lodash';
import emailService from '../services/emailService'

const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE;
let getTopDoctorHomeService = (limit) => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = await db.User.findAll({
                limit: limit,
                order: [['createdAt', 'DESC']],
                where: { roleId: 'R2' },
                attributes: {
                    exclude: ['password',]
                },
                include: [
                    { model: db.Allcode, as: 'positionData', attributes: ['valueVi', 'valueEn'] },
                    { model: db.Allcode, as: 'genderData', attributes: ['valueVi', 'valueEn'] }
                ],
                raw: true,
                nest: true
            })
            resolve({
                errCode: 0,
                mesage: 'get user succsess',
                data: users
            })
        } catch (e) {
            reject(e)
        }
    })
}
let getAllDoctorService = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let doctors = await db.User.findAll({
                where: { roleId: 'R2' },
                attributes: {
                    exclude: ['password', 'image']
                },
            })
            resolve({
                errCode: 0,
                mesage: 'get user succsess',
                data: doctors
            })
        } catch (e) {
            reject(e)
        }
    })
}
let checkRequiredFields = (inputData) => {
    let arrFields = ['doctorId', 'contentMarkdown', 'contentHTML', 'action',
        'selectedPayment', 'selectedProvince', 'nameClinic', 'addressClinic',
        'note', 'selectedPrice', 'specialtyId']
    let isValid = true;
    let element = ''
    for (let i = 0; i < arrFields.length; i++) {
        if (!inputData[arrFields[i]]) {
            isValid = false;
            element = arrFields[i]
            break;
        }
    }
    return {
        isValid: isValid,
        element: element
    }
}
let saveInforDoctorService = (InputData) => {
    return new Promise(async (resolve, reject) => {
        try {
            let checkObj = checkRequiredFields(InputData)
            if (checkObj === false) {
                resolve({
                    errCode: 1,
                    errMessage: `Missing parameter: ${checkObj.element}`,
                })
            } else {

                // upsert to doctor Markdown
                if (InputData.action === 'CREATE') {
                    await db.Markdown.create({
                        contentHTML: InputData.contentHTML,
                        contentMarkdown: InputData.contentMarkdown,
                        description: InputData.description,
                        doctorId: InputData.doctorId,

                    })
                }
                else if (InputData.action === 'EDIT') {
                    let doctorMarkdown = await db.Markdown.findOne({
                        where: { doctorId: InputData.doctorId },
                        raw: false
                    })
                    if (doctorMarkdown) {
                        doctorMarkdown.contentHTML = InputData.contentHTML;
                        doctorMarkdown.contentMarkdown = InputData.contentMarkdown;
                        doctorMarkdown.description = InputData.description;
                        doctorMarkdown.updatedAt = new Date()
                        await doctorMarkdown.save()

                    }
                }

                //upsert to doctorInfo table
                let doctorInfo = await db.DoctorInfo.findOne({
                    where: {
                        doctorId: InputData.doctorId,
                    },
                    raw: false
                })

                if (doctorInfo) {
                    //update
                    doctorInfo.doctorId = InputData.doctorId;
                    doctorInfo.priceId = InputData.selectedPrice;
                    doctorInfo.paymentId = InputData.selectedPayment;
                    doctorInfo.provinceId = InputData.selectedProvince;
                    doctorInfo.nameClinic = InputData.nameClinic;
                    doctorInfo.addressClinic = InputData.addressClinic;
                    doctorInfo.note = InputData.note;
                    doctorInfo.specialtyId = InputData.specialtyId;
                    doctorInfo.clinicId = InputData.clinicId;


                    await doctorInfo.save()
                }
                else {
                    //create
                    await db.DoctorInfo.create({
                        doctorId: InputData.doctorId,
                        priceId: InputData.selectedPrice,
                        paymentId: InputData.selectedPayment,
                        provinceId: InputData.selectedProvince,
                        nameClinic: InputData.nameClinic,
                        addressClinic: InputData.addressClinic,
                        note: InputData.note,
                        specialtyId: InputData.specialtyId,
                        clinicId: InputData.clinicId,

                    })
                }
                resolve({
                    errCode: 0,
                    Mesage: 'save infor doctor success',
                })
            }


        } catch (e) {
            reject(e)
        }
    })
}
let getDetailDoctorService = (inputId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputId) {
                resolve({
                    errCode: 1,
                    errMesage: 'Missing parameter',
                })
            }
            else {
                let data = await db.User.findOne({
                    where: { id: inputId },
                    attributes: {
                        exclude: ['password',]
                    },
                    include: [
                        { model: db.Markdown, attributes: ['contentHTML', 'contentMarkdown', 'description'] },
                        { model: db.Allcode, as: 'positionData', attributes: ['valueVi', 'valueEn'] },
                        {
                            model: db.DoctorInfo,
                            attributes: {
                                exclude: ['id', 'doctorId']
                            },
                            include: [
                                { model: db.Allcode, as: 'priceData', attributes: ['valueVi', 'valueEn'] },
                                { model: db.Allcode, as: 'provinceData', attributes: ['valueVi', 'valueEn'] },
                                { model: db.Allcode, as: 'paymentData', attributes: ['valueVi', 'valueEn'] },
                                { model: db.Specialty, as: 'specialtyData', attributes: ['name'] },
                                { model: db.Clinic, as: 'clinicData', attributes: ['name'] },
                            ]
                        },

                    ],
                    raw: false,
                    nest: true

                })
                if (data && data.image) {
                    data.image = new Buffer.from(data.image, 'base64').toString('binary')
                }
                if (!data) data = {}
                resolve({
                    errCode: 0,
                    mesage: 'get doctor by id succsess',
                    data: data
                })
            }


        } catch (e) {
            reject(e)
        }
    })
}
let bulkCreateScheduleService = (data) => {
    return new Promise(async (resolve, reject) => {
        try {

            if (!data.arrSchedule || !data.doctorId || !data.date) {
                resolve({
                    errCode: 1,
                    errMesage: 'Missing parameter',
                })
            } else {

                let schedule = data.arrSchedule;
                if (schedule && schedule.length > 0) {
                    schedule = schedule.map(item => {
                        item.maxNumber = MAX_NUMBER_SCHEDULE;
                        return item;
                    })
                }


                let existing = await db.Schedule.findAll({
                    where: { doctorId: data.doctorId, date: data.date },
                    attributes: ['timeType', 'date', "doctorId", 'maxNumber'],
                    raw: true

                });
                // //convert date
                // if (existing && existing.length > 0) {
                //     existing = existing.map(item => {
                //         item.date = new Date(item.date).getTime()
                //         return item;
                //     })
                // }

                //compare different
                let toCreate = _.differenceWith(schedule, existing, (a, b) => {
                    return a.timeType === b.timeType && +a.date === +b.date;
                });
                //create data
                if (toCreate && toCreate.length > 0) {
                    await db.Schedule.bulkCreate(toCreate)
                }


                resolve({
                    errCode: 0,
                    errMesage: 'ok',
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}
let getScheduleDoctorByDateService = (doctorId, date) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId || !date) {
                resolve({
                    errCode: 1,
                    errMesage: 'Missing parameter',
                })
            } else {
                let data = await db.Schedule.findAll({
                    where: {
                        doctorId: doctorId,
                        date: date
                    }, include: [
                        { model: db.Allcode, as: 'timeTypeData', attributes: ['valueVi', 'valueEn'] },
                        { model: db.User, as: 'doctorData', attributes: ['firstName', 'lastName'] },

                    ],
                    raw: false,
                    nest: true
                })
                if (!data) data = []
                resolve({
                    errCode: 0,
                    errMesage: 'get schedule doctor by id success',
                    data: data
                })
            }
        } catch (e) {
            reject(e)

        }
    })
}

let getExtraInfoByIdService = (doctorId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId) {
                resolve({
                    errCode: 1,
                    errMesage: 'Missing parameter',
                })
            } else {
                let data = await db.DoctorInfo.findOne({
                    where: { doctorId: doctorId },
                    attributes: {
                        exclude: ['id', 'doctorId']
                    },
                    include: [
                        { model: db.Allcode, as: 'priceData', attributes: ['valueVi', 'valueEn'] },
                        { model: db.Allcode, as: 'provinceData', attributes: ['valueVi', 'valueEn'] },
                        { model: db.Allcode, as: 'paymentData', attributes: ['valueVi', 'valueEn'] },
                    ],
                    raw: true,
                    nest: true
                })
                if (!data) data = {}
                resolve({
                    errCode: 0,
                    message: 'get extra info by doctorId success',
                    data: data
                })
            }
        } catch (e) {
            reject(e)

        }
    })
}
let getProfileDoctorByIdService = (inputId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputId) {
                resolve({
                    errCode: 1,
                    errMesage: 'Missing parameter',
                })
            } else {
                let data = await db.User.findOne({
                    where: { id: inputId },
                    attributes: {
                        exclude: ['password',]
                    },
                    include: [
                        { model: db.Markdown, attributes: ['description'] },
                        { model: db.Allcode, as: 'positionData', attributes: ['valueVi', 'valueEn'] },
                        {
                            model: db.DoctorInfo,
                            attributes: {
                                exclude: ['id', 'doctorId']
                            },
                            include: [
                                { model: db.Allcode, as: 'priceData', attributes: ['valueVi', 'valueEn'] },
                                { model: db.Allcode, as: 'provinceData', attributes: ['valueVi', 'valueEn'] },
                                { model: db.Allcode, as: 'paymentData', attributes: ['valueVi', 'valueEn'] },
                            ]
                        },

                    ],
                    raw: false,
                    nest: true

                })
                if (data && data.image) {
                    data.image = new Buffer.from(data.image, 'base64').toString('binary')
                }
                if (!data) data = {}
                resolve({
                    errCode: 0,
                    message: 'get doctor by id succsess',
                    data: data
                })
            }
        } catch (e) {
            reject(e)

        }
    })
}
let getListPatientForDoctorService = (doctorId, date) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId || !date) {
                resolve({
                    errCode: 1,
                    errMesage: 'Missing parameter',
                })
            } else {
                let data = await db.Booking.findAll({
                    where: {
                        statusId: 'S2',
                        doctorId: doctorId,
                        date: date

                    },
                    include: [
                        {
                            model: db.User, as: 'patientData',
                            attributes: ['email', 'firstName', 'address', 'gender', 'phonenumber'],

                            include: [
                                { model: db.Allcode, as: 'genderData', attributes: ['valueVi', 'valueEn'] },

                            ]
                        },
                        { model: db.Allcode, as: 'timeTypeDataPatient', attributes: ['valueVi', 'valueEn'] },

                    ],
                    raw: true,
                    nest: true
                })
                resolve({
                    errCode: 0,
                    message: 'get doctor by id succsess',
                    data: data
                })
            }
        } catch (e) {
            reject(e)

        }
    })
}
let sendBillService = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.email || !data.doctorId || !data.patientId || !data.timeType) {
                resolve({
                    errCode: 1,
                    errMesage: 'Missing parameter',
                })
            } else {
                // update booking status
                let appointment = await db.Booking.findOne({
                    where: {
                        doctorId: data.doctorId,
                        patientId: data.patientId,
                        timeType: data.timeType,
                        statusId: 'S2'
                    },
                    raw: false,
                })
                if (appointment) {
                    appointment.statusId = 'S3';
                    await appointment.save()

                }
                // send email bill
                await emailService.sendAttachment(
                    data
                )
                resolve({
                    errCode: 0,
                    message: 'send bill succsess',
                    data: data
                })
            }
        } catch (e) {
            reject(e)

        }
    })
}
module.exports = {
    getTopDoctorHomeService: getTopDoctorHomeService,
    getAllDoctorService: getAllDoctorService,
    saveInforDoctorService: saveInforDoctorService,
    getDetailDoctorService: getDetailDoctorService,
    bulkCreateScheduleService: bulkCreateScheduleService,
    getScheduleDoctorByDateService: getScheduleDoctorByDateService,
    getExtraInfoByIdService: getExtraInfoByIdService,
    getProfileDoctorByIdService: getProfileDoctorByIdService,
    getListPatientForDoctorService: getListPatientForDoctorService,
    sendBillService: sendBillService,
}