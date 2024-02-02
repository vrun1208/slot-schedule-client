import { useEffect, useState } from "react";
import axios from 'axios';
import { addMinutes, format} from 'date-fns';
import '../styles.css';
import '../styles/physioView.css';

const base_url = process.env.REACT_APP_API_URL;
//console.log(base_url);

const PhysioSchedule = () => {
  const [physioAvailability, setPhysioAvailability] = useState([]);
  const [physioId, setPhysioId] = useState(0);
  const weekDays = ['' ,'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    axios.get(`${base_url}/api/availability`)
      .then(response => setPhysioAvailability(response.data));
  }, []);

  const toggleAvailability = (day, hour) => {
    // const newAvailability = [...physioAvailability];
    // const currentSlot = newAvailability[physioId][day][hour];
    // newAvailability[physioId][day][hour] = {
    //   ...currentSlot,
    //   state: currentSlot.state === 'vacant' ? 'allotted' : 'vacant',
    // };
    // setPhysioAvailability(newAvailability);
    const newAvailability = [...physioAvailability];
    const currentState = newAvailability[physioId][day][hour].state;
    newAvailability[physioId][day][hour].state = currentState === 'vacant' ? 'allotted' : 'vacant';
    setPhysioAvailability(newAvailability);
  };

  const addSlotsTime = (slot) => {
    const start = addMinutes(new Date(2024, 1, 1, 9, 0), slot*45);
    //const end = addMinutes(start, 45);
    return `${format(start, 'HH:mm')}`
  }

  const saveAvailability = () => {
    axios.post(`${base_url}/api/availability`, {
      physioId,
      availability: physioAvailability[physioId]
    })
      .then(response => {
        console.log(response.data);
        alert('Slot saved successfully!');
        //console.log(physioAvailability);
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
            <div key={day}>
              <strong className="days">{weekDays[day+1]}:</strong>
              {hours.map((slot, hour) => (
                <button
                  key={hour}
                  className={`availability-slot vacant ${slot.state || 'vacant'}`}
                  onClick={() => toggleAvailability(day, hour)}
                >
                   {/* {`${Math.floor(hour / 2) + 9}:${(hour % 2) === 0 ? '00' : '45'}`}
                  &ndash;
                  {`${Math.floor((hour + 1) / 2) + 9}:${((hour + 1) % 2) === 0 ? '00' : '45'}`} */}
                  {addSlotsTime(hour)}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <button className="save-btn" onClick={saveAvailability}>Save Availability</button>
    </div>
  );
};

export default PhysioSchedule;


  