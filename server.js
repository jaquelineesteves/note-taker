const express = require('express');
const path = require('path');
const fs = require('fs');
const uuid = require('./helpers/uuid');

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'));
});

app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, './public/notes.html'));
});

app.get('/api/notes', (req, res) => {
  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    const notes = JSON.parse(data);
    res.status(200).json(notes);
  });
});


app.post('/api/notes', (req, res) => {
  const {title, text} = req.body;

  if (title && text) {
    // Create a new note object with a unique ID
    const newNote = {
      title,
      text,
      id: uuid(),
    };

    // Read the existing notes from the file
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json('Error reading file'); 
      }

      const notesTo = JSON.parse(data);
      notesTo.push(newNote);

      // Write the updated notes back to the file
      fs.writeFile('./db/db.json', JSON.stringify(notesTo, null, 4), (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json('Error writing file');
        }
        res.status(201).json(newNote);
      });
    });


  } else {
    res.status(400).json('Error in posting note');
  }
});

// app.delete('/api/notes:id', (req, res) => { 
//   const noteId = req.params.id;

// });

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}`)
);
