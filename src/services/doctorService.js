import db from '../models/index';
require('dotenv').config();
import _ from 'lodash';

const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE;
let getTopDoctorHomeService = (limit) => {
    return new Promise(async (reslove, reject) => {
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
            reslove({
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
    return new Promise(async (reslove, reject) => {
        try {
            let doctors = await db.User.findAll({
                where: { roleId: 'R2' },
                attributes: {
                    exclude: ['password', 'image']
                },
            })
            reslove({
                errCode: 0,
                mesage: 'get user succsess',
                data: doctors
            })
        } catch (e) {
            reject(e)
        }
    })
}

let saveInforDoctorService = (InputData) => {
    return new Promise(async (reslove, reject) => {
        try {
            if (!InputData.doctorId || !InputData.contentMarkdown || !InputData.contentHTML || !InputData.action) {
                reslove({
                    errCode: 1,
                    errMesage: 'Missing parameter',
                })
            } else {
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
                reslove({
                    errCode: 0,
                    Mesage: 'save infor doctor success',
                })
            }


        } catch (e) {
            reject(e)
        }
    })
}
let getDetailDoctorService = (inputid) => {
    return new Promise(async (reslove, reject) => {
        try {
            if (!inputid) {
                reslove({
                    errCode: 1,
                    errMesage: 'Missing parameter',
                })
            }
            else {
                let data = await db.User.findOne({
                    where: { id: inputid },
                    attributes: {
                        exclude: ['password',]
                    },
                    include: [
                        { model: db.Markdown, attributes: ['contentHTML', 'contentMarkdown', 'description'] },
                        { model: db.Allcode, as: 'positionData', attributes: ['valueVi', 'valueEn'] },

                    ],
                    raw: false,
                    nest: true

                })
                if (data && data.image) {
                    data.image = new Buffer(data.image, 'base64').toString('binary')
                }
                if (!data) data = {}
                reslove({
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
    return new Promise(async (reslove, reject) => {
        try {

            if (!data.arrSchedule || !data.doctorId || !data.date) {
                reslove({
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
                if (existing && existing.length > 0) {
                    existing = existing.map(item => {
                        item.date = new Date(item.date).getTime()
                        return item;
                    })
                }
                //compare different
                let toCreate = _.differenceWith(schedule, existing, (a, b) => {
                    return a.timeType === b.timeType && a.date === b.date;
                });
                //create data
                if (toCreate && toCreate.length > 0) {
                    await db.Schedule.bulkCreate(toCreate)
                }


                reslove({
                    errCode: 0,
                    errMesage: 'ok',
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
}