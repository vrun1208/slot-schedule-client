// src/PatientView.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { addMinutes, format } from 'date-fns';
import '../styles/patientView.css'

const base_url = process.env.REACT_APP_API_URL;

const PatientView = () => {
  const [physioAvailability, setPhysioAvailability] = useState([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [filter, setFilter] = useState('All')
  const weekDays = ['' ,'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    axios.get(`${base_url}/api/availability`)
      .then(response => setPhysioAvailability(response.data));
  }, []);

  const handleDayChange = (e) => {
    setSelectedDay(parseInt(e.target.value, 10));
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    };

  const addSlotsTime = (slot) => {
    const [hh, mm] = slot.split(':').map(Number);
    const start = new Date(2024,1,1,hh, mm);
    const end = addMinutes(start, 45);
    return `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`
  }

  const getAvailableSlots = () => {
    const availableSlots = [];

    physioAvailability.forEach((physio) => {   
      const slots = physio[selectedDay].reduce((acc, slot, hour) => {
        //console.log(slot.state);
        if (slot.state === 'allotted' || slot.state === 'reserved' ) {
          acc.push({
            time : addSlotsTime(slot.time),
            state: slot.state,
            physioId: physio.physioId,
          });
        }
        return acc;
      }, []);

      if (slots.length > 0) {
        availableSlots.push({
          physioId: availableSlots.length + 1,
          slots,
        });
      }
    });

    return availableSlots;
  };

  const filterSlotsByTime = (slots) => {
    //const currentTime = new Date().getHours();

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
      <h2>Patient's View</h2>
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
        <h3>AVAILABLE SLOTS</h3>
        {getAvailableSlots().map((physio) => (
          <div className='av-slots' key={physio.physioId}>
            <strong>Available Physiotherapist :</strong>
            {filterSlotsByTime(physio.slots).map((slot) => (
              <span key={slot.time} className={`availability-slot ${slot.state}`}>
                {slot.time}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientView;
