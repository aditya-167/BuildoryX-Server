import bcrypt from 'bcrypt';

export const hashPassword = async(password) =>{
    return new Promise((resolve,reject)=>{
        bcrypt.genSalt(14,(err,salt)=>{
            if(err){
                reject(err)
            }

            bcrypt.hash(password, salt, (err,hash)=>{
                if(err){
                    reject(err);
                }
                password = hash;
                resolve(hash);
            });
        });
    });

};

export const comparePassword = async function(password,hashPassword){
    return bcrypt.compare(password,hashPassword);
};