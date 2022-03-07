
import userService from '../services/userService'
let HandleLogin = async(req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    if(!email || !password){
        return res.status(500).json({
            errCode: 1,
            message: 'missing inputs parameter'
        });
    }
    let userData = await userService.handleUserLogin(email, password)
    return res.status(200).json({
        errCode: userData.errCode,
        message: userData.errMessage,
        user: userData.user ? userData.user : {}
        
    })
}
let handleGetAllUsers = async(req, res) => {
    let id = req.query.id; //all, id
    if(!id){
        return res.status(200).json({
            errCode: 1,
            errMessage:'Missing required parameter',
            users:[]
        })
    }
    let users= await userService.GetAllUsers(id);
    return res.status(200).json({
        errCode: 0,
        errMessage:'ok',
        users
    })
}
let handleCreateNewUser = async(req, res)=>{
    let message = await userService.createNewUser(req.body)
    return res.status(200).json(message)
}
let handleDeleteUser = async(req, res)=>{
    if(!req.body.id){
        return res.status(200).json({
            errCode: 1,
            errMessage:'Missing required parameter',
        })
    }
    let message = await userService.deleteUser(req.body.id)
    return res.status(200).json(message)

}
let handleEditUser = async(req, res)=>{
    let data = req.body
    let message = await userService.updateUserData(data)
    return res.status(200).json(message)

}

let getAllcode = async(req, res) =>{
    try {
       let data = await userService.getAllcodeService(req.query.type) ;
       return res.status(200).json(data)
    } catch (e) {
        console.log('get all code error', e)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from sever'
        })
    }
}
module.exports = {
    HandleLogin: HandleLogin,
    handleGetAllUsers:handleGetAllUsers,
    handleCreateNewUser:handleCreateNewUser,
    handleEditUser:handleEditUser,
    handleDeleteUser:handleDeleteUser,
    getAllcode:getAllcode,
}