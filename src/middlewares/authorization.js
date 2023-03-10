const jwt = require('jsonwebtoken');
const { promisify } = require("util");
const {ACCESS_SECRET_KEY, REFRESH_SECRET_KEY} = require('../configs/config');
const {Role} = require('../app/models/user.model');
const redis = require('../configs/db/redis');
const Util = require('../utils/util');

// convert function to Promise
const getAsync = promisify(redis.get).bind(redis);
const verifyAsync = promisify(jwt.verify);

const Authorization = {

    verifyToken : (req, res, next) => {
        const token = req.rawHeaders[1];
      
        if(token){
            const accessToken = token.split(' ')[1];
            jwt.verify(accessToken, ACCESS_SECRET_KEY, (err, user) => {
                if(err)
                    return res.status(403).json('token is not valid');
                req.user = user;
                return next();
            });
        }
        else return res.status(401).json('you are not authenticated');

    },

    verifyRefreshToken : async (req, res, next) => {
       
        const refToken = req.cookies?.refreshToken;
       
        if(refToken){
            try {
                const user = await verifyAsync(refToken, REFRESH_SECRET_KEY)
                const reply = await getAsync(user._id);
        
                if(reply !== refToken)
                    return res.status(403).json('token is not valid');
                
                req.user = user;
                return next()
               
            } catch (error) {
                return Util.throwError(res, error);
            }

        }
        else return res.status(401).json('you are not authenticated');

    },

    verifyAdmin : (req, res, next) => {
        Authorization.verifyToken(req, res, () => {
            if(req.user.role === Role.ADMIN){
                return next();
            }

            return res.status(403).json('you are not allowed');
        });
    },

    verifyUser : (req, res, next) => {
        Authorization.verifyToken(req, res, () => {
            if(req.user.role === Role.USER){
                return next();
            }

            return res.status(403).json('you are not allowed');
        });
    },

    requestUser : (req, res) => {
        Authorization.verifyToken(req, res, () => {});
        return req.user.id;
    },

    requestUserFromRefToken : async (req, res) => {
        await Authorization.verifyRefreshToken(req, res, () => {});
        return req.user;
    }

}

module.exports = Authorization;