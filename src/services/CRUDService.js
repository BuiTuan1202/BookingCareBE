import bcrypt from 'bcryptjs';
import db from '../models/index'


var salt = bcrypt.genSaltSync(10);
let createNewUser = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let hashUserPasswordfromBycrypt = await hashUserPassword(data.password)
            await db.User.create({
                email: data.email,
                password: hashUserPasswordfromBycrypt,
                firstName: data.firstName,
                lastName: data.lastName,
                address: data.address,
                phonenumber: data.phonenumber,
                gender: data.gender === '1' ? true : false,
                roleId: data.roleId,
            })
            resolve('create a new user succeed')
        } catch (e) {
            reject(e)

        }
    })

}

let hashUserPassword = (password) => {
    return new Promise(async (resolve, reject) => {
        try {
            var hashUserPassword = await bcrypt.hashSync(password, salt);
            resolve(hashUserPassword)
        } catch (e) {
            reject(e)

        }

    })
}

let getAllUser = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let Users = db.User.findAll({ raw: true });
            resolve(Users);
        } catch (e) {
            reject(e)

        }
    })
}

let getUserInforById = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { id: userId }, raw: true
            })
            if (user) {
                resolve(user)
            }
            else {
                resolve({})
            }
        } catch (e) {
            reject(e)

        }
    })
}

let UpdateUserData = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { id: data.id }
            })
            if (user) {
                user.firstName = data.firstName;
                user.lastName = data.lastName;
                user.address = data.address;
                await user.save()

                let allUsers = await db.User.findAll();
                resolve(allUsers)
            }
            else {
                resolve()
            }
        } catch (e) {
            console.log(e)

        }
    })

}

let DeleteUserById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { id: id }
            })
            if(user){
                await user.destroy();
                
            }
            resolve()
        } catch (e) {
            reject(e)

        }
    })
}
module.exports = {
    createNewUser: createNewUser,
    getAllUser: getAllUser,
    getUserInforById: getUserInforById,
    UpdateUserData: UpdateUserData,
    DeleteUserById: DeleteUserById,
}