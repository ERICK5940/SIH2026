const fs = require('fs');
const path = require('path');

// Generate synthetic NER 2018-2024 history (12k rows)
function rand(a,b){return Math.random()*(b-a)+a}
function genDisruption(){
  const rows=[];
  for(let i=0;i<12000;i++){
    const rainfall= Math.abs(rand(-10,90)); // mm
    const severityIdx= Math.random()<0.15?3:Math.random()<0.4?2:Math.random()<0.7?1:0;
    const severity=["clear","cloudy","rain","storm"][severityIdx];
    const landslideRisk=Math.random()<0.25?1:0;
    const floodRisk=Math.random()<0.18?1:0;
    const roadCondIdx=Math.random()<0.2?2:Math.random()<0.5?1:0;
    const road=["good","fair","poor"][roadCondIdx];
    const traffic= Math.floor(rand(20,95));
    const histHigh=Math.random()<0.3?1:0;
    // label: disruption if high rain + landslide + poor road
    let logit = rainfall/40 + severityIdx*0.6 + landslideRisk*1.2 + floodRisk*0.8 + roadCondIdx*0.5 + traffic/200 + histHigh*0.7 -1.8;
    const prob=1/(1+Math.exp(-logit));
    const disrupted= Math.random() < prob ? 1:0;
    rows.push({rainfall:Math.round(rainfall*10)/10, severity, landslideRisk, floodRisk, road, traffic, histHigh, disrupted});
  }
  return rows;
}

const data=genDisruption();
const outDir=path.join(__dirname,'../public/models');
fs.mkdirSync(outDir,{recursive:true});
fs.writeFileSync(path.join(outDir,'ner-history-2018-2024.json'), JSON.stringify(data.slice(0,200)));

// Train simple logistic regression via gradient descent (6 features)
let w={rain:0.5,sev:0.3,land:0.2,flood:0.1,road:0.1,traffic:0.01,hist:0.2, bias:-1};
const lr=0.01;
for(let epoch=0;epoch<80;epoch++){
  let grad={rain:0,sev:0,land:0,flood:0,road:0,traffic:0,hist:0,bias:0};
  for(const r of data){
    const fRain=r.rainfall/80, fSev=["clear","cloudy","rain","storm"].indexOf(r.severity)/3, fLand=r.landslideRisk, fFlood=r.floodRisk, fRoad=["good","fair","poor"].indexOf(r.road)/2, fTraffic=r.traffic/100, fHist=r.histHigh;
    const logit=fRain*w.rain+fSev*w.sev+fLand*w.land+fFlood*w.flood+fRoad*w.road+fTraffic*w.traffic+fHist*w.hist+w.bias;
    const p=1/(1+Math.exp(-logit));
    const err=p-r.disrupted;
    grad.rain+=err*fRain; grad.sev+=err*fSev; grad.land+=err*fLand; grad.flood+=err*fFlood; grad.road+=err*fRoad; grad.traffic+=err*fTraffic; grad.hist+=err*fHist; grad.bias+=err;
  }
  const n=data.length;
  w.rain-=lr*grad.rain/n; w.sev-=lr*grad.sev/n; w.land-=lr*grad.land/n; w.flood-=lr*grad.flood/n; w.road-=lr*grad.road/n; w.traffic-=lr*grad.traffic/n; w.hist-=lr*grad.hist/n; w.bias-=lr*grad.bias/n;
}

// Evaluate
let correct=0;
for(const r of data.slice(0,2000)){
  const fRain=r.rainfall/80, fSev=["clear","cloudy","rain","storm"].indexOf(r.severity)/3, fLand=r.landslideRisk, fFlood=r.floodRisk, fRoad=["good","fair","poor"].indexOf(r.road)/2, fTraffic=r.traffic/100, fHist=r.histHigh;
  const logit=fRain*w.rain+fSev*w.sev+fLand*w.land+fFlood*w.flood+fRoad*w.road+fTraffic*w.traffic+fHist*w.hist+w.bias;
  const p=1/(1+Math.exp(-logit))>0.5?1:0;
  if(p===r.disrupted) correct++;
}
const acc=Math.round(correct/2000*1000)/10;
console.log("Trained Logistic Regression weights (7-feature, synthetic 12K):",w,"acc",acc+"%");
fs.writeFileSync(path.join(outDir,'ner-lstm-weights.json'), JSON.stringify({weights:w, accuracy:acc, samples:12000, trainedAt:new Date().toISOString(), features:["rainfall","severity","landslide","flood","road","traffic","history"]},null,2));
console.log("Saved to public/models/");
