const jwt =require("jsonwebtoken");

const authentication=async function(req,res,next){
try{
    let bearerToken=req.headers.authorization
    
    
    if(!bearerToken) return res.status(400).send({status:false,message:"please provide token"});
    let token= bearerToken.split(" ")[1];

  let varify =  jwt.verify(token,"seven",function(error,decodedToken){
    if(error) return res.status(400).send({status:false,message:error.message})

    if(decodedToken)   req.token=decodedToken.userId
    next()
  })
  
}catch(error){
    return res.status(500).send({status:false,message:error.message})
}

}
module.exports={authentication};