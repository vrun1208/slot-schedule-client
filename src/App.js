import './App.css';
import PhysioSchedule from './components/phSchedule';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PatientView from './components/patientView';
import SalesView from './components/salesView';
import NavBar from './components/nav';

function App() {
  return (
    // <Router>
    //   <div className="App">
    //   <header className="App-header">
    //   <h1>Physio Schedule App</h1>

        
    //     <Routes>
    //     <Route path='' Component={PhysioSchedule} />
    //     <Route path='/user' Component={PatientView} />
    //     <Route path='/sales' Component={SalesView} />
    //       </Routes> 
    //     {/* <Route path='/user' Component={P} /> */}
    //     {/* <PhysioSchedule /> */}
    //   </header>
    // </div>
    // </Router>
    <Router>
      <div className='App'>
        <NavBar />
        <Routes>
          <Route path=""  element={<PhysioSchedule />} />
          <Route path="/user" element={<PatientView />} />
          <Route path="/sales" element={<SalesView />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
