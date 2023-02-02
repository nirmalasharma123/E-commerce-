const { uploadFile } = require("../controller/aws");
const productModel=require("../models/productModel");

const createProduct=async function(req,res){
   try{
    if(!Object.keys(req.body).length) return res.status(400).send({status:false,message:"please provide detail for products"});
    let data=req.body;
    let files = req.files
        if (files && files.length > 0) {
            let uploadUrl = await uploadFile(files[0])
            data.productImage = uploadUrl
        }
        else {
            return res.status(400).send({ status: false, message: "Please Provide Image File" })
        }
     let creatProducts= await productModel.create(data);

     return res.status(201).send({status:true,message:"product details",data:creatProducts})
    }
    catch(error){
        return res.status(500).send({ status: false, message: error.message })
    }

};

const getProducts =async function(req,res){
    try{

        let data=req.query;
        // let name = data.name;
        data.availableSizes = data.size;
        // data.price = {$lte:+data.priceLessThan}
        let regex =  new RegExp(data.name,'g')
        let {size,priceSort,priceGreaterThan,priceLessThan  }=data;
        
        let filter = {
            isDeleted: false,
            availableSizes:size,
            //...data,
            title: regex,
            price:{$gte:priceGreaterThan,$lte:priceLessThan}
          };

        let findProduct=await productModel.find(filter).sort({price:priceSort});

        return res.status(200).send({status:true,message:"product data",data:findProduct})//yejjjjjjgygh bhjbnhgvfgh


    }
   catch(error){
    return res.status(500).send({ status: false, message: error.message })
   
   }
}

module.exports={createProduct,getProducts}