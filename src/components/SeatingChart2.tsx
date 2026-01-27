import { useEffect, useState, useRef } from 'react';

import { motion } from 'framer-motion';
import './seating-chart.css';

interface Table {
  guests: string[];
  x: number;
  y: number;
}

const SeatingChart2 = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [names, setNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [selectedTableIndex, setSelectedTableIndex] = useState<number | null>(null);
  const [guestSearch, setGuestSearch] = useState('');
  const constraintsRef = useRef(null);

  useEffect(() => {
    const fetchSeatingChart = async () => {
      try {
        const response = await fetch('/api/get-seating-chart-2');
        const data = await response.json();
        if (response.ok) {
          setTables(data.tables || []);
          setNames(data.names || []);
        } else {
          setError(data.message || 'Failed to fetch seating chart');
        }
      } catch (err) {
        setError('An error occurred while fetching the seating chart.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeatingChart();
  }, []);

  const handleTableDragEnd = (index: number, info: any) => {
    const snap = 40;
    const targetX = tables[index].x + info.offset.x;
    const targetY = tables[index].y + info.offset.y;
    const snappedX = Math.round(targetX / snap) * snap;
    const snappedY = Math.round(targetY / snap) * snap;

    const newTables = [...tables];
    newTables[index] = { ...newTables[index], x: snappedX, y: snappedY };
    setTables(newTables);
  };

  const removeGuestFromTable = (tableIndex: number, guestName: string) => {
    const newTables = [...tables];
    newTables[tableIndex].guests = newTables[tableIndex].guests.filter(g => g !== guestName);
    setTables(newTables);
    setNames([...names, guestName].sort());
  };

  const addGuestToTable = (tableIndex: number, guestName: string) => {
    const newTables = [...tables];
    newTables[tableIndex].guests = [...newTables[tableIndex].guests, guestName];
    setTables(newTables);
    setNames(names.filter(n => n !== guestName));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    try {
      const response = await fetch('/api/save-seating-chart-2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tables }),
      });
      const data = await response.json();
      if (response.ok) {
        setSaveMessage(data.message);
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessage(data.message || 'An error occurred.');
      }
    } catch (error) {
      setSaveMessage('An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const staticObjects = [
    { name: 'Cake Table', x: 120, y: 40, w: 160, h: 80, class: 'cake-table' },
    { name: 'DJ Table', x: 60, y: 560, w: 60, h: 200, class: 'dj-table' },
    { name: 'Pillar', x: 400, y: 240, w: 60, h: 60, class: 'pillar' },
    { name: 'Pillar', x: 820, y: 240, w: 60, h: 60, class: 'pillar' },
    { name: 'Pillar', x: 400, y: 600, w: 60, h: 60, class: 'pillar' },
    { name: 'Pillar', x: 820, y: 600, w: 60, h: 60, class: 'pillar' },
  ];

  if (isLoading) return <div className="seating-chart-container"><h1>Loading...</h1></div>;

  const filteredUnseated = names.filter(n => n.toLowerCase().includes(guestSearch.toLowerCase()));

  return (
    <div className="seating-chart-container">
      <h1>Seating Chart</h1>

      <div className="save-container">
        <button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Layout'}
        </button>
        {saveMessage && <p style={{ color: '#10b981', marginTop: '0.5rem', fontWeight: 600 }}>{saveMessage}</p>}
      </div>

      <div className="grid-canvas" ref={constraintsRef}>
        {staticObjects.map((obj, i) => (
          <div key={`static-${i}`} className={`static-object ${obj.class}`} style={{ left: obj.x, top: obj.y, width: obj.w, height: obj.h }}>
            <span>{obj.name}</span>
          </div>
        ))}

        {tables.map((table, index) => (
          <motion.div
            key={`table-${index}`}
            drag
            dragMomentum={false}
            dragConstraints={constraintsRef}
            animate={{ x: table.x, y: table.y }}
            onDragEnd={(_e, info) => handleTableDragEnd(index, info)}
            whileDrag={{ scale: 1.05, zIndex: 50 }}
            className={`table-node ${index === 16 ? 'bridal-table' : ''}`}
            onClick={() => setSelectedTableIndex(index)}
            style={{ position: 'absolute' }}
          >
            <div className="table-header-simple">Table {index + 1}</div>
            <span className="guest-count">{table.guests.length} Guests</span>
            <div className="guest-preview">
              {table.guests.slice(0, 2).map((guest, i) => (
                <div key={i} className="guest-preview-name">{guest}</div>
              ))}
              {table.guests.length > 2 && <div className="guest-preview-more">+ {table.guests.length - 2} more</div>}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="guest-list-sidebar">
        <h2>Unseated Guests ({names.length})</h2>
        <input
          type="text"
          placeholder="Search guests..."
          value={guestSearch}
          onChange={(e) => setGuestSearch(e.target.value)}
          className="guest-search-input"
        />
        <ul className="unseated-list">
          {filteredUnseated.map((name, i) => (
            <li key={i} className="unseated-guest-item">{name}</li>
          ))}
        </ul>
      </div>

      {selectedTableIndex !== null && (
        <div className="guest-popup-overlay" onClick={() => setSelectedTableIndex(null)}>
          <div className="guest-popup" onClick={e => e.stopPropagation()}>
            <h2>Table {selectedTableIndex + 1} Seating</h2>

            <div className="popup-section">
              <h3>Seated Guests</h3>
              <ul className="popup-guest-list">
                {tables[selectedTableIndex].guests.map((guest, i) => (
                  <li key={i}>
                    {guest}
                    <button className="remove-guest-btn" onClick={() => removeGuestFromTable(selectedTableIndex, guest)}>×</button>
                  </li>
                ))}
                {tables[selectedTableIndex].guests.length === 0 && <li>No guests seated</li>}
              </ul>
            </div>

            <div className="popup-section">
              <h3>Add Guest</h3>
              <div className="popup-add-list">
                {names.slice(0, 10).map((name, i) => (
                  <button key={i} className="add-guest-btn" onClick={() => addGuestToTable(selectedTableIndex, name)}>
                    + {name}
                  </button>
                ))}
                {names.length > 10 && <p className="small-note">Showing first 10 unseated guests...</p>}
              </div>
            </div>

            <button className="close-button" onClick={() => setSelectedTableIndex(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatingChart2;
