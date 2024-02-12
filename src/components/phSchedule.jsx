import { useEffect, useState } from "react";
import axios from 'axios';
import { addMinutes, format} from 'date-fns';
import '../styles.css';
import '../styles/physioView.css';
//import TimePicker from "react-time-picker";
//import useCustomTimeSlot from "./customSlot";

const base_url = process.env.REACT_APP_API_URL;
//console.log(base_url);

const PhysioSchedule = () => {
  const [physioAvailability, setPhysioAvailability] = useState([]);
  const [physioId, setPhysioId] = useState(0);
  const [modifiedSlots, setModifiedSlots] = useState(null);
  const [newSlotTime, setNewSlotTime] = useState('');
  const weekDays = ['' ,'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];


  useEffect(() => {
    axios.get(`${base_url}/api/availability`)
      .then(response => setPhysioAvailability(response.data));
  }, []);

  const toggleAvailability = (day, hour) => {
    const selectedSlot = physioAvailability[physioId][day][hour];
    
    const overLapping = physioAvailability[physioId][day].find(slot => (
      slot.state === 'allotted' && slot.time !== selectedSlot.time &&
  (
    (addMinutes(new Date(slot.time), 45) > new Date(selectedSlot.time)) ||
    (addMinutes(new Date(selectedSlot.time), 45) > new Date(slot.time))
  )
    ))
    console.log(overLapping);

    if(overLapping){
        alert("please select different slot, it is overlapping!");
    }else{
      const newAvailability = [...physioAvailability];
      const currState = selectedSlot.state;
      newAvailability[physioId][day][hour].state = currState === 'vacant' ? 'allotted' : 'vacant';
      setPhysioAvailability(newAvailability);
    }
    
  };

  const modifySlotTime = (day, hour) => {
    setModifiedSlots({ day, hour });
  };

  const saveModifiedSlotTime = () => { 
    console.log(newSlotTime);
    const newAvailability = [...physioAvailability];
    const { day, hour } = modifiedSlots;
    const prevSlotTime = addMinutes(new Date(2024, 1, 1, 5, 30), hour*45);
    newAvailability[physioId][day][hour].state = 'vacant'; // Reset the slot to vacant
    newAvailability[physioId][day][hour].time = newSlotTime === '' ? format(prevSlotTime, 'HH:mm') : newSlotTime;
    newAvailability[physioId][day][hour].state = 'allotted'; // Set the new slot time as allotted
    setPhysioAvailability(newAvailability);

    // Reset state after saving changes
    setModifiedSlots(null);
    setNewSlotTime('');
  };  


  const addSlotsTime = (slot, hour) => {
    const start = addMinutes(new Date(2024, 1, 1, 5, 30), hour*45);
    //const end = addMinutes(start, 45);
    //physioAvailability[physioId][slot][hour].time = format(start, 'HH:mm');
    return physioAvailability[physioId][slot][hour].time || `${format(start, 'HH:mm')}`;
  }

  const saveAvailability = () => {
    axios.post(`${base_url}/api/availability`, {
      physioId,
      availability: physioAvailability[physioId]
    })
      .then(response => {
        console.log(response.data);
        alert('Slot saved successfully!');
        console.log(physioAvailability);
      });

  };


  return (
    <div className="container">
      <div className="select-container">
        <h3>Select Physio:</h3>
        <select  className="options" value={physioId} onChange={(e) => setPhysioId(e.target.value)}>
          <option value={0}>Physio 1</option>
          <option value={1}>Physio 2</option>
        </select>
      </div>
      

      <div className="set-container">
        <h3>SET AVAILABILITY</h3>
        <div className="availability-grid">
          {physioAvailability[physioId] && physioAvailability[physioId].map((hours, day) => (
            <div key={day} className="grid-contain">
              <strong className="days">{weekDays[day+1]}:</strong>
              <div className="btn-grid">
                {hours.map((slot, hour) => (
                  <div key={hour}>
                    { modifiedSlots && modifiedSlots.day === day && modifiedSlots.hour === hour ? (
                         <>
                         <input
                        type="time"
                        value={newSlotTime}
                        onChange={(e) => setNewSlotTime(e.target.value)}
                      />
                         <button onClick={saveModifiedSlotTime}>Save</button>
                         <button onClick={() => setModifiedSlots(null)}>leave</button>
                       </>
                    ) : (
                        <>
                          <button
                            className={`availability-slot ${slot.state}`}
                            onClick={() => toggleAvailability(day, hour)}
                            // onDoubleClick={() => modifySlotTime(day, hour)}
                          >
                            {addSlotsTime(day, hour)}
                          </button>
                          <button
                            className={`aviability-slot ${slot.state}`}
                            onClick={() => modifySlotTime(day, hour)}
                          >
                            Edit
                          </button>
                        </> 
                    )}
                  </div>
                ))}
              </div>  
            </div>
          ))}
        </div>
      </div>

      <button className="save-btn" onClick={saveAvailability}>Save Availability</button>
    </div>
  );
};

export default PhysioSchedule;


  