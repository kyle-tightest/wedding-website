import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';

const Table = ({ tableNumber, guests }: { tableNumber: number, guests: string[] }) => {
  return (
    <div className="table">
      <h2>Table {tableNumber}</h2>
      <Droppable droppableId={`table-${tableNumber}`}>
        {(provided) => (
          <ul className="guest-list" ref={provided.innerRef} {...provided.droppableProps}>
            {guests.map((guest, index) => (
              <Draggable key={guest} draggableId={guest} index={index}>
                {(provided) => (
                  <li
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    {guest}
                  </li>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
      <div className="table-footer">
        Total: {guests.length} / 8
      </div>
    </div>
  );
};

export default Table;
