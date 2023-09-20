import { useState } from 'react';
// import { removeEntry } from './data';

/**
 * Form that adds or edits an entry.
 * If `entry` is `null`, adds an entry.
 * If `entry` is defined, edits that entry.
 */
export default function EntryForm({ entry, onSubmit }) {
  const [title, setTitle] = useState(entry?.title ?? '');
  const [photoUrl, setPhotoUrl] = useState(entry?.photoUrl ?? '');
  const [notes, setNotes] = useState(entry?.notes ?? '');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState();
  const [addNewEntry, setAddNewEntry] = useState([]);

  // Add new entry w/ fetch in React
  async function addEntry(newEntry) {
    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEntry),
      });
      if (!response.ok)
        throw new Error(`Network response was NOT okay: ${response.status}`);
      const added = await response.json();
      setAddNewEntry(addNewEntry.concat(added));
    } catch (err) {
      console.error(err);
      setError(err);
    }
  }

  // Update an entry w/ fetch in React
  async function updateEntry(updated) {
    try {
      const response = await fetch(`/api/entries/${updated.entryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updated),
      });
      if (!response.ok) throw new Error('Unable to fetch results');
    } catch (err) {
      // console.error(err);
      setError(err);
    }
  }

  // Delete an entry w/ fetch in React
  async function removeEntry(entryId) {
    try {
      const response = await fetch(`/api/entries/${entryId}`, {
        method: 'DELETE',
      });
      if (!response.ok)
        throw new Error('Network status is not OK', `${response.status}`);
    } catch (err) {
      setError(err);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const newEntry = { title, photoUrl, notes };
    if (entry) {
      await updateEntry({ ...entry, ...newEntry });
    } else {
      await addEntry(newEntry);
    }
    onSubmit();
  }

  async function handleDelete() {
    await removeEntry(entry.entryId);
    onSubmit();
  }
  if (error) return <div>{error.message}</div>;
  return (
    <div className="container">
      <div className="row">
        <div className="column-full d-flex justify-between">
          <h1>{entry ? 'Edit Entry' : 'New Entry'}</h1>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="row margin-bottom-1">
          <div className="column-half">
            <img
              className="input-b-radius form-image"
              src={photoUrl || 'images/placeholder-image-square.jpg'}
              alt="entry"
            />
          </div>
          <div className="column-half">
            <label className="margin-bottom-1 d-block">
              Title
              <input
                required
                className="input-b-color text-padding input-b-radius purple-outline input-height margin-bottom-2 d-block width-100"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
            <label className="margin-bottom-1 d-block">
              Photo URL
              <input
                required
                className="input-b-color text-padding input-b-radius purple-outline input-height margin-bottom-2 d-block width-100"
                type="text"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
              />
            </label>
          </div>
        </div>
        <div className="row margin-bottom-1">
          <div className="column-full">
            <label className="margin-bottom-1 d-block">
              Notes
              <textarea
                required
                className="input-b-color text-padding input-b-radius purple-outline d-block width-100"
                cols={30}
                rows={10}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>
          </div>
        </div>
        <div className="row">
          <div className="column-full d-flex justify-between">
            {entry && (
              <button
                className="delete-entry-button"
                type="button"
                onClick={() => setIsDeleting(true)}>
                Delete Entry
              </button>
            )}
            <button className="input-b-radius text-padding purple-background white-text">
              SAVE
            </button>
          </div>
        </div>
      </form>
      {isDeleting && (
        <div
          id="modalContainer"
          className="modal-container d-flex justify-center align-center">
          <div className="modal row">
            <div className="column-full d-flex justify-center">
              <p>Are you sure you want to delete this entry?</p>
            </div>
            <div className="column-full d-flex justify-between">
              <button
                className="modal-button"
                onClick={() => setIsDeleting(false)}>
                Cancel
              </button>
              <button
                className="modal-button red-background white-text"
                onClick={handleDelete}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
