const express = require("express");
const Notes = require("../models/Notes");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const { body, validationResult } = require("express-validator");

router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });

    res.json(notes);
  } catch (error) {
    res.status(500).json("internal server error");
  }
});

router.post(
  "/addnotes",
  fetchuser,
  [
    body("title").isLength({ min: 3 }),
    body("description").isLength({ min: 5 }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
      }

      const note = new Notes({
        title,
        description,
        tag,
        user: req.user.id,
      });

      const savenote = await note.save();

      res.json(savenote);
    } catch (error) {
      res.status(500).json("internal server error");
    }
  }
);

//updating a note-

router.put("/updatenote/:id",fetchuser,async (req,res)=>{

     const {title,description,tag} = req.body;
       
     const newnote = {};

     if(title){newnote.title = title};
     if(description){newnote.description = description};
     if(tag){newnote.tag = tag};

    let note =await Notes.findById(req.params.id);

     if(!note){
          return res.status(404).json("Not Found");
     }

     if(note.user.toString() != req.user.id){
          return res.status(404).json("Not allowed");
     }

     note = await Notes.findByIdAndUpdate(req.params.id,{$set: newnote},{new: true});

     res.json(note);
})

module.exports = router;
