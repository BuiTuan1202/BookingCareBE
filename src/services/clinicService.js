const db = require("../models")
let createClinicService = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.name || !data.imageBase64 || !data.address
                || !data.descriptionHTML || !data.descriptionMarkdown) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter',
                })
            } else {
                await db.Clinic.create({
                    name: data.name,
                    address: data.address,
                    descriptionHTML: data.descriptionHTML,
                    descriptionMarkdown: data.descriptionMarkdown,
                    image: data.imageBase64
                })
                resolve({
                    errCode: 0,
                    errMessage: 'Create new specialty success',
                })
            }
        } catch (e) {
            reject(e)

        }
    })
}
let getAllClinicService = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let data = await db.Clinic.findAll();
            if (data && data.length > 0) {
                data.map(item => {

                    item.image = new Buffer.from(item.image, 'base64').toString('binary')
                    return item
                })
            }
            resolve({
                errCode: 0,
                errMessage: 'get all clinic success',
                data
            })
        } catch (e) {
            reject(e)

        }
    })
}
let getDetailClinicByIdService = (inputId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputId) {
                resolve({
                    errCode: 1,
                    errMessage: `Missing parameter `,
                })
            }
            else {
                let data = await db.Clinic.findOne({
                    where: {
                        id: inputId
                    },
                    attributes: ['image', 'name', 'address', 'descriptionHTML', 'descriptionMarkdown'],
                })
                if (data && data.image) {
                    data.image = new Buffer.from(data.image, 'base64').toString('binary')
                }
                if (data) {
                    let doctorClinic = [];

                    doctorClinic = await db.DoctorInfo.findAll({
                        where: { clinicId: inputId },
                        attributes: ['doctorId',],
                    })



                    data.doctorClinic = doctorClinic;

                } else data = {}
                resolve({
                    errCode: 0,
                    Message: 'get detail special by id success',
                    data
                })

            }


        } catch (e) {
            reject(e)

        }
    })
}
module.exports = {
    createClinicService: createClinicService,
    getAllClinicService: getAllClinicService,
    getDetailClinicByIdService: getDetailClinicByIdService,
}