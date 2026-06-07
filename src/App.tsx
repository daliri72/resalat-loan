/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";

interface RowData {
  index: number;
  installments: number;
  loanAmount: number;
  requiredScore: number;
  scorePurchaseCost: number;
  installmentAmount: number;
  netAmt: number;
  promissoryNoteAmt: number;
}

export default function App() {
  // Input states
  const [repaymentCapacityInput, setRepaymentCapacityInput] = useState<string>("10,000,000");
  const [scorePurchaseInput, setScorePurchaseInput] = useState<string>("200,000");

  // Calculated state (updates on "محاسبه" button click)
  const [repaymentCapacity, setRepaymentCapacity] = useState<number>(10000000);
  const [scorePurchaseRate, setScorePurchaseRate] = useState<number>(200000);

  // Helper to parse comma-separated string back to a valid number
  const parseRawNumber = (val: string): number => {
    const cleanDigits = val.replace(/,/g, "").replace(/[۰-۹]/g, (d) => 
      String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))
    );
    const parsed = parseInt(cleanDigits, 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Helper to format raw number to a pretty comma-separated string for display
  const toCommaString = (num: number): string => {
    return num.toLocaleString("en-US");
  };

  // Format with Persian Digits and commas
  const toPersianCommaString = (num: number): string => {
    if (isNaN(num) || num === null) return "۰";
    const rounded = Math.round(num);
    return rounded.toLocaleString("fa-IR");
  };

  // Input change handlers that dynamically add comma formatting
  const handleRepaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const numericValue = parseRawNumber(rawVal);
    if (numericValue === 0 && rawVal === "") {
      setRepaymentCapacityInput("");
    } else {
      setRepaymentCapacityInput(toCommaString(numericValue));
    }
  };

  const handleScorePurchaseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const numericValue = parseRawNumber(rawVal);
    if (numericValue === 0 && rawVal === "") {
      setScorePurchaseInput("");
    } else {
      setScorePurchaseInput(toCommaString(numericValue));
    }
  };

  // Triggers the matrix calculation
  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const parsedRepayment = parseRawNumber(repaymentCapacityInput);
    const parsedRate = parseRawNumber(scorePurchaseInput);
    
    setRepaymentCapacity(parsedRepayment);
    setScorePurchaseRate(parsedRate);
  };

  // Triggers print view
  const handlePrint = () => {
    window.print();
  };

  // Compute table rows based on calculations from user inputs
  // تعداد اقساط از 10 الی 36
  const tableRows = useMemo(() => {
    const rows: RowData[] = [];
    for (let count = 10; count <= 36; count++) {
      // مبلغ وام = توان بازپرداخت * تعداد اقساط
      const loanAmount = repaymentCapacity * count;

      // مقدار مورد نیاز = ((مبلغ وام / 1000000) * تعداد اقساط) / 10
      const requiredScore = ((loanAmount / 1000000) * count) / 10;

      // مبلغ خرید امتیاز = (مقدار مورد نیاز * مبلغ خرید امتیاز)
      const scorePurchaseCost = requiredScore * scorePurchaseRate;

      // مبلغ قسط = مبلغ وام / تعداد اقساط
      const installmentAmount = loanAmount / count;

      // خالص = مبلغ وام - خرید امتیاز
      const netAmt = loanAmount - scorePurchaseCost;

      // مبلغ سفته = مبلغ وام * 120٪
      const promissoryNoteAmt = loanAmount * 1.2;

      rows.push({
        index: count - 9, // ردیف از ۱ الی ۲۷
        installments: count,
        loanAmount,
        requiredScore,
        scorePurchaseCost,
        installmentAmount,
        netAmt,
        promissoryNoteAmt,
      });
    }
    return rows;
  }, [repaymentCapacity, scorePurchaseRate]);

  return (
    <div className="container my-4 text-end">
      
      {/* Dynamic Header */}
      <div className="text-center mb-4">
        <h2 className="fw-bold text-dark">سیستم محاسبه تسهیلات و امتیاز اعتباری</h2>
        <p className="text-muted small">برآورد جدول اقساط و هزینه‌های خرید امتیاز از دوره زمان‌بندی ۱۰ الی ۳۶ ماهه</p>
      </div>

      {/* Inputs Form */}
      <div className="card shadow-sm border-0 mb-4 no-print">
        <div className="card-body bg-white rounded-3">
          <form onSubmit={handleCalculate}>
            <div className="row g-3">
              
              {/* Repayment Capacity */}
              <div className="col-md-6 text-start">
                <label htmlFor="repaymentCap" className="form-label fw-bold text-secondary text-end w-100">
                  توان بازپرداخت (تومان):
                </label>
                <input
                  id="repaymentCap"
                  type="text"
                  className="form-control form-control-lg text-start"
                  value={repaymentCapacityInput}
                  onChange={handleRepaymentChange}
                  placeholder="مثال: ۱۰,۰۰۰,۰۰۰"
                  style={{ direction: "ltr" }}
                />
              </div>

              {/* Score Purchase Rate */}
              <div className="col-md-6 text-start">
                <label htmlFor="scorePurchase" className="form-label fw-bold text-secondary text-end w-100">
                  مبلغ خرید امتیاز (تومان):
                </label>
                <input
                  id="scorePurchase"
                  type="text"
                  className="form-control form-control-lg text-start"
                  value={scorePurchaseInput}
                  onChange={handleScorePurchaseChange}
                  placeholder="مثال: ۲۰۰,۰۰۰"
                  style={{ direction: "ltr" }}
                />
              </div>

            </div>

            {/* Action Buttons */}
            <div className="d-flex justify-content-between align-items-center mt-4">
              <button
                type="submit"
                id="calc-action"
                className="btn btn-primary px-4 py-2"
              >
                محاسبه
              </button>
              <button
                type="button"
                id="print-action"
                onClick={handlePrint}
                className="btn btn-outline-dark px-4 py-2"
              >
                چاپ
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Output Table */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3 border-0">
          <h5 className="mb-0 fw-bold text-dark">جدول زمان‌بندی و مبالغ نهایی محاسبات</h5>
        </div>
        <div className="table-responsive">
          <table className="table table-striped table-bordered align-middle mb-0 text-center">
            <thead className="table-dark">
              <tr>
                <th scope="col" className="text-center">ردیف</th>
                <th scope="col" className="text-center">تعداد اقساط</th>
                <th scope="col" className="text-center">مبلغ وام (تومان)</th>
                <th scope="col" className="text-center">مقدار موردنیاز امتیاز</th>
                <th scope="col" className="text-center">خرید امتیاز (تومان)</th>
                <th scope="col" className="text-center">مبلغ قسط (تومان)</th>
                <th scope="col" className="text-center">خالص (تومان)</th>
                <th scope="col" className="text-center">مبلغ خرید سفته (۱۲۰٪)</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => (
                <tr key={row.installments}>
                  <td>{toPersianCommaString(row.index)}</td>
                  <td><strong>{toPersianCommaString(row.installments)}</strong></td>
                  <td>{toPersianCommaString(row.loanAmount)}</td>
                  <td>{toPersianCommaString(row.requiredScore)}</td>
                  <td>{toPersianCommaString(row.scorePurchaseCost)}</td>
                  <td>{toPersianCommaString(row.installmentAmount)}</td>
                  <td className="text-success fw-bold">{toPersianCommaString(row.netAmt)}</td>
                  <td>{toPersianCommaString(row.promissoryNoteAmt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
