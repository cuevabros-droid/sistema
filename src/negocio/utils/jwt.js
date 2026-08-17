import jwt from 'jsonwebtoken'
import {SALTENV} from '../../config/config.js'

const SALT = SALTENV


export const validateUser = (user) => {
    const  objetoOriginal = jwt.verify(user, SALT)
    return objetoOriginal
};
  
export const createToken = function (user) {
    return jwt.sign({user: user}, SALT, { expiresIn: '3600m' });  
};