import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import lodash from "lodash";

const app = express();
const port = 3000;
 
app.set('view engine', 'ejs');
 
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("/Public"));
mongoose.connect( "mongodb+srv://midestffin:WKLH896xMTpvkwTH@cluster0.hutu7d8.mongodb.net/todolistDB");

const itemsSchema = new mongoose.Schema({  
  name: String
}); //Created Schema

const Item = mongoose.model("Item", itemsSchema); //Created model
 
//Creating items
const item1 = new Item({
  name: "Welcome to your todo list."
});
const item2 = new Item({
  name: "Hit + button to create a new item."
});
const item3 = new Item({
  name: "<-- Hit this to delete an item."
});
 
const defaultItems = [item1, item2, item3]; //Storing items into an array
 
  app.get("/", function(req, res) {
    async function todolist() {

      const todoItems= await Item.find({});

      if (todoItems.length === 0 ) {
        Item.insertMany(defaultItems)
        .then(function () {
          console.log("Successfully saved defult items to DB");
        })
        .catch(function (err) {
          console.log(err);
        });
        res.redirect("/");
      } else {
        res.render("list.ejs", {listTitle: "Today", newListItems: todoItems});
      }
    }
  todolist();
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name : itemName
  });
 
  if(listName === "Today"){
    item.save();
    res.redirect("/")
  }else{
    List.findOne({name : listName}).then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});


//New list schema


const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema); // New list model

app.get("/:customListName",function(req,res){
  const customListName = lodash.capitalize(req.params.customListName);
 
  List.findOne({name:customListName})
    .then(function(foundList){
        
          if(!foundList){
            const list = new List({
              name:customListName,
              items:defaultItems
            });
            list.save();
            res.redirect("/" + customListName);
            console.log("saved");
          }
          else{
            res.render("list.ejs",{listTitle:foundList.name, newListItems:foundList.items});
          }
    });
  });



  app.post("/delete", function(req, res){
    const checkedListName = req.body.listName;
    const checkedItemId = req.body.checkbox;
 
    if(checkedListName==="Today"){
      //In the default list
      del().catch(err => console.log(err));
 
      async function del(){
        await Item.deleteOne({_id: checkedItemId});
        res.redirect("/");
      }
    } else{
      //In the custom list
 
      update().catch(err => console.log(err));
 
      async function update(){
        await List.findOneAndUpdate({name: checkedListName}, {$pull: {items: {_id: checkedItemId}}});
        res.redirect("/" + checkedListName);
      }
    }
  });

app.get("/about", function(req, res){
  res.render("about");
});
 
app.listen(port, function() {
  console.log(`Server started on port ${port}`);
});