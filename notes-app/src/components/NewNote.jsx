const NewNote = ({ newNote, handleNoteChange, addNote }) => {
  return (
    <form onSubmit={addNote}>
      <input type="text" value={newNote} onChange={handleNoteChange} />
      <button type="submit">save</button>
    </form>
  );
};

export default NewNote;
