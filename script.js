function getCashFlows(){
  const initial = parseFloat(document.getElementById('initial').value) || 0;
  const cfEls = Array.from(document.querySelectorAll('.cf'));
  const flows = [-Math.abs(initial)];
  cfEls.forEach(el=>{
    const v = parseFloat(el.value);
    flows.push(isNaN(v)?0:v);
  });
  return flows;
}

function npv(rate, flows){
  let sum=0;
  for(let t=0;t<flows.length;t++){
    sum += flows[t] / Math.pow(1+rate, t);
  }
  return sum;
}

function computeIRR(flows){
  const maxIter = 200;
  const tol = 1e-7;
  // find bracket
  let lower = -0.999999;
  let upper = 1;
  let fLower = npv(lower, flows);
  let fUpper = npv(upper, flows);
  // expand upper until sign change or limit
  let attempts=0;
  while(fLower*fUpper>0 && attempts<100){
    upper *= 2;
    fUpper = npv(upper, flows);
    attempts++;
  }
  if(fLower*fUpper>0) return null;
  // bisection
  for(let i=0;i<maxIter;i++){
    const mid = (lower+upper)/2;
    const fmid = npv(mid, flows);
    if(Math.abs(fmid) < tol) return mid;
    if(fLower * fmid <= 0){
      upper = mid;
      fUpper = fmid;
    } else {
      lower = mid;
      fLower = fmid;
    }
  }
  return (lower+upper)/2;
}

function formatCurrency(x){
  return Number(x).toLocaleString(undefined,{maximumFractionDigits:2});
}

document.getElementById('addPeriod').addEventListener('click', ()=>{
  const cfContainer = document.getElementById('cashflows');
  const n = cfContainer.querySelectorAll('.cf-row').length + 1;
  const div = document.createElement('div');
  div.className = 'cf-row';
  div.innerHTML = `기간 ${n}: <input type="number" class="cf" value="0" step="any">`;
  cfContainer.appendChild(div);
});

document.getElementById('removePeriod').addEventListener('click', ()=>{
  const cfContainer = document.getElementById('cashflows');
  const rows = cfContainer.querySelectorAll('.cf-row');
  if(rows.length>1) cfContainer.removeChild(rows[rows.length-1]);
});

document.getElementById('calcBtn').addEventListener('click', ()=>{
  document.getElementById('message').textContent = '';
  const flows = getCashFlows();
  const ratePerc = parseFloat(document.getElementById('rate').value);
  if(isNaN(ratePerc)){
    document.getElementById('message').textContent = '할인율을 입력하세요.';
    return;
  }
  const rate = ratePerc/100;
  const npvVal = npv(rate, flows);
  const irrVal = computeIRR(flows);
  document.getElementById('npvResult').textContent = formatCurrency(npvVal);
  if(irrVal===null){
    document.getElementById('irrResult').textContent = '계산 불가';
  } else {
    document.getElementById('irrResult').textContent = (irrVal*100).toFixed(4) + '%';
  }
});

document.getElementById('resetBtn').addEventListener('click', ()=>{
  document.getElementById('initial').value = 1000;
  const cfs = document.querySelectorAll('.cf');
  cfs.forEach((el,i)=>{
    el.value = (i<3)?400:0;
  });
  document.getElementById('rate').value = 10;
  document.getElementById('npvResult').textContent = '-';
  document.getElementById('irrResult').textContent = '-';
  document.getElementById('message').textContent = '';
});
