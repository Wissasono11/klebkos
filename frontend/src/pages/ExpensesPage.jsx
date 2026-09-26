import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { CashFlowTable } from '../components/expenses/CashFlowTable';
import { AddExpenseModal } from '../components/expenses/AddExpenseModal';
import { EditExpenseModal } from '../components/expenses/EditExpenseModal';
import { AddIncomeModal } from '../components/incomes/AddIncomeModal';
import { EditIncomeModal } from '../components/incomes/EditIncomeModal';

gsap.registerPlugin(useGSAP);

export const ExpensesPage = () => {
  const pageRef = useRef(null);

  useGSAP(() => {
    gsap.from('.cashflow-section', {
      y: 16,
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out',
      clearProps: 'all'
    });
  }, { scope: pageRef });

  return (
    <div ref={pageRef} className="space-y-6">
      <div className="cashflow-section">
        <CashFlowTable />
      </div>

      <AddExpenseModal />
      <EditExpenseModal />
      <AddIncomeModal />
      <EditIncomeModal />
    </div>
  );
};
