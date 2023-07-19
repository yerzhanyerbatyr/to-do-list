const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true });

const itemsSchema = new mongoose.Schema({
    name: String
});

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
});

const Item = mongoose.model('Item', itemsSchema);
const List = mongoose.model('List', listSchema);

const doHW = new Item ({name: "Do homework"});
const study = new Item({name: "Study backend"});

const item1 = new Item({
    name: "Welcome to your todolist!"
});
 
const item2 = new Item({
    name: "Hit the + button to add a new item."
});
 
const item3 = new Item({
    name: "<-- Hit this to delete an item"
});
 
const defaultItems = [item1, item2, item3];

app.get("/", function(req, res){

    Item.find({})
        .then(function(foundItems) {

            if(foundItems.length === 0){
                Item.insertMany(defaultItems)
                    .then(function(){
                        console.log("Successfully saved into our DB.");
                    })
                    .catch(function(err){
                        console.log(err);
                    });
                res.redirect("/");
            } else {
                res.render("list",{
                    title: "Hello!",
                    itemsArray: foundItems
                });
            }
    })
    .catch( function (error){
        console.log(error);
    });
});

app.get("/:customListName", function(req, res){
    const customListName = req.params.customListName;
    
    List.findOne({name: customListName})
        .then((foundName) => {  
            if(foundName === null) {            
                const list = new List({
                name: customListName,
                items: defaultItems
                })
        
                console.log("Title name not found, creating the todolist");
                return list.save();
            } else {
                console.log("Title name found");
                return foundName;
            }
            }).then((saveItems) => {
                console.log(saveItems.items);
                console.log("locating to the todolist");
                res.render("list", {title : saveItems.name, itemsArray : saveItems.items});
                res.redirect('/'+customListName);
        }).catch((err) => {
            console.log(err);
        })

});

app.post("/", function(req, res){

    const itemName = req.body.newitem;
    const listName = req.body.list;
    const item = new Item({name: itemName});

    if (listName === "Hello!"){
        item
        .save()
        .then((item) => console.log(item))
        .catch((err) => console.log(err));
        
        res.redirect("/");
    } else {
        List.findOne({name: listName}).then((foundList) => {  
            foundList.items.push(item);
            foundList.save();
            res.redirect('/' + listName);
          }).catch((err) => {
            console.log(err);
          })
    }
});

app.post("/delete", function(req,res){
    const checkedId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Hello!"){
        Item.findByIdAndRemove(checkedId)
        .then(function () {
            console.log("Successfully removed");
            res.redirect("/");
        })
        .catch(function (err) {
            console.log(err);
        });
    } else {
        List.findOneAndUpdate({name:listName},{$pull: {items: {_id:checkedId}}})
        .then(function(){
            res.redirect("/" + listName);
        })
        .catch((err) => {
            console.log(err);
        })
    }
    
});


app.listen(3000, function(){
    console.log("Server started");
});