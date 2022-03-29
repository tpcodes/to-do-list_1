//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose=require('mongoose');
const _= require('lodash');



const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];


mongoose.connect('mongodb+srv://Admin-tushar:tushar@cluster0.xifkp.mongodb.net/todolistDB');
//creating item schema

const ItemsSchema=new mongoose.Schema(
  {
    name:String
  }
);
 
// create a model

const Item=mongoose.model("Item",ItemsSchema);

// creating items

const item1=new Item(
  {
    name:"Welcome to your Todolist!"
  }
);
const item2=new Item(
  {
    name:"Hit the + button to add a new Item"
  }
);
const item3=new Item(
  {
    name:"<-- Hit this to delete an Item."
  }
);
//creating default item list

const defaultItems =[item1,item2,item3];



app.get("/", function(req, res) {

Item.find({},function(err,founditems)
{
   if(founditems.length==0)
   {
      Item.insertMany(defaultItems,function(err)
    {
    if(err)
    {
      console.log(err);
    }
    else
    {
      console.log("entered items in todoList successfully..!");
    }
      });
      res.redirect('/');
   }
   else{
    res.render("list", {listTitle: "Today", newListItems: founditems}); 
   }
  

});

});

//creating lists schema
const listSchema={
  name:
  {
    type:String,
    unique:true
  }, 

  items:[ItemsSchema]
};
//create model
const List=mongoose.model("List",listSchema);

app.get("/:customListNames",function(req,res){
  const customListName=_.capitalize(req.params.customListNames);

  List.findOne({name:customListName},function(err,foundList)
  {
    if(!err)
    {
      if(!foundList)
      {
        //create data for lists
        const list=new List(
          {
            name:customListName,
            items:defaultItems
          }
        );
        list.save();
        //redirect to customListItem names
        
        res.redirect("/"+customListName); 
  
 
      }
      else{
        //show an existing list
        res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
      }
    }
  })
  

  


 
 
 
});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  
  const item=new Item(
    {
      name:itemName 
    }
  );

  if(listName=="Today")
  {
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundedList)
    {
      foundedList.items.push(item);
      foundedList.save()
      res.redirect("/"+listName);
    })
  }
 

});
app.post("/delete", function(req, res){


const delItemID=req.body.checkbox;
const listname=req.body.listName;

if(listname=="Today")
{
  Item.findByIdAndRemove(delItemID,function(err)
  {
  if(!err)
  {
    console.log("delted item....");
    res.redirect('/');
  }
 
  });
}
else{
  List.findOneAndUpdate({name:listname},{$pull:{items:{_id:delItemID}}},function(err,foundList)
  {
    if(!err)
    {
      res.redirect("/"+listname);
    }
  })
}


});




app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
