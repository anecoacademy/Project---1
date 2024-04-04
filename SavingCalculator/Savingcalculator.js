import React, { useState } from 'react';
import './Savingcalculator.css';
import numeral from 'numeral';
import * as XLSX from 'xlsx';
// import { CheckLg, ArrowCounterclockwise, FileEarmarkArrowDown ,ArrowRight} from 'react-bootstrap-icons'; 
import { CheckLg, ArrowCounterclockwise, FileEarmarkArrowDown, ArrowLeft } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';

const SavingsCalculator = () => {
  const [name, setName] = useState('');
  const [dob, setDOB] = useState('');
  const [email, setEmail] = useState('');
  const [monthlyDeposit, setMonthlyDeposit] = useState('');
  const [annualInterestRate, setAnnualInterestRate] = useState('');
  const [numOfUnits, setNumOfUnits] = useState('');
  const [finalSavings, setFinalSavings] = useState(null);
  const [totalInterest, setTotalInterest] = useState(null);
  const [totalPrincipal, setTotalPrincipal] = useState(null);
  const [totalMonthlyDeposit, setTotalMonthlyDeposit] = useState(null);
  const [error, setError] = useState('');
  const [timeUnit, setTimeUnit] = useState('');

  const calculateSavings = () => {
    if (monthlyDeposit <= 0 || annualInterestRate <= 0 || numOfUnits <= 0) {
      setError('Please enter valid positive values for Monthly Deposit, Annual Interest Rate, and Number of Units.');
      return;
    }

    const monthlyInterestRate = annualInterestRate / 12 / 100;
    let savings = 0;
    let totalInterest = 0;
    let totalPrincipal = 0;
    let totalMonthlyDeposit = 0;

    for (let unit = 0; unit < numOfUnits; unit++) {
      let monthlyDepositForUnit;

      if (timeUnit === 'day') {
        monthlyDepositForUnit = parseFloat(monthlyDeposit) * 1;
      } else if (timeUnit === 'year') {
        monthlyDepositForUnit = parseFloat(monthlyDeposit) * 12;
      } else {
        monthlyDepositForUnit = parseFloat(monthlyDeposit);
      }

      savings += monthlyDepositForUnit;

      const interestEarned = savings * (monthlyInterestRate * 1);
      savings += interestEarned;

      totalInterest += interestEarned;
      totalPrincipal += monthlyDepositForUnit;
      totalMonthlyDeposit += monthlyDepositForUnit;
    }

    setFinalSavings(savings.toFixed(2));
    setTotalInterest(totalInterest.toFixed(2));
    setTotalPrincipal(totalPrincipal.toFixed(2));
    setTotalMonthlyDeposit(totalMonthlyDeposit.toFixed(2));
    setError('');
  };

  const getMonthName = (unit) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[unit % 12];
  };

  const getYear = (unit) => {
    const startYear = new Date().getFullYear();
    return startYear + Math.floor(unit / 12);
  };

  const handleReset = () => {
    setName('');
    setDOB('');
    setEmail('');
    setMonthlyDeposit('');
    setAnnualInterestRate('');
    setNumOfUnits('');
    setFinalSavings(null);
    setError('');
  };

  const downloadExcel = () => {
    const wb = XLSX.utils.book_new();

    const dobDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - dobDate.getFullYear();

    const wsData = [
      ['Savings Information'],
      ['Name:', name],
      ['Email:', email],
      ['Date of Birth:', dob],
      ['Age:', age],
      ['', ''],
      ['Savings Details'],
      ['Number of ' + timeUnit + 's:', numOfUnits],
      ['Monthly Deposit Amount:', `₹${numeral(monthlyDeposit).format('0,0')}`],
      [''],
      ['S.No', 'Month/Year', 'Monthly Principal', 'Outstanding Principal', 'Monthly Interest', 'Total Interest'],
    ];

    let totalInterest = 0;
    let totalDeposit = 0;

    for (let unit = 1; unit <= numOfUnits; unit++) {
      const monthlyInterestRate = annualInterestRate / 12 / 100;

      let monthlyInterest;

      if (timeUnit === 'day') {
        monthlyInterest = totalDeposit * (monthlyInterestRate * 1);
      } else if (timeUnit === 'year') {
        monthlyInterest = totalDeposit * (monthlyInterestRate * 12);

        if (unit % 12 === 0) {
          monthlyInterest += (totalDeposit + parseFloat(monthlyDeposit)) * (monthlyInterestRate * 1);
        }
      } else {
        monthlyInterest = totalDeposit * monthlyInterestRate;
      }

      totalDeposit += parseFloat(monthlyDeposit) + monthlyInterest;

      totalInterest += monthlyInterest;

      const monthName = getMonthName(unit - 1);
      const year = getYear(unit - 1);

      wsData.push([
        unit,
        `${monthName} ${year}`,
        `₹${numeral(monthlyDeposit).format('0,0')}`,
        `₹${numeral(totalDeposit).format('0,0')}`,
        `₹${numeral(monthlyInterest).format('0,0')}`,
        `₹${numeral(totalInterest).format('0,0')}`,
      ]);
    }

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    XLSX.utils.book_append_sheet(wb, ws, 'Savings Amortization');

    const wbBinary = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

    const blob = new Blob([s2ab(wbBinary)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'savings_amortization.xlsx';
    link.click();
  };

  const s2ab = (s) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  };

  return (
    <div className='container'>
      <h1 className='title'>Saving Calculator</h1>

      <label className='label'>
        Name:<br></br>
        <input className="input" type="text" placeholder='Name' value={name} onChange={(e) => setName(e.target.value)} />
      </label>

      <label className='label'>
        Date of Birth:<br></br>
        <input className="input" type="date" value={dob} onChange={(e) => setDOB(e.target.value)} />
      </label>

      <div className='top-label'>
        <label className='label'>
          Email:<br></br>
          <input className='input' type='email' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>

        <label className='label'>
          Investment Amount(₹):<br></br>
          <input className="input" type="text" value={monthlyDeposit !==''? numeral(monthlyDeposit).format('0,0') : ''} onChange={(e) => setMonthlyDeposit(e.target.value.replace(/[^0-9]/g, ''))} />
        </label>

        <label className='label'>
          Annual Interest Rate (%):<br></br>
          <input className="input" type="number" value={annualInterestRate} onChange={(e) => setAnnualInterestRate(e.target.value)} />
        </label>

        <label className='label'>
          Number of {timeUnit}s:<br></br>
          <input className="input" type="number" value={numOfUnits} onChange={(e) => setNumOfUnits(e.target.value)} />
        </label>

        <label className='label'>
          <div className='time'>
            Time Unit:<br></br>
          </div>

          <div className='radio'>
            <input className='radio-input' type='radio' name='timeUnit' value='day' checked={timeUnit === 'day'} onChange={() => setTimeUnit('day')} />
            <span>Day</span>
          </div>
          <div className='radio'>
            <input className='radio-input' type='radio' name='timeUnit' value='month' checked={timeUnit === 'month'} onChange={() => setTimeUnit('month')} />
            <span>Month</span>
          </div>
          <div className='radio'>
            <input className='radio-input' type='radio' name='timeUnit' value='year' checked={timeUnit === 'year'} onChange={() => setTimeUnit('year')} />
            <span>Year</span>
          </div>
        </label>
      </div>

      <div className='button'>
        <button type='button' className='btn btn-outline-success' onClick={calculateSavings}>
          <CheckLg />
        </button>

        <button type='button' className='btn btn-outline-danger' onClick={handleReset}>
          <ArrowCounterclockwise />
        </button>

        <button type='button' className='btn btn-outline-primary' onClick={downloadExcel}>
          <FileEarmarkArrowDown />
        </button>

        <br></br>
      </div>

      <div className='center-container'>
        <Link to="/">
          <button type="button" className="btn btn-outline-success">Go back to Home <ArrowLeft /></button>
        </Link>
      </div>
      {error && <div className='error'>{error}</div>}

      {finalSavings !== null && (
        <div className='result-section'>
          <h1>Calculation Result</h1>
          <p>Name: {name}</p>
          <p>DOB: {dob}</p>
          <p>Email: {email}</p>
          <p>After {numOfUnits} {timeUnit}(s), your savings will be: ₹{numeral(finalSavings).format('0,0')}</p>
          <p>Total Interest: ₹{numeral(totalInterest).format('0,0')}</p>
          <p>Total Principal: ₹{numeral(totalPrincipal).format('0,0')}</p>
          <p>Total Investment Amount: ₹{numeral(totalMonthlyDeposit).format('0,0')}</p> 
         
        </div> 
       

      )}
    </div>
  );
};

export default SavingsCalculator;
