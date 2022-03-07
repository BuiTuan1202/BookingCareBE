import db from '../models/index'

let getTopDoctorHomeService =(limit)=>{
    return new Promise(async (reslove, reject)=>{
        try {
            let users = await db.User.findAll({
                limit: limit,
                order:[['createdAt', 'DESC']],
                where: {roleId: 'R2'},
                attributes: {
                    exclude: ['password',]
                },
                include:[
                    {model:db.Allcode, as:'positionData', attributes:['valueVi','valueEn']},
                    {model:db.Allcode, as:'genderData', attributes:['valueVi','valueEn']}
                ],
                raw:true,
                nest:true
            })
            reslove({
                errCode:0,
                mesage:'get user succsess',
                data: users
            })
        } catch (e) {
            reject(e)
        }
    })
} 
let getAllDoctorService= ()=>{
    return new Promise(async (reslove, reject)=>{
        try {
            let doctors = await db.User.findAll({
                where: {roleId: 'R2'},
                attributes: {
                    exclude: ['password', 'image']
                },
            })
            reslove({
                errCode:0,
                mesage:'get user succsess',
                data: doctors
            })
        } catch (e) {
            reject(e)
        }
    })
}

let saveInforDoctorService = (InputData)=>{
    return new Promise(async (reslove, reject)=>{
        try {
            if(!InputData.doctorId || !InputData.contentMarkdown || !InputData.contentHTML){
                reslove({
                    errCode:1,
                    errMesage:'Missing parameter',
                })
            }else{
                 await db.Markdown.create({
                    contentHTML: InputData.contentHTML,
                    contentMarkdown:InputData.contentMarkdown,
                    description:InputData.description,
                    doctorId:InputData.doctorId,

                })
                reslove({
                    errCode:0,
                    Mesage:'save infor doctor success',
                })
            }


        } catch (e) {
            reject(e)
        }
    })
}
module.exports ={
    getTopDoctorHomeService: getTopDoctorHomeService,
    getAllDoctorService:getAllDoctorService,
    saveInforDoctorService:saveInforDoctorService,
}