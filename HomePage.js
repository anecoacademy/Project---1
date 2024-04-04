import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'react-bootstrap-icons';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className='center-container'>
      <div className='header'>
        <h1>Welcome to {'\n'} My Financial Calculators App </h1>
        <p>Explore and calculate your finances with ease!</p>
      </div>

      <div className="calculator-links">
        <div className="calculator-link">
          <h2>Loan Calculator</h2>
          <p>Calculate your loans with ease!</p>
          <Link to="/loan-calculator">
            <button type="button" className="btn btn-success">
              Go to Loan Calculator <ArrowRight />
            </button>
          </Link>
        </div>

        <div className="calculator-link">
          <h2>Savings Calculator</h2>
          <p>Plan your savings and investments!</p>
          <Link to="/saving-calculator">
            <button type="button" className="btn btn-success">
              Go to Saving Calculator <ArrowRight />
            </button>
          </Link>
        </div>
      </div>

      <div className="additional-info">
        <p>Why choose our calculators?</p>
        <ul>
          <li>Easy-to-use interface</li>
          <li>Accurate calculations</li>
          <li>Quick results</li>
        </ul>
      </div>

      <div className="footer">
        <p>&copy; 2024 My Financial Calculators App</p>
      </div>
    </div>
  );
};

export default HomePage;
