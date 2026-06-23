function formatCurrency(value){
  if(isNaN(value) || value === null) return '-';
  return Number(value).toLocaleString(undefined,{maximumFractionDigits:2});
}

function getPeriods(){
  const rows = Array.from(document.querySelectorAll('#periodTable tbody .period-row'));
  return rows.map(row=>({
    revenue: parseFloat(row.querySelector('.revenue').value) || 0,
    depreciation: parseFloat(row.querySelector('.depreciation').value) || 0,
    operatingProfit: parseFloat(row.querySelector('.operatingProfit').value) || 0,
    workingCapital: parseFloat(row.querySelector('.workingCapital').value) || 0,
    fcfCell: row.querySelector('.fcf')
  }));
}

function calcFCF(period){
  return period.operatingProfit + period.depreciation - period.workingCapital;
}

function calcNOPAT(period, taxRate){
  return period.operatingProfit * (1 - taxRate);
}

function npv(rate, flows){
  return flows.reduce((sum, flow, index) => sum + flow / Math.pow(1 + rate, index), 0);
}

function computeIRR(flows){
  const maxIter = 200;
  const tol = 1e-7;
  let lower = -0.999999;
  let upper = 1;
  let fLower = npv(lower, flows);
  let fUpper = npv(upper, flows);
  let attempts = 0;
  while(fLower * fUpper > 0 && attempts < 100){
    upper *= 2;
    fUpper = npv(upper, flows);
    attempts++;
  }
  if(fLower * fUpper > 0) return null;
  for(let i=0;i<maxIter;i++){
    const mid = (lower + upper) / 2;
    const fMid = npv(mid, flows);
    if(Math.abs(fMid) < tol) return mid;
    if(fLower * fMid <= 0){
      upper = mid;
      fUpper = fMid;
    } else {
      lower = mid;
      fLower = fMid;
    }
  }
  return (lower + upper) / 2;
}

function updateFCFTable(){
  const periods = getPeriods();
  periods.forEach(period => {
    const fcf = calcFCF(period);
    period.fcfCell.textContent = formatCurrency(fcf);
  });
}

function addPeriod(){
  const tbody = document.querySelector('#periodTable tbody');
  const count = tbody.querySelectorAll('.period-row').length + 1;
  const row = document.createElement('tr');
  row.className = 'period-row';
  row.innerHTML = `
    <th scope="row">${count}</th>
    <td><input type="number" class="revenue" value="0" step="any"></td>
    <td><input type="number" class="depreciation" value="0" step="any"></td>
    <td><input type="number" class="operatingProfit" value="0" step="any"></td>
    <td><input type="number" class="workingCapital" value="0" step="any"></td>
    <td><span class="fcf">0</span></td>
  `;
  tbody.appendChild(row);
}

function removePeriod(){
  const tbody = document.querySelector('#periodTable tbody');
  const rows = tbody.querySelectorAll('.period-row');
  if(rows.length > 1){
    tbody.removeChild(rows[rows.length - 1]);
  }
}

function updateRowNumbers(){
  const rows = document.querySelectorAll('#periodTable tbody .period-row');
  rows.forEach((row,index)=>{
    const th = row.querySelector('th');
    th.textContent = index + 1;
  });
}

function evaluateProject(npvVal){
  if(npvVal > 0) return '투자 타당';
  if(npvVal < 0) return '투자 부적합';
  return '한계적';
}

function calculate(){
  document.getElementById('message').textContent = '';
  const initial = parseFloat(document.getElementById('initial').value);
  const investedCapital = parseFloat(document.getElementById('investedCapital').value);
  const ratePerc = parseFloat(document.getElementById('rate').value);
  const taxRatePerc = parseFloat(document.getElementById('taxRate').value);
  if(isNaN(initial) || initial < 0){
    document.getElementById('message').textContent = '초기투자 금액을 올바르게 입력하세요.';
    return;
  }
  if(isNaN(investedCapital) || investedCapital <= 0){
    document.getElementById('message').textContent = '평균투하자본을 올바르게 입력하세요.';
    return;
  }
  if(isNaN(ratePerc)){
    document.getElementById('message').textContent = '할인율을 올바르게 입력하세요.';
    return;
  }
  if(isNaN(taxRatePerc) || taxRatePerc < 0 || taxRatePerc > 100){
    document.getElementById('message').textContent = '법인세율을 0~100 사이로 입력하세요.';
    return;
  }
  const taxRate = taxRatePerc / 100;
  const periods = getPeriods();
  const flows = [-Math.abs(initial)];
  const nopats = [];
  periods.forEach(period=>{
    const fcf = calcFCF(period);
    flows.push(fcf);
    nopats.push(calcNOPAT(period, taxRate));
  });
  updateFCFTable();
  const rate = ratePerc / 100;
  const npvVal = npv(rate, flows);
  const irrVal = computeIRR(flows);
  const avgNOPAT = nopats.reduce((sum,val)=>sum+val,0) / nopats.length;
  const roicVal = investedCapital > 0 ? avgNOPAT / investedCapital : null;
  document.getElementById('npvResult').textContent = formatCurrency(npvVal);
  document.getElementById('irrResult').textContent = irrVal === null ? '계산 불가' : (irrVal * 100).toFixed(2) + '%';
  document.getElementById('roicResult').textContent = roicVal === null ? '계산 불가' : (roicVal * 100).toFixed(2) + '%';
  document.getElementById('statusResult').textContent = evaluateProject(npvVal);
}

function reset(){
  document.getElementById('initial').value = 1000000;
  document.getElementById('rate').value = 10;
  const tbody = document.querySelector('#periodTable tbody');
  tbody.innerHTML = `
    <tr class="period-row">
      <th scope="row">1</th>
      <td><input type="number" class="revenue" value="2000000" step="any"></td>
      <td><input type="number" class="depreciation" value="120000" step="any"></td>
      <td><input type="number" class="operatingProfit" value="450000" step="any"></td>
      <td><input type="number" class="workingCapital" value="30000" step="any"></td>
      <td><span class="fcf">0</span></td>
    </tr>
    <tr class="period-row">
      <th scope="row">2</th>
      <td><input type="number" class="revenue" value="2100000" step="any"></td>
      <td><input type="number" class="depreciation" value="115000" step="any"></td>
      <td><input type="number" class="operatingProfit" value="480000" step="any"></td>
      <td><input type="number" class="workingCapital" value="25000" step="any"></td>
      <td><span class="fcf">0</span></td>
    </tr>
    <tr class="period-row">
      <th scope="row">3</th>
      <td><input type="number" class="revenue" value="2200000" step="any"></td>
      <td><input type="number" class="depreciation" value="110000" step="any"></td>
      <td><input type="number" class="operatingProfit" value="520000" step="any"></td>
      <td><input type="number" class="workingCapital" value="20000" step="any"></td>
      <td><span class="fcf">0</span></td>
    </tr>
  `;
  document.getElementById('npvResult').textContent = '-';
  document.getElementById('irrResult').textContent = '-';
  document.getElementById('roicResult').textContent = '-';
  document.getElementById('statusResult').textContent = '-';
  document.getElementById('message').textContent = '';
}

document.getElementById('addPeriod').addEventListener('click', ()=>{
  addPeriod();
  updateRowNumbers();
});

document.getElementById('removePeriod').addEventListener('click', ()=>{
  removePeriod();
  updateRowNumbers();
});

document.getElementById('calcBtn').addEventListener('click', calculate);

document.getElementById('resetBtn').addEventListener('click', reset);

updateFCFTable();
