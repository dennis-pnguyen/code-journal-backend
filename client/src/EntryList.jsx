import { useState, useEffect } from 'react';
import { FaPencilAlt } from 'react-icons/fa';
// import { readEntries } from './data';

export default function EntryList({ onCreate, onEdit }) {
  // const entries = readEntries();

  const [entries, setEntries] = useState([]);

  useEffect(() => {
    async function getEntries() {
      try {
        const res = await fetch('/api/entries');
        if (!res.ok) throw new Error(`fetch error ${res.status}`);
        const entryList = await res.json();
        setEntries(entryList);
      } catch (err) {
        console.error(err);
      }
    }
    getEntries();
  }, []);

  return (
    <div className="container">
      <div className="row">
        <div className="column-full d-flex justify-between align-center">
          <h1>Entries</h1>
          <h3>
            <button
              type="button"
              className="white-text form-link"
              onClick={onCreate}>
              NEW
            </button>
          </h3>
        </div>
      </div>
      <div className="row">
        <div className="column-full">
          <ul className="entry-ul">
            {entries.map((entry) => (
              <EntryCard key={entry.entryId} entry={entry} onEdit={onEdit} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function EntryCard({ entry, onEdit }) {
  return (
    <li>
      <div className="row">
        <div className="column-half">
          <img
            className="input-b-radius form-image"
            src={entry.photoUrl}
            alt=""
          />
        </div>
        <div className="column-half">
          <div className="row">
            <div className="column-full d-flex justify-between">
              <h3>{entry.title}</h3>
              <button onClick={() => onEdit(entry)}>
                <FaPencilAlt />
              </button>
            </div>
          </div>
          <p>{entry.notes}</p>
        </div>
      </div>
    </li>
  );
}
