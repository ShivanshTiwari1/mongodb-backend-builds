require("dotenv").config();
const {MongoClient}=require("mongodb");
const uri=process.env.MONGO_URI;
const client=new MongoClient(uri);

async function main(){
    try{
        await client.connect();
        console.log("connected to the mongodb");

        const db=client.db('flash_sale_db');
        
        const product=db.collection("products");

        await product.deleteMany();
        await product.insertOne({name:"sneakers",count:5});
        async function buySneaker(userId){
            const result=await product.updateOne({name:"sneakers",count:{$gt:0}},
                {$inc:{count:-1}}
            );
            if(result.modifiedCount===1){
                return `User ${userId}:Purchased`;
            }else{
                return `User ${userId}:Sold Out`;
            }
        }
        const request=[];
        for(let i=0;i<100;i++){
            request[i]=buySneaker(i);

        }
        const outcome=await Promise.all(request);
        const purchasedList=outcome.filter((u)=>u.includes("Purchased"));
        const successCount=purchasedList.length;
        const soldOut=outcome.filter((p)=>p.includes("Sold Out"));
        const failedCount=soldOut.length;

        const finalProduct=await product.findOne({name:"sneakers"});
        console.log("TOtal purchased",successCount);
        console.log("toTAL rejected",failedCount);
        console.log("Db remaining",finalProduct);
    }
    catch(error){
        console.log("Database error",error);
    }
    finally{
        await client.close();
    }
}
main();