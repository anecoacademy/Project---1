
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './HomePage';
import LoanCalculator from './LoanCalculator/LoanCalculator'; 
import SavingsCalculator from './SavingCalculator/Savingcalculator';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/loan-calculator" element={<LoanCalculator />} /> 
        <Route path="/saving-calculator"element={<SavingsCalculator/>}/>
      </Routes>
    </Router>
  );
};


export default App;
