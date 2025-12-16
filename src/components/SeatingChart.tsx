import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import Table from './Table';
import './seating-chart.css';
import './table.css';

const SeatingChart = () => {
  const [names, setNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tables, setTables] = useState<string[][]>(Array(17).fill([]));
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rsvpsResponse, seatingChartResponse] = await Promise.all([
          fetch('/api/get-rsvps'),
          fetch('/api/get-seating-chart'),
        ]);

        if (!rsvpsResponse.ok) {
          throw new Error('Failed to fetch RSVP data.');
        }
        if (!seatingChartResponse.ok) {
          throw new Error('Failed to fetch seating chart data.');
        }

        const rsvpsData = await rsvpsResponse.json();
        const seatingChartData = await seatingChartResponse.json();

        const allGuests: string[] = rsvpsData.names;
        const seatedGuests: string[] = seatingChartData.seatedGuests;
        const unseatedGuests = allGuests.filter(guest => !seatedGuests.includes(guest));

        setNames(unseatedGuests);
        setTables(seatingChartData.tables);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const onDragEnd = (result: DropResult) => {

      const { source, destination } = result;

  

      if (!destination) {

        return;

      }

  

      if (destination.droppableId.startsWith('table-')) {

        const tableIndex = parseInt(destination.droppableId.split('-')[1], 10) - 1;

        if (tables[tableIndex].length >= 8) {

          alert('A table can have a maximum of 8 guests.');

          return;

        }

      }

  

      const sourceId = source.droppableId;

      const destId = destination.droppableId;

      const sourceIndex = source.index;

      const destIndex = destination.index;

  

      if (sourceId === destId && sourceIndex === destIndex) {

        return;

      }

      

      let draggedGuest: string;

      const newTables = tables.map(t => [...t]);

      let newNames = [...names];

  

      // Remove from source

      if (sourceId === 'guest-list') {

        draggedGuest = newNames.splice(sourceIndex, 1)[0];

      } else {

        const tableIndex = parseInt(sourceId.split('-')[1], 10) - 1;

        draggedGuest = newTables[tableIndex].splice(sourceIndex, 1)[0];

      }

  

      // Add to destination

      if (destId === 'guest-list') {

        newNames.splice(destIndex, 0, draggedGuest);

      } else {

        const tableIndex = parseInt(destId.split('-')[1], 10) - 1;

        newTables[tableIndex].splice(destIndex, 0, draggedGuest);

      }

  

      setTables(newTables);

      setNames(newNames);

    };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    try {
      const response = await fetch('/api/save-seating-chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tables }),
      });

      const data = await response.json();

      if (response.ok) {
        setSaveMessage(data.message);
      } else {
        setSaveMessage(data.message || 'An error occurred.');
      }
    } catch (error) {
      setSaveMessage('An error occurred while saving the seating chart.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="seating-chart-container">
        <h1>Seating Chart</h1>
        <div className="save-container">
          <button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Chart'}
          </button>
          {saveMessage && <p>{saveMessage}</p>}
        </div>
        {isLoading && <p>Loading...</p>}
        {error && <p>Error: {error}</p>}
        <div className="tables-container">
          {tables.map((guests, index) => (
            <Table key={index} tableNumber={index + 1} guests={guests} />
          ))}
        </div>
        <Droppable droppableId="guest-list">
          {(provided) => (
            <div
              className="guest-list-container"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              <h2>Guest List ({names.length})</h2>
              <ul>
                {names.map((name, index) => (
                  <Draggable key={name} draggableId={name} index={index}>
                    {(provided) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        {name}
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
};

export default SeatingChart;
