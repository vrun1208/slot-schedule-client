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
  //const [res, setRes] = useState('allotted');
  const [remarks, setRemarks] = useState([]);

  useEffect(() => {
    axios.get(`${base_url}/api/availability`)
      .then(response => setPhysioAvailability(response.data));
  }, []);

  useEffect(() => {
    axios.get(`${base_url}/api/remarks`)
      .then(response => setRemarks(response.data));
  }, []);

  const handleDayChange = (e) => {
    setSelectedDay(parseInt(e.target.value, 10));
    setSelectedSlot(null); // Reset selected slot when day changes
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const calculateSlotTimes = (slotIndex) => {
    const startTime = addMinutes(new Date(2022, 1, 1, 5, 30), slotIndex * 45);
    //const endTime = addMinutes(startTime, 45);
    return `${format(startTime, 'HH:mm')}`;
  };

  const handleSelection = (physioId, selectedDay, slotTime, e) => {
    setSelectedSlot({ physioId, selectedDay, slotTime });
    //console.log(selectedSlot);
    setRemark(e.target.value);
    //console.log(remark);
  };

  const markAsAllocated = () => {
    if (selectedSlot) {
      const { physioId, selectedDay, slotTime} = selectedSlot;
      //const slotKey = `${physioId}-${slotTime}`;
      //alert(`Physiotherapist ${physioId} - TimeSlot ${slotTime} marked as allocated. Remarks: ${remark[slotKey]}`);
      //console.log(`Remarks: ${remark[slotKey]}`);

      //const updatedAvailability = [...physioAvailability];
      const updatedAvailability = [...physioAvailability];
      //console.log(updatedAvailability);
      const curr = updatedAvailability[physioId][selectedDay][slotTime].state; 
      //console.log(curr);
      updatedAvailability[physioId][selectedDay][slotTime].state = curr === 'allotted' ? 'reserved' : 'allotted';

      setPhysioAvailability(updatedAvailability);
      //console.log(physioAvailability);

      axios.post(`${base_url}/api/availability`, {
        physioId,
        availability: updatedAvailability[physioId]
      })
      .then(response => {
        console.log(response.data);
        alert('Changes saved successfully!');
      });

      const newRemarks = [...remarks];
      newRemarks.push({
        day: selectedDay,
        physioId,
        slotTime,
        remark
      });
      setRemarks(newRemarks);
      //console.log(newRemarks);

      axios.post(`${base_url}/api/remarks`, {
        day: selectedDay,
        physioId,
        slotTime,
        remark
      }).then(response => {
        console.log(response.data);
        alert('Changes saved successfully!');
      });

      setSelectedSlot(null);
      setRemark('');
    } 
  };

  const getAvailableSlots = () => {
    const availableSlots = [];

    physioAvailability.forEach((physio, physioId) => {
      const slots = physio[selectedDay].reduce((acc, slot, slotIndex) => {

        if (slot.state === `reserved` || slot.state === `allotted` ) {
          acc.push({
            time: calculateSlotTimes(slotIndex),
            index: slotIndex,
            isAvailable: slot,
            state: slot.state,
            physioId: physioId,
            day: selectedDay
          });
        }
        return acc;
      }, []);

      if (slots.length > 0) {
        availableSlots.push({
          Id: physioId,
          slots,
        });
      }
    });
    //console.log(availableSlots);
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
          <div key={physio.Id}>
            <strong>Physiotherapist {physio.Id+1}:</strong>
            {filterSlotsByTime(physio.slots).map((slot) => (
              <div key={slot.index} className={`availability-slot slot-alot-view`}>
                <span>{slot.time}</span>
                {slot.isAvailable ? (
                  <span>
                    {remarks.map((remark) => {
                      if (remark.day === slot.day && remark.physioId === slot.physioId && remark.slotTime === slot.index) {
                        return (
                          <div key={`${remark.day}-${remark.physioId}-${remark.slotTime}-remark`}>
                            Remark: {remark.remark}
                          </div>
                        );
                      } else{<span>varun hero</span>}
                      return null ;
                    })}
                  {slot.state !== 'reserved' ? (
                    <span>
                    <input type="text" className='input-field'
                    onChange={(e) => handleSelection(slot.physioId, slot.day, slot.index, e)}
                    />
                    <button onClick={markAsAllocated} className='alot-btn'>
                      Give Remarks
                    </button>
                    </span>
                  ) : null }
                  </span>
                ) : <span>Not Available</span> }
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesView;
