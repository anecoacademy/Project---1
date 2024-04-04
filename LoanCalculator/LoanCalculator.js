import React, { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import './LoanCalculator.css';
import numeral from 'numeral';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { CheckLg, ArrowCounterclockwise, FileEarmarkArrowDown, ArrowLeft } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';

const LoanCalculator = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [principal, setPrincipal] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [loanTerm, setLoanTerm] = useState('');
  const [loanTermUnit, setLoanTermUnit] = useState('months'); 
  const [monthlyPayment, setMonthlyPayment] = useState(null);
  const [totalInterest, setTotalInterest] = useState(null);
  const [totalPayment, setTotalPayment] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [startMonth, setStartMonth] = useState('1');  
 

  const calculateLoan = () => {
    const monthlyInterestRate = interestRate / 1200;
    const numberOfPayments = loanTermUnit === 'months' ? loanTerm : loanTerm * 12;

    const monthlyPaymentValue =
      (principal * monthlyInterestRate) /
      (1 - Math.pow(1 + monthlyInterestRate, -numberOfPayments));

    const totalInterestValue = (monthlyPaymentValue * numberOfPayments) - principal;
    const totalPaymentValue = monthlyPaymentValue * numberOfPayments;

    setMonthlyPayment(monthlyPaymentValue.toFixed(2));
    setTotalInterest(totalInterestValue.toFixed(2));
    setTotalPayment(totalPaymentValue.toFixed(2));

    const data = {
      labels: ['Principal', 'TotalInterest'],
      datasets: [
        {
          data: [principal, totalInterest],
          backgroundColor: ['#46c646', '#FF0000'],
          hoverBackgroundColor: ['#46c646', '#FF0000'],
        },
      ],
    };

    const options = {
      elements: {
        borderWidth: 0,
      },
      cutout: '20%',
    };

    setChartData({ data, options });
  };

  const resetForm = () => {
    setPrincipal('');
    setName('');
    setEmail('');
    setDob('');
    setInterestRate('');
    setLoanTerm('');
    setMonthlyPayment(null);
    setTotalInterest(null);
    setTotalPayment(null);
    setChartData(null);
   
  };

  const exportToExcel = () => {
    const clientInfo = [
      ['Client Name', name],
      ['Email', email],
      ['Date of Birth', dob],
      ['Age', calculateAge(new Date(dob))],
      ['Finish Age', calculateFinishAge(dob)],
    ];

    const loanDataHeaders = ['S.No', 'Month & Year', 'Monthly Payments', 'Monthly Interest', 'Principal', 'Outstanding Principal'];
    const loanDataRows = [];

    let remainingPrincipal = principal;
    const totalPayments = Math.ceil(parseFloat(loanTerm) * 12); 
    let remainingPayments = totalPayments;

    
    const years = Math.floor(loanTerm);
    const remainingMonths = Math.ceil((loanTerm - years) * 12);

    
    const startMonthIndex = parseInt(startMonth);

    for (let yearIndex = 0; yearIndex < years + 1; yearIndex++) {
      const currentYear = new Date().getFullYear() + yearIndex;

      const maxMonths = yearIndex === years ? remainingMonths : 12;

      
      for (let monthIndex = startMonthIndex - 1; monthIndex < maxMonths; monthIndex++) {
        const currentMonthIndex = monthIndex % 12;
        const currentMonth = currentMonthIndex + 1;

        if (remainingPayments > 0 && remainingPrincipal > 0.1) {
          const monthlyInterest = Math.abs(remainingPrincipal * (interestRate / 1200));
          const principalPaid = Math.abs(Number(monthlyPayment) - monthlyInterest);

          remainingPrincipal = Math.max(remainingPrincipal - principalPaid, 0);

          loanDataRows.push([
            totalPayments - remainingPayments + 1,
            `${getMonthName(currentMonth)} ${currentYear}`,
            numeral(monthlyPayment).format('0,0.00'),
            numeral(monthlyInterest).format('0,0.00'),
            numeral(principalPaid).format('0,0.00'),
            numeral(remainingPrincipal).format('0,0.00'),
          ]);

          remainingPayments--;

          if (remainingPrincipal <= 0.1) {
            
            break;
          }
        } else {
          break;
        }
      }
    }

    const ws = XLSX.utils.aoa_to_sheet([...clientInfo, [], loanDataHeaders, ...loanDataRows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'LoanData');

    const blob = new Blob([new Uint8Array(XLSX.write(wb, { bookType: 'xlsx', type: 'array' }))], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    saveAs(blob, 'LoanData.xlsx');

    
    
  };

  function calculateAge(birthdate) {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  function calculateFinishAge(birthdate) {
    const birthDate = new Date(birthdate);
    const today = new Date();

    let finishYear = birthDate.getFullYear();
    let finishMonth = birthDate.getMonth();

    if (loanTermUnit === 'months') {
      finishYear += Math.floor((finishMonth + parseInt(loanTerm)) / 12);
      finishMonth = (finishMonth + parseInt(loanTerm)) % 12;
      let finishAge = today.getFullYear() - finishYear;

      if (today.getMonth() < finishMonth || (today.getMonth() === finishMonth && today.getDate() < birthDate.getDate())) {
        finishAge--;
      }

      return finishAge;
    } else {
      finishYear += parseInt(loanTerm);
      const finishAge = finishYear >= today.getFullYear() ? calculateAge(birthdate) + parseInt(loanTerm) - 1 : calculateAge(birthdate) + parseInt(loanTerm);
      return finishAge;
    }
  }

  function getMonthName(monthIndex) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames[monthIndex - 1];
  }

  return (
    <div className='header'>
      <h1>Loan Calculator</h1>

      <div className='input-label'>
        <label>Enter Your Name:</label>
        <input
          type="text"
          value={name}
          placeholder='Enter your Name'
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className='input-label'>
        <label>Email:</label>
        <input
          type="email"
          placeholder='Enter your Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className='input-label'>
        <label>Date of birth:</label>
        <input
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
        />
      </div>

      <div className='input-label'>
        <label>Loan Amount (₹):</label>
        <input
          type="text"
          value={principal !== '' ? numeral(principal).format('0,0') : ''}
          onChange={(e) => setPrincipal(e.target.value.replace(/[^0-9]/g, ''))}
        />
      </div>

      <div className='input-label'>
        <label>Annual Interest Rate (%):</label>
        <input
          type="number"
          value={interestRate}
          onChange={(e) => setInterestRate(e.target.value)}
        />
      </div>

      <div className='input-label1'>
        <label>Loan Term:</label>
        <div className='loan-term-container'>
          <div className='inline-container'>
            <select
              className='dropdown'
              value={loanTermUnit}
              onChange={(e) => setLoanTermUnit(e.target.value)}
            >
              <option value="months">Months</option>
              <option value="years">Years</option>
            </select>
            <> 
              <select
                className='dropdown'
                value={startMonth}
                onChange={(e) => setStartMonth(e.target.value)}
              >
                <option value="1">January</option>
                <option value="2">February</option>
                <option value="3">March</option>
                <option value="4">April</option>
                <option value="5">May</option>
                <option value="6">June</option>
                <option value="7">July</option>
                <option value="8">August</option>
                <option value="9">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
              <input
                className='box'
                type="number"
                value={loanTerm}
                onChange={(e) => setLoanTerm(e.target.value)}
              />
            </>
          </div>
        </div>
      </div>

      <div className='button-container'>
        <button type="button" class="btn btn-outline-dark" onClick={resetForm}> <ArrowCounterclockwise /></button>
        <button type="button" class="btn btn-outline-dark" onClick={calculateLoan}> <CheckLg /></button>
        <button type="button" className="btn btn-outline-dark" onClick={exportToExcel}>
          <FileEarmarkArrowDown />
        </button>
      </div>

      {monthlyPayment && (
        <div>
          <h3 className='result'>Hello Mr/Mrs: {name}</h3>
          <h3 className='result'>Email: {email}</h3>
          <h3 className='result'>Date of birth: {dob}</h3>
          {monthlyPayment && (
            <div>
              <h3 className='result'>Monthly Payment: ₹{numeral(monthlyPayment).format('0,0')}</h3>
            </div>
          )}
          {principal && (
            <div>
              <h3 className='result'>Principal: ₹{numeral(principal).format('0,0')}</h3>
            </div>
          )}
          {totalInterest && (
            <div>
              <h3 className='result'>Total Interest: ₹{numeral(totalInterest).format('0,0')}</h3>
            </div>
          )}
          {totalPayment && (
            <div>
              <h3 className='result'>Total Payment: ₹{numeral(totalPayment).format('0,0')}</h3>
            </div>
          )}
          
        </div>
      )}
      {chartData && (
        <div className='chart-container'>
          <h2>Loan Distribution</h2>
          <Pie data={chartData.data} options={chartData.options} />
        </div>
      )}

      <div className='center-container'>
        <Link to="/">
          <button type="button" className="btn btn-outline-success">Go back to Home <ArrowLeft /></button>
        </Link>
      </div>
    </div>
  )
};

export default LoanCalculator;
