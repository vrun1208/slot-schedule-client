// src/SalesView.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { addMinutes, format } from 'date-fns';
import '../styles/salesView.css';

const base_url = process.env.REACT_APP_API_URL;

const SalesView = () => {
  const [physioAvailability, setPhysioAvailability] = useState([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [filter, setFilter] = useState('All'); // 'all', 'morning', 'afternoon', 'evening'
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [remark, setRemark] = useState('');
  const weekDays = ['' ,'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    axios.get(`${base_url}/api/availability`)
      .then(response => setPhysioAvailability(response.data));
  }, []);

  const handleDayChange = (e) => {
    setSelectedDay(parseInt(e.target.value, 10));
    setSelectedSlot(null); // Reset selected slot when day changes
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const calculateSlotTimes = (slotIndex) => {
    const startTime = addMinutes(new Date(2022, 1, 1, 9, 0), slotIndex * 45);
    const endTime = addMinutes(startTime, 45);
    return `${format(startTime, 'HH:mm')} - ${format(endTime, 'HH:mm')}`;
  };

  const handleSelection = (physioId, slotTime, e) => {
    setSelectedSlot({ physioId, slotTime });
    setRemark({
      ...remark,
      [`${physioId}-${slotTime}`]: e.target.value,
    });
  };

  const markAsAllocated = () => {
    if (selectedSlot) {
      const { physioId, slotTime} = selectedSlot;
      const slotKey = `${physioId}-${slotTime}`;
      alert(`Physiotherapist ${physioId} - TimeSlot ${slotTime} marked as allocated. Remarks: ${remark[slotKey]}`);
      //console.log(`Remarks: ${remark[slotKey]}`);
      setSelectedSlot(null);
      setRemark('');
    } 
  };

  const getAvailableSlots = () => {
    const availableSlots = [];

    physioAvailability.forEach((physio) => {
      const slots = physio[selectedDay].reduce((acc, slot, slotIndex) => {
        //console.log(slot.state);
        if (slot.state === 'allotted') {
          acc.push({
            time: calculateSlotTimes(slotIndex),
            isAvailable: slot,
            state: slot.state,
            physioId: physio.physioId
          });
        }
        return acc;
      }, []);

      if (slots.length > 0) {
        availableSlots.push({
          physioId: availableSlots.length+1,
          slots,
        });
      }
    });

    return availableSlots;
  };

  const filterSlotsByTime = (slots) => {
  
    return slots.filter((slot) => {
      const slotHour = parseInt(slot.time.substring(0, 2), 10);

      if (filter === 'Morning') {
        return slotHour >= 9 && slotHour < 12;
      } else if (filter === 'Afternoon') {
        return slotHour >= 12 && slotHour < 17;
      } else if (filter === 'Evening') {
        return slotHour >= 17 && slotHour < 21;
      } else {
        return true; // 'all' filter
      }
    });
  };

  return (
    <div className='container'>
      <h2>Sales/Operations Team View</h2>
        <div className='op-container'>
        <div className='select-container'>
          <h3>Select Day:</h3>
          <select className='options' value={selectedDay} onChange={handleDayChange}>
            {Array.from({ length: 7 }, (_, i) => (
              <option key={i} value={i}>{weekDays[i+1]}</option>
            ))}
          </select>
        </div>

        <div className='select-container'>
          <h3>Filter Slots:</h3>
          <select className='options' value={filter} onChange={handleFilterChange}>
            <option value="All">All</option>
            <option value="Morning">Morning</option>
            <option value="Afternoon">Afternoon</option>
            <option value="Evening">Evening</option>
          </select>
        </div>
      </div>
      
      <div className='slot-container'>
        <h3>PHYSIOTHERAPIST AVAILABILITY</h3>
        {getAvailableSlots().map((physio) => (
          <div key={physio.physioId}>
            <strong>Physiotherapist {physio.physioId}:</strong>
            {filterSlotsByTime(physio.slots).map((slot) => (
              <div key={slot.time} className={`availability-slot slot-alot-view`}>
                <span>{slot.time}</span>
                {slot.isAvailable ? (
                  <span>
                  <input type="text" className='input-field'
                  value={remark[`${physio.physioId}-${slot.time}`] || ''}
                  onChange={(e) => handleSelection(physio.physioId, slot.time, e)}
                  />
                  {/* () => handleSelection(physio.physioId, selectedDay, physio.slots.indexOf(slot)) */}
                  <button onClick={markAsAllocated} className='alot-btn'>
                    Give Remarks
                  </button>
                  </span>
                ) : (
                  <span>Not Available</span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesView;
