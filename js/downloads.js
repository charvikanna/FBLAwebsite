// Downloadable materials - Money Minds

window.downloadMaterial = function(id) {
  if (id === 'balance-sheet') {
    const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Balance Sheet Cheat Sheet</title><style>body{font-family:sans-serif;padding:2rem;max-width:600px;margin:0 auto}h1{color:#059669}table{width:100%;border-collapse:collapse;margin:1rem 0}th,td{border:1px solid #ddd;padding:0.5rem;text-align:left}th{background:#f0fdf4}.footer{margin-top:2rem;font-size:0.8rem;color:#666}</style></head><body><h1>Balance Sheet Cheat Sheet</h1><p><strong>Assets = Liabilities + Equity</strong></p><h2>Assets</h2><ul><li>Current: Cash, Receivables, Inventory</li><li>Non-current: PP&E, Intangibles, Investments</li></ul><h2>Liabilities</h2><ul><li>Current: Payables, Short-term debt</li><li>Long-term: Bonds, Loans</li></ul><h2>Equity</h2><ul><li>Common stock, Retained earnings</li></ul><p class="footer">Money Minds – Educational purposes only</p></body></html>';
    const blob = new Blob([html], { type: 'text/html' });
    triggerDownload(blob, 'balance-sheet-cheatsheet.html', 'text/html');
  } else if (id === 'financial-ratios') {
    const csv = 'Ratio,Formula,Use\nCurrent Ratio,Current Assets/Current Liabilities,Liquidity\nQuick Ratio,(Current Assets-Inventory)/Current Liabilities,Liquidity\nDebt-to-Equity,Total Debt/Total Equity,Leverage\nROE,Net Income/Shareholders Equity,Profitability\nROA,Net Income/Total Assets,Profitability\nProfit Margin,Net Income/Revenue,Profitability\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    triggerDownload(blob, 'financial-ratios-worksheet.csv', 'text/csv');
  } else if (id === 'budget-template') {
    const csv = 'Category,Planned,Actual,Difference\nIncome,,,\nExpenses,,,\nSavings,,,\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    triggerDownload(blob, 'monthly-budget-template.csv', 'text/csv');
  } else if (id === 'credit-checklist') {
    const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Credit Health Checklist</title><style>body{font-family:sans-serif;padding:2rem;max-width:600px;margin:0 auto}h1{color:#059669}ul{line-height:2}input[type=checkbox]{margin-right:0.5rem}</style></head><body><h1>Credit Health Checklist</h1><ul><li>□ Check credit report annually</li><li>□ Pay bills on time</li><li>□ Keep utilization under 30%</li><li>□ Avoid opening too many accounts</li><li>□ Build emergency fund</li></ul><p style="font-size:0.8rem;color:#666">Money Minds</p></body></html>';
    const blob = new Blob([html], { type: 'text/html' });
    triggerDownload(blob, 'credit-health-checklist.html', 'text/html');
  } else if (id === 'dcf-template') {
    const csv = 'Year,Revenue,Growth %,FCF\n1,,,,\n2,,,,\n3,,,,\n4,,,,\n5,,,,\nTerminal Value,,,\nWACC (discount rate):,\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    triggerDownload(blob, 'dcf-model-template.csv', 'text/csv');
  } else if (id === 'investing-basics') {
    const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Investing Basics Cheat Sheet</title><style>body{font-family:sans-serif;padding:2rem;max-width:600px;margin:0 auto}h1{color:#059669}</style></head><body><h1>Investing Basics</h1><h2>Asset Classes</h2><p>Stocks, Bonds, Cash, Real Estate</p><h2>Key Principles</h2><ul><li>Diversification reduces risk</li><li>Time in market beats timing the market</li><li>Compound interest is powerful</li></ul><p style="font-size:0.8rem;color:#666">Money Minds</p></body></html>';
    const blob = new Blob([html], { type: 'text/html' });
    triggerDownload(blob, 'investing-basics-cheatsheet.html', 'text/html');
  }
};

function triggerDownload(blob, filename, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
