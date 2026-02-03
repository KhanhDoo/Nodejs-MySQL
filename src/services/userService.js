import { raw } from 'body-parser';
import db from '../models/index'
import bcrypt from 'bcryptjs';
import { where } from 'sequelize';


const salt = bcrypt.genSaltSync(10);

let hashUserPassword = (password) => {
    return new Promise(async (resolve, reject) => {
        try {
            const hashPassword = await bcrypt.hashSync(password, salt);
            resolve(hashPassword);
        } catch (error) {
            reject(error);
        }
    })
}

let handleUserLogin = (email, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let userData = {};
            let isExist = await checkUserEmail(email);
            if (isExist) {

                let user = await db.User.findOne({
                    attributes: ['email', 'roleId', 'password'],
                    where: { email: email },
                    raw: true,
                })
                if (user) {
                    let check = await bcrypt.compareSync(password, user.password);
                    if (check) {
                        userData.errCode = 0;
                        userData.errMessage = 'Oke'
                        console.log(user)
                        delete user.password;
                        userData.user = user;
                    }
                    else {
                        userData.errCode = 3;
                        userData.errMessage = 'Wrong password'
                    }

                }
                else {
                    userData.errCode = 2;
                    userData.errMessage = `User not found`
                }

            }
            else {
                userData.errCode = 1;
                userData.errMessage = `Email khong ton tai. Hay thay doi Email!`;
            }

            resolve(userData);
        } catch (error) {
            reject(error)
        }
    })
}

let checkUserEmail = (userEmail) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { email: userEmail }
            })
            if (user) {
                resolve(true)
            } else {
                resolve(false)
            }
        } catch (error) {
            reject(error)
        }
    })
}

let getAllUsers = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = ''
            if (userId === 'All') {
                users = await db.User.findAll({
                    attributes: {
                        exclude: ['password']
                    },
                })
            }
            if (userId && userId !== 'All') {
                users = await db.User.findOne({
                    where: { id: userId },
                    attributes: {
                        exclude: ['password']
                    },
                })
            }
            resolve(users)
        } catch (error) {
            reject(error)
        }
    })
}

let createNewUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let check = await checkUserEmail(data.email)
            if (check === true) {
                resolve({
                    errCode: 1,
                    errMessage: 'Email da ton tai. Hay nhap lai email!'
                });
            } else {
                let hashPasswordFromBycrypt = await hashUserPassword(data.password);
                await db.User.create({
                    email: data.email,
                    password: hashPasswordFromBycrypt,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    address: data.address,
                    phonenumber: data.phonenumber,
                    gender: data.gender === '1' ? true : false,
                    roleId: data.roleId,
                })

                resolve({
                    errCode: 0,
                    message: '0ke'
                });
            }


        } catch (error) {
            reject(error)
        }
    })
}

let deleteUser = (userId) => {
    return new Promise(async (resolve, reject) => {
        let foundUser = await db.User.findOne({
            where: { id: userId },
        })

        if (!foundUser) {
            resolve({
                errCode: 2,
                errMessage: 'Người dùng không tồn tại!'
            })
        }

        await db.User.destroy({
            where: { id: userId }
        })


        resolve({
            errCode: 0,
            errMessage: 'Người đã được xóa!'
        })
    })
}
let updateUserData = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id) {
                resolve({
                    errCode: 2,
                    errMessage: 'Missing required parameter!'
                });
            }
            let user = await db.User.findOne({
                where: { id: data.id, },
                raw: false
            })
            if (user) {
                user.firstName = data.firstName;
                user.lastName = data.lastName;
                user.address = data.address;

                await user.save()
                resolve({
                    errCode: 0,
                    message: 'Cập nhật thông tin thành công!'
                })
            } else {
                resolve({
                    errCode: 1,
                    errMessage: 'Không tìm thấy người dùng!'
                });
            }
        } catch (error) {
            reject(error)
        }
    })
}

module.exports = {
    handleUserLogin: handleUserLogin,
    getAllUsers: getAllUsers,
    createNewUser: createNewUser,
    deleteUser: deleteUser,
    updateUserData: updateUserData
}