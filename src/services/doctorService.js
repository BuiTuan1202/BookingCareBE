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
module.exports ={
    getTopDoctorHomeService: getTopDoctorHomeService
}