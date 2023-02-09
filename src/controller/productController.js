const { uploadFile } = require("../controller/aws");
const productModel = require("../models/productModel");
const validator = require("validator");
const valid = require("../validation/validation");

const createProduct = async function (req, res) {
    try {
        let data = req.body;
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "please provide detail for products" });

        if(!data. title || !valid.isValid(data.title)) return  res.status(400).send({ status: false, message: "please provide title" })
       
        let duplicateTitle = await productModel.findOne({title:data.title})
        if(duplicateTitle) return res.status(400).send({ status: false, message: "title already exist" })

        if(! data.description || !valid.isValid(data.description)) return  res.status(400).send({ status: false, message: "please provide description" })
        if(! data.availableSizes || !valid.isValid(data.availableSizes)) return  res.status(400).send({ status: false, message: "please provide available Sizes" })

        if(!data.price || !typeof(data.price) == Number) return  res.status(400).send({ status: false, message: "please provide data.price" })
    
        if(!valid.isValidPrice(data.price)) return res.status(400).send({ status: false, message: "invalid price format" })

        if(!data.currencyId || !valid.isValid(data.currencyId) ) return  res.status(400).send({ status: false, message: "please provide currencyId" })
        
        if(data.currencyId != "INR" ) return  res.status(400).send({ status: false, message: "please provide currencyId in INR only" })

        if(!data.currencyFormat || !valid.isValid(data.currencyFormat)) return  res.status(400).send({ status: false, message: "please provide currency format" })
        
        if(data.currencyFormat != "₹") return  res.status(400).send({ status: false, message: "please provide valid currency format" })

        let files = req.files
        
        if (files && files.length > 0) {
            let uploadUrl = await uploadFile(files[0])
            data.productImage = uploadUrl
        }
        else {
            return res.status(400).send({ status: false, message: "Please Provide Image File" })
        }

        let enumVal = productModel.schema.obj.availableSizes.enum
        ///Update the Size
        let sizes = data.availableSizes.split(",").map(x=>x.trim().toUpperCase())
        for(let i = 0 ; i< sizes.length ; i++){
            if(enumVal.includes(sizes[i]) == false){
                return res.status(400).send({status:false,message:"Size criteria not valid"})
            }
        }
        data.availableSizes =sizes

        let creatProducts = await productModel.create(data);

        return res.status(201).send({ status: true, message: "product details", data: creatProducts })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }

};

const getProducts = async function (req, res) {
    try {
        let data = req.query
        let filter = { isDeleted: false }

        /* ------If size is present---------*/
        if (data.size) {
           size= data.size.split(",").map(x=>x.trim().toUpperCase())
             for(let i=0;i<size.length;i++){
                if(!["S", "XS", "M", "X", "L", "XXL", "XL"].includes(size[i])) return res.status(400).send({status:false,message:"size filter isn't valid"})
             }
                filter.availableSizes ={ $all:size}
        }
        /* ------if name is present-------- */
        if (data.name) {
            let regex = new RegExp(data.name, 'g')
            filter.title = regex
        }
        /* -------if price is present------ */
        if (data.priceGreaterThan && data.priceLessThan === undefined) {
            filter.price = { $gt: data.priceGreaterThan }
        };

        if (data.priceGreaterThan && data.priceLessThan) {
            filter.price = { $gt: data.priceGreaterThan, $lt: data.priceLessThan }
        };

        if (data.priceLessThan && data.priceGreaterThan == undefined) {
            filter.price = { $lt: data.priceLessThan }
        };

        /* --------Business Logic -------- */
        let result = await productModel.find(filter).sort({ price: data.priceSort })
        return res.status(200).send({ status: true,message:"Success", data: {result} })

    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })

    }
};

const UpdateProducts = async function (req, res) { 
    try {
        let productId = req.params.productId;
        if (!validator.isMongoId(productId)) return res.status(400).send({ status: false, message: "please provide valid user id" });

        let findProduct = await productModel.findOne({ _id: productId, isDeleted: false });
        if (!findProduct) return res.status(404).send({ status: false, message: "no product found" });

        let data = req.body;
        let files = req.files

        if ((Object.keys(data).length == 0) && (!files)) return res.status(400).send({ status: false, message: "please provide details" })
        //Change title
        if (data.title) {
            let findTitle = await productModel.findOne({ title: data.title });
            if (findTitle) return res.status(400).send({ status: false, message: "please provide a unique title" })

        }
        /// Change productImage
        if (files && files.length > 0) {
            let uploadUrl = await uploadFile(files[0])
            data.productImage = uploadUrl
        }
        ///Update the Size
        if(data.availableSizes){
        let enumVal =  ["S", "XS", "M", "X", "L", "XXL", "XL"] //L,M//
        let r = []
        let sizes = data.availableSizes.split(",").map(x=>x.trim().toUpperCase()) //["L","M"]
        for(let i = 0 ; i< sizes.length ; i++){
            if(r.indexOf(sizes[i]==-1)){
                if(enumVal.includes(sizes[i])){
                    r.push(sizes[i])
                }
            }
        }
        data.availableSizes = r
        if(r.length == 0) return res.status(400).send({status:false,message:"Size criteria not valid"})
        }

        let updateProduct = await productModel.findOneAndUpdate({ _id: productId }, {$set:{...data}}, { new: true });

        return res.status(200).send({ status: true, message: "success", data: updateProduct })
    }
    catch (e) {
        return res.status(500).send({ status: false, message: e.message })
    }

};
let getProductById= async function(req,res){

    try{
    let productId=req.params.productId;
    if(!validator.isMongoId(productId)) return res.status(400).send({status:false,message:"invalid product id"});

    let findproduct= await productModel.findOne({_id:productId});
    if(!findproduct) return res.status(404).send({status:false,message:"product not found"});
    if(findproduct.isDeleted==true) return res.status(400).send({status:false,message:"product is already deleted "})

    return res.status(200).send({status:false,message:"product found",data:findproduct})}
    catch(err){
        return res.status(500).send({status:false,message:err.message})
    }
}

const deleteProduct=async function(req,res){
    let productId=req.params.productId;

    if(!validator.isMongoId(productId)) return res.status(400).send({status:false,message:"please provide valid id"});

    let  findProduct =await productModel.findOne({_id:productId,isDeleted:false});
    if(!findProduct) return res.status(404).send({ status: false, message: "no product found" });

    await productModel.findOneAndUpdate({_id:productId},{isDeleted:true,deletedAt:Date.now()},{new:true});
    return res.status(200).send({status:false,message:"product deleted sucessfully"})

}


module.exports = { createProduct, getProducts, UpdateProducts,deleteProduct,getProductById }