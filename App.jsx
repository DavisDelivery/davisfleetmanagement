const APP_VERSION = "1.0.0";
const DAVIS_LOGO = "data:image/jpeg;base64,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";

const ST = [
  {id:"0154",mk:"FRTLN",tr:"A",ax:"Single"},{id:"0294",mk:"FRTLN",tr:"A",ax:"Single"},
  {id:"0608",mk:"FRTLN",tr:"A",ax:"Single"},{id:"0805",mk:"HINO",tr:"A",ax:"Single"},
  {id:"0878",mk:"INTL",tr:"A",ax:"Single"},{id:"1478",mk:"FRTLN",tr:"A",ax:"Single"},
  {id:"1972",mk:"FRTLN",tr:"M",ax:"Single"},{id:"2403",mk:"HINO",tr:"A",ax:"Single"},
  {id:"3299",mk:"FRTLN",tr:"A",ax:"Single"},{id:"4114",mk:"FRTLN",tr:"A",ax:"Single"},
  {id:"4757",mk:"HINO",tr:"A",ax:"Single"},{id:"4952",mk:"HINO",tr:"A",ax:"Single"},
  {id:"5042",mk:"FRTLN",tr:"A",ax:"Single"},{id:"5075",mk:"Ford",tr:"A",ax:"Single"},
  {id:"5293",mk:"FRTLN",tr:"A",ax:"Single"},{id:"5588",mk:"FRTLN",tr:"A",ax:"Single"},
  {id:"5983",mk:"FRTLN",tr:"A",ax:"Single"},{id:"6178",mk:"FRTLN",tr:"A",ax:"Single"},
  {id:"6271",mk:"FRTLN",tr:"A",ax:"Single"},{id:"6664",mk:"HINO",tr:"A",ax:"Single"},
  {id:"6892",mk:"HINO",tr:"A",ax:"Single"},{id:"7521",mk:"FRTLN",tr:"A",ax:"Single"},
  {id:"7569",mk:"HINO",tr:"A",ax:"Single"},{id:"7933",mk:"INTL",tr:"A",ax:"Single"},
  {id:"8257",mk:"HINO",tr:"A",ax:"Single"},{id:"9445",mk:"HINO",tr:"A",ax:"Single"},
].map(x=>({...x,type:"straight"}));

const TR = [
  {id:"0186",mk:"Tractor",tr:"M",ax:"Single"},{id:"0367",mk:"Tractor",tr:"M",ax:"Tandem"},
  {id:"0423",mk:"Tractor",tr:"M",ax:"Single"},{id:"0424",mk:"Tractor",tr:"M",ax:"Single"},
  {id:"0451",mk:"Tractor",tr:"M",ax:"Tandem"},{id:"0877",mk:"Tractor",tr:"A",ax:"Tandem"},
  {id:"0920",mk:"Tractor",tr:"M",ax:"Single"},{id:"1287",mk:"Tractor",tr:"M",ax:"Single"},
  {id:"1368",mk:"Tractor",tr:"A",ax:"Single"},{id:"1502",mk:"Tractor",tr:"A",ax:"Tandem"},
  {id:"1506",mk:"Tractor",tr:"M",ax:"Tandem"},{id:"1606",mk:"Tractor",tr:"M",ax:"Single"},
  {id:"1637",mk:"Tractor",tr:"M",ax:"Single"},{id:"1874",mk:"Tractor",tr:"A",ax:"Single"},
  {id:"2195",mk:"Tractor",tr:"M",ax:"Single"},{id:"2561",mk:"Tractor",tr:"M",ax:"Single"},
  {id:"2617",mk:"Tractor",tr:"M",ax:"Single"},{id:"2618",mk:"Tractor",tr:"M",ax:"Tandem"},
  {id:"2883",mk:"Tractor",tr:"M",ax:"Single"},{id:"3889",mk:"Tractor",tr:"M",ax:"Single"},
  {id:"3977",mk:"Tractor",tr:"A",ax:"Tandem"},{id:"5078",mk:"Tractor",tr:"M",ax:"Single"},
  {id:"5255",mk:"Tractor",tr:"M",ax:"Single"},{id:"5924",mk:"Tractor",tr:"M",ax:"Single"},
  {id:"5933",mk:"Tractor",tr:"A",ax:"Single"},{id:"6560",mk:"Tractor",tr:"A",ax:"Tandem"},
  {id:"6957",mk:"Tractor",tr:"A",ax:"Single"},{id:"7369",mk:"Tractor",tr:"M",ax:"Single"},
  {id:"7608",mk:"Tractor",tr:"M",ax:"Single"},{id:"7750",mk:"Tractor",tr:"M",ax:"Tandem"},
  {id:"7773",mk:"Tractor",tr:"M",ax:"Single"},{id:"8829",mk:"Tractor",tr:"A",ax:"Tandem"},
].map(x=>({...x,type:"tractor"}));

const ID=[
  {n:"Aaron Mitchell",r:"Davis Straight Driver",c:"Davis"},{n:"Allen Council",r:"Davis Tractor Driver",c:"Davis"},
  {n:"Anthony Kostner",r:"Davis Tractor Driver",c:"Davis"},{n:"Brent Bryd",r:"Davis Tractor Driver",c:"Davis"},
  {n:"Brett Spradley",r:"Davis Tractor Driver",c:"Davis"},{n:"Brian Worley",r:"Davis Tractor Driver",c:"Davis"},
  {n:"Che Roberts",r:"Davis Tractor Driver",c:"Davis"},{n:"Chris Head",r:"Davis Tractor Driver",c:"Davis"},
  {n:"Darvin Cepeda",r:"Davis Tractor Driver",c:"Davis"},{n:"Denis Salkic",r:"Davis Tractor Driver",c:"Davis"},
  {n:"Enock Akyea",r:"Davis Straight Driver",c:"Davis"},{n:"Garry Pitts",r:"Davis Tractor Driver",c:"Davis"},
  {n:"James DAVIS",r:"Uline Shuttle Driver",c:"Davis"},{n:"Jew Williams",r:"Uline Shuttle Driver",c:"Davis"},
  {n:"Jim Pallette",r:"Davis Tractor Driver",c:"Davis"},{n:"John Thompson",r:"Davis Straight Driver",c:"Davis"},
  {n:"Johnathan Sailers",r:"Uline Shuttle Driver",c:"Davis"},{n:"Jovenski Gibbs",r:"Owner Straight Driver",c:"Davis"},
  {n:"Junior Thomas",r:"Davis Tractor Driver",c:"Davis"},{n:"Leroy Smith",r:"Davis Straight Driver",c:"Davis"},
  {n:"Leslie Thomas",r:"Uline Shuttle Driver",c:"Davis"},{n:"Mandi Malbrough",r:"Davis Straight Driver",c:"Davis"},
  {n:"Marcus Crumpton",r:"Davis Straight Driver",c:"Davis"},{n:"Marcus Young",r:"Davis Tractor Driver",c:"Davis"},
  {n:"Mareese Johnson",r:"Davis Tractor Driver",c:"Davis"},{n:"Michael Frye",r:"Davis Straight Driver",c:"Davis"},
  {n:"Michael Tharp",r:"Davis Straight Driver",c:"Davis"},{n:"Montel Bishop",r:"Davis Tractor Driver",c:"Davis"},
  {n:"Rasheed Davis",r:"Davis Straight Driver",c:"Davis"},{n:"Rasko Suljic",r:"Davis Tractor Driver",c:"Davis"},
  {n:"Robert Best",r:"Davis Tractor Driver",c:"Davis"},{n:"Scott Hart",r:"Davis Straight Driver",c:"Davis"},
  {n:"Tariq Hammou",r:"Davis Straight Driver",c:"Davis"},{n:"Terrance Hawk",r:"Davis Tractor Driver",c:"Davis"},
  {n:"Terrence Taylor",r:"Davis Straight Driver",c:"Davis"},{n:"Terry Gambrell",r:"Davis Straight Driver",c:"Davis"},
  {n:"Tobias Johnson",r:"Davis Straight Driver",c:"Davis"},{n:"Trevarr Howard",r:"Davis Straight Driver",c:"Davis"},
  {n:"William Kidd",r:"Davis Straight Driver",c:"Davis"},{n:"William Goodwin",r:"Davis Tractor Driver",c:"Davis"},
  {n:"Victor Fernandez",r:"Davis Tractor Driver",c:"Davis"},{n:"Trevor Syers",r:"Davis Straight Driver",c:"Davis"},
  {n:"Brent Dixon",r:"Davis Straight Driver",c:"Davis"},{n:"Brad Goodroe",r:"Load/Shift Driver",c:"Davis"},
  {n:"Andre Murphy",r:"Davis Tractor Driver",c:"Davis"},
  {n:"Alfred Morgan",r:"Owner Straight Driver",c:"Owner"},{n:"Anthony Bennett",r:"Owner Straight Driver",c:"Owner"},
  {n:"Ben Paintsil",r:"Owner Straight Driver",c:"Owner"},{n:"Colin Calhoun",r:"Owner Straight Driver",c:"Owner"},
  {n:"DJ McCrary",r:"Owner Straight Driver",c:"Owner"},{n:"Frank Okine",r:"Owner Straight Driver",c:"Owner"},
  {n:"Fred Andi",r:"Owner Straight Driver",c:"Owner"},{n:"George Leonard",r:"Owner Tractor Driver",c:"Owner"},
  {n:"Jean Delsion",r:"Owner Tractor Driver",c:"Owner"},{n:"Ken Watkins",r:"Owner Straight Driver",c:"Owner"},
  {n:"Kobe Kawakabe",r:"Owner Straight Driver",c:"Owner"},{n:"Martin Wyatt",r:"Owner Straight Driver",c:"Owner"},
  {n:"Mone Watkins",r:"Owner Straight Driver",c:"Owner"},{n:"Nana Owusu",r:"Owner Straight Driver",c:"Owner"},
  {n:"Olamide Kazeem",r:"Owner Straight Driver",c:"Owner"},{n:"Oyieke Nelson",r:"Owner Straight Driver",c:"Owner"},
  {n:"Richard Mawuenyega",r:"Owner Straight Driver",c:"Owner"},{n:"Ronald Gates",r:"Owner Straight Driver",c:"Owner"},
  {n:"Samuel Osei",r:"Owner Straight Driver",c:"Owner"},{n:"Theo Afunyah",r:"Owner Straight Driver",c:"Owner"},
  {n:"Vincent Bonzo",r:"Owner Straight Driver",c:"Owner"},{n:"Pierre Adeaban",r:"Owner Straight Driver",c:"Owner"},
].map(x=>({name:x.n,role:x.r,category:x.c}));

const DAYS=["Mon","Tue","Wed","Thu","Fri"];
const OFF_OPTS=["OFF","VAC","CALLED OUT","NO SHOW"];
const OOS_REASONS=["Mechanical Repair","Planned Maintenance","Tires","Body/Paint","Electrical","DOT Inspection","Accident Repair","Waiting Parts","Other"];
const C={brand:"#1e5b92",dark:"#153f66",light:"#e8f0f7",accent:"#d4841b",red:"#c0392b",green:"#27ae60",yellow:"#e6a817",purple:"#7b5ea7",cyan:"#2596be"};
const SC={available:C.green,assigned:C.brand,repair:C.yellow,oos:C.red,"for-sale":C.purple,unassigned:C.accent};
const SL={available:"Available",assigned:"Assigned",repair:"In Repair",oos:"Out of Service","for-sale":"For Sale",unassigned:"Needs Assignment"};

function gM(d){const dt=new Date(d);const dy=dt.getDay();dt.setDate(dt.getDate()-dy+(dy===0?-6:1));dt.setHours(0,0,0,0);return dt;}
function wK(d){const m=gM(d);return `${m.getFullYear()}-${String(m.getMonth()+1).padStart(2,"0")}-${String(m.getDate()).padStart(2,"0")}`;}
function fWL(d){const m=gM(d);const e=new Date(m);e.setDate(e.getDate()+4);const f=x=>`${x.getMonth()+1}/${x.getDate()}`;return `Week of ${f(m)} – ${f(e)}`;}
function dTT(r){const l=r.toLowerCase();if(l.includes("tractor"))return"tractor";if(l.includes("straight"))return"straight";if(l.includes("shuttle")||l.includes("yard"))return"tractor";return"all";}
function todayDI(){const d=new Date().getDay();return d===0||d===6?0:d-1;}
function dateStr(d){return d?new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"—";}

const RG=[
  {key:"ds",label:"Davis Straight Drivers",f:d=>d.category==="Davis"&&d.role.toLowerCase().includes("straight"),color:C.brand},
  {key:"dt",label:"Davis Tractor Drivers",f:d=>d.category==="Davis"&&d.role.toLowerCase().includes("tractor"),color:C.red},
  {key:"ul",label:"Uline Shuttle / Yard",f:d=>d.role.toLowerCase().includes("uline")||d.role.toLowerCase().includes("shuttle"),color:C.purple},
  {key:"ls",label:"Load/Shift Drivers",f:d=>d.role.toLowerCase().includes("load")||d.role.toLowerCase().includes("shift"),color:C.cyan},
  {key:"os",label:"Owner Op – Straight",f:d=>d.category==="Owner"&&d.role.toLowerCase().includes("straight"),color:C.accent},
  {key:"ot",label:"Owner Op – Tractor",f:d=>d.category==="Owner"&&d.role.toLowerCase().includes("tractor"),color:C.accent},
];
const BF=[{k:"all",l:"All Drivers"},{k:"box",l:"Box Truck"},{k:"tractor",l:"Tractor"},{k:"shuttle",l:"Shuttle"},{k:"load",l:"Load/Shift"},{k:"owner",l:"Owner Ops"}];

// ── MAIN APP ──
function App(){
  const[loaded,setLoaded]=useState(false);
  const[tab,setTab]=useState("dispatch");
  const[trucks,setTrucks]=useState([]);
  const[drivers,setDrivers]=useState([]);
  const[weekDate,setWeekDate]=useState(new Date());
  const[asgn,setAsgn]=useState({});
  const[tStat,setTStat]=useState({});
  const[repairs,setRepairs]=useState([]);
  const[search,setSearch]=useState("");
  const[filterType,setFilterType]=useState("all");
  const[editCell,setEditCell]=useState(null);
  const[editVal,setEditVal]=useState("");
  const[boardFilter,setBoardFilter]=useState("all");
  const[fleetView,setFleetView]=useState("list");
  const[showAddD,setShowAddD]=useState(false);
  const[showAddT,setShowAddT]=useState(false);
  const[newD,setNewD]=useState({name:"",role:"Davis Straight Driver",category:"Davis"});
  const[newT,setNewT]=useState({id:"",mk:"FRTLN",tr:"A",ax:"Single",type:"straight"});
  // Repair form
  const[showRepairForm,setShowRepairForm]=useState(null); // truckId or null
  const[repairForm,setRepairForm]=useState({reason:"Mechanical Repair",notes:"",shop:"",estReturn:"",cost:""});
  // Truck history modal
  const[historyTruck,setHistoryTruck]=useState(null);
  // Attendance weeks to load
  const[attendWeeks,setAttendWeeks]=useState({});
  // Cost tracking / Invoice scanner
  const[costEntries,setCostEntries]=useState([]);
  const[scanQueue,setScanQueue]=useState([]); // {id, file, dataUrl, status, parsed}
  const[scanning,setScanning]=useState(false);
  const[costFilter,setCostFilter]=useState("all"); // "all" or truck id
  const[costCatFilter,setCostCatFilter]=useState("all");
  const[showCostDetail,setShowCostDetail]=useState(null); // cost entry id
  const[driverReport,setDriverReport]=useState(null); // driver name or null

  const wk=wK(weekDate);

  // Load data
  useEffect(()=>{(async()=>{
    try{
      const[tR,dR,aR,sR,rR,cR]=await Promise.all([
        window.storage.get("fl-trucks").catch(()=>null),
        window.storage.get("fl-drivers").catch(()=>null),
        window.storage.get(`fl-asgn-${wk}`).catch(()=>null),
        window.storage.get(`fl-stat-${wk}`).catch(()=>null),
        window.storage.get("fl-repairs").catch(()=>null),
        window.storage.get("fl-costs").catch(()=>null),
      ]);
      setTrucks(tR?JSON.parse(tR.value):[...ST,...TR]);
      setDrivers(dR?JSON.parse(dR.value):[...ID]);
      setAsgn(aR?JSON.parse(aR.value):{});
      setTStat(sR?JSON.parse(sR.value):{});
      setRepairs(rR?JSON.parse(rR.value):[]);
      setCostEntries(cR?JSON.parse(cR.value):[]);
    }catch(e){setTrucks([...ST,...TR]);setDrivers([...ID]);}
    setLoaded(true);
  })();},[wk]);

  // Load attendance data (last 8 weeks)
  useEffect(()=>{if(!loaded)return;(async()=>{
    const weeks={};
    for(let i=0;i<8;i++){
      const d=new Date(weekDate);d.setDate(d.getDate()-i*7);
      const k=wK(d);
      try{const r=await window.storage.get(`fl-asgn-${k}`);if(r)weeks[k]=JSON.parse(r.value);}catch(e){}
    }
    setAttendWeeks(weeks);
  })();},[loaded,wk]);

  const sv=useCallback(async(k,v)=>{try{await window.storage.set(k,JSON.stringify(v));}catch(e){}},[]);
  const saveTrucks=t=>{setTrucks(t);sv("fl-trucks",t);};
  const saveDrivers=d=>{setDrivers(d);sv("fl-drivers",d);};
  const saveAsgn=useCallback(a=>{setAsgn(a);sv(`fl-asgn-${wk}`,a);},[wk,sv]);
  const saveTStat=useCallback(s=>{setTStat(s);sv(`fl-stat-${wk}`,s);},[wk,sv]);
  const saveRepairs=useCallback(r=>{setRepairs(r);sv("fl-repairs",r);},[sv]);
  const saveCosts=useCallback(c=>{setCostEntries(c);sv("fl-costs",c);},[sv]);

  // ── Invoice Scanner AI ──
  const COST_CATS=["Parts","Tires","Labor","Fuel","Oil","Body/Paint","Electrical","Inspection","Towing","Registration","Insurance","Other"];
  const DEFAULT_VENDORS=[
    {pattern:"fuelfox",name:"FuelFox Atlanta",category:"Fuel"},
    {pattern:"peachstate",name:"Peach State Freightliner",category:"Parts"},
  ];
  const[knownVendors,setKnownVendors]=useState(DEFAULT_VENDORS);
  const[showAddVendor,setShowAddVendor]=useState(false);
  const[newVendor,setNewVendor]=useState({name:"",category:"Parts"});

  // Load vendors from storage
  useEffect(()=>{(async()=>{
    try{const r=await window.storage.get("fl-vendors");if(r)setKnownVendors(JSON.parse(r.value));}catch(e){}
  })();},[]);
  const saveVendors=useCallback(v=>{setKnownVendors(v);sv("fl-vendors",v);},[sv]);
  const removeVendor=(name)=>saveVendors(knownVendors.filter(v=>v.name!==name));
  const addVendor=()=>{if(!newVendor.name.trim())return;saveVendors([...knownVendors,{pattern:newVendor.name.toLowerCase().replace(/\s+/g,""),name:newVendor.name,category:newVendor.category}]);setNewVendor({name:"",category:"Parts"});setShowAddVendor(false);};

  const handleFileUpload=async(e)=>{
    const files=Array.from(e.target.files);
    const queue=[];
    for(const file of files){
      if(file.type==="application/pdf"){
        // For PDFs, read as dataURL — AI will process the pages
        const dataUrl=await new Promise(res=>{const r=new FileReader();r.onload=()=>res(r.result);r.readAsDataURL(file);});
        queue.push({id:Date.now()+Math.random(),file:file.name,dataUrl,status:"ready",parsed:null,type:"pdf"});
      }else if(file.type.startsWith("image/")){
        const dataUrl=await new Promise(res=>{const r=new FileReader();r.onload=()=>res(r.result);r.readAsDataURL(file);});
        queue.push({id:Date.now()+Math.random(),file:file.name,dataUrl,status:"ready",parsed:null,type:"image"});
      }
    }
    setScanQueue(prev=>[...prev,...queue]);
  };

  const scanInvoices=async()=>{
    if(scanQueue.filter(q=>q.status==="ready").length===0)return;
    setScanning(true);
    const truckIds=trucks.map(t=>t.id).join(", ");
    const updated=[...scanQueue];

    for(let i=0;i<updated.length;i++){
      if(updated[i].status!=="ready")continue;
      updated[i].status="scanning";
      setScanQueue([...updated]);

      try{
        const mediaType=updated[i].type==="pdf"?"application/pdf":updated[i].dataUrl.split(";")[0].split(":")[1];
        const base64Data=updated[i].dataUrl.split(",")[1];

        const msgBody={messages:[{role:"user",content:[
              {type:updated[i].type==="pdf"?"document":"image",source:{type:"base64",media_type:mediaType,data:base64Data}},
              {type:"text",text:`You are parsing a vendor invoice for Davis Delivery Service, a trucking company. Extract the following fields as JSON only (no markdown, no backticks, no explanation):

{
  "truckId": "4-digit truck/unit number or null if not found",
  "vendor": "vendor/shop name",
  "date": "YYYY-MM-DD",
  "invoiceNum": "invoice number or null",
  "total": number (the TOTAL amount including tax),
  "category": "one of: ${COST_CATS.join(", ")}",
  "lineItems": [{"desc": "description", "amount": number}],
  "notes": "brief summary of work/parts"
}

CRITICAL RULES FOR FINDING THE TRUCK NUMBER:
- For Peach State Freightliner invoices: The truck number is the LAST 4 DIGITS of the PO# field. Examples: PO# "JK0294" = truck "0294", PO# "FH3889" = truck "3889", PO# "FG2617" = truck "2617", PO# "0920" = truck "0920".
- If PO# is "INVENTORY" or blank, there is no truck — set truckId to null.
- For other vendors: look for Unit #, Truck #, Vehicle #, or any 4-digit reference matching the fleet.

Known truck numbers in this fleet: ${truckIds}

Always match to the closest fleet number. Use the TOTAL line (including tax) for the total amount. For the date, use DATE INVOICE (not DATE SHIPPED). Return ONLY the JSON object.`}
            ]}]};

        const resp=await fetch("/api/scan-invoice",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(msgBody)});

        const data=await resp.json();
        const text=data.content?.find(c=>c.type==="text")?.text||"";
        const clean=text.replace(/```json|```/g,"").trim();
        const parsed=JSON.parse(clean);
        updated[i].status="parsed";
        updated[i].parsed=parsed;
      }catch(err){
        updated[i].status="error";
        updated[i].parsed={error:err.message||"Failed to parse"};
      }
      setScanQueue([...updated]);
    }
    setScanning(false);
  };

  const confirmScannedInvoices=()=>{
    const existingInvNums=new Set(costEntries.filter(c=>c.invoiceNum).map(c=>c.invoiceNum));
    const newEntries=[];
    let skipped=0;
    scanQueue.filter(q=>q.status==="parsed"&&q.parsed&&!q.parsed.error).forEach(q=>{
      const invNum=q.parsed.invoiceNum||null;
      // Skip if invoice number already exists in database
      if(invNum&&existingInvNums.has(invNum)){skipped++;return;}
      // Skip if same invoice number already in this batch
      if(invNum&&newEntries.find(e=>e.invoiceNum===invNum)){skipped++;return;}
      newEntries.push({
        id:Date.now()+Math.random(),
        truckId:q.parsed.truckId||"UNKNOWN",
        vendor:q.parsed.vendor||"Unknown",
        date:q.parsed.date||new Date().toISOString().split("T")[0],
        invoiceNum:invNum,
        total:q.parsed.total||0,
        category:q.parsed.category||"Other",
        lineItems:q.parsed.lineItems||[],
        notes:q.parsed.notes||"",
        sourceFile:q.file,
        addedAt:new Date().toISOString(),
      });
    });
    if(newEntries.length>0){
      const next=[...newEntries,...costEntries];
      saveCosts(next);
    }
    if(skipped>0)alert(`Saved ${newEntries.length} invoices. Skipped ${skipped} duplicate${skipped>1?"s":""} (same invoice number already in database).`);
    setScanQueue([]);
  };

  const addManualCost=(entry)=>{
    const next=[{...entry,id:Date.now()+Math.random(),addedAt:new Date().toISOString()},...costEntries];
    saveCosts(next);
  };

  const deleteCost=(id)=>{
    if(!confirm("Delete this cost entry?"))return;
    saveCosts(costEntries.filter(c=>c.id!==id));
  };

  // Cost analytics
  const costAnalytics=useMemo(()=>{
    const byTruck={};const byCat={};let totalAll=0;
    costEntries.forEach(c=>{
      totalAll+=c.total||0;
      if(!byTruck[c.truckId])byTruck[c.truckId]={total:0,count:0,cats:{}};
      byTruck[c.truckId].total+=(c.total||0);
      byTruck[c.truckId].count++;
      if(!byTruck[c.truckId].cats[c.category])byTruck[c.truckId].cats[c.category]=0;
      byTruck[c.truckId].cats[c.category]+=(c.total||0);
      if(!byCat[c.category])byCat[c.category]=0;
      byCat[c.category]+=(c.total||0);
    });
    const topTrucks=Object.entries(byTruck).sort((a,b)=>b[1].total-a[1].total).slice(0,10);
    return{byTruck,byCat,totalAll,topTrucks,entryCount:costEntries.length};
  },[costEntries]);

  // History: which drivers have driven a specific truck
  const getTruckDriverHistory=useCallback((truckId)=>{
    const driverDays={};
    Object.entries(attendWeeks).forEach(([weekKey,weekAsgn])=>{
      DAYS.forEach(day=>{
        drivers.forEach(d=>{
          const v=weekAsgn[`${d.name}-${day}`]||"";
          if(v===truckId){
            if(!driverDays[d.name])driverDays[d.name]={days:0,weeks:new Set(),role:d.role};
            driverDays[d.name].days++;
            driverDays[d.name].weeks.add(weekKey);
          }
        });
      });
    });
    // Also check current week
    DAYS.forEach(day=>{
      drivers.forEach(d=>{
        const v=asgn[`${d.name}-${day}`]||"";
        if(v===truckId){
          if(!driverDays[d.name])driverDays[d.name]={days:0,weeks:new Set(),role:d.role};
          driverDays[d.name].days++;
          driverDays[d.name].weeks.add(wk);
        }
      });
    });
    return Object.entries(driverDays).map(([name,data])=>({name,days:data.days,weeks:data.weeks.size,role:data.role})).sort((a,b)=>b.days-a.days);
  },[attendWeeks,asgn,drivers,wk]);

  // History: which trucks a specific driver has driven
  const getDriverTruckHistory=useCallback((driverName)=>{
    const truckDays={};
    Object.entries(attendWeeks).forEach(([weekKey,weekAsgn])=>{
      DAYS.forEach(day=>{
        const v=weekAsgn[`${driverName}-${day}`]||"";
        if(v&&!OFF_OPTS.includes(v)&&v!==""){
          if(!truckDays[v])truckDays[v]={days:0,lastSeen:null};
          truckDays[v].days++;
          const m=gM(new Date(weekKey+"T00:00:00"));
          const dt=new Date(m);dt.setDate(dt.getDate()+DAYS.indexOf(day));
          if(!truckDays[v].lastSeen||dt>truckDays[v].lastSeen)truckDays[v].lastSeen=dt;
        }
      });
    });
    // Also check current week
    DAYS.forEach(day=>{
      const v=asgn[`${driverName}-${day}`]||"";
      if(v&&!OFF_OPTS.includes(v)&&v!==""){
        if(!truckDays[v])truckDays[v]={days:0,lastSeen:null};
        truckDays[v].days++;
        const m=gM(weekDate);
        const dt=new Date(m);dt.setDate(dt.getDate()+DAYS.indexOf(day));
        if(!truckDays[v].lastSeen||dt>truckDays[v].lastSeen)truckDays[v].lastSeen=dt;
      }
    });
    return Object.entries(truckDays).map(([tid,data])=>{
      const t=trucks.find(x=>x.id===tid);
      return{truckId:tid,days:data.days,lastSeen:data.lastSeen,type:t?.type,mk:t?.mk,tr:t?.tr};
    }).sort((a,b)=>b.days-a.days);
  },[attendWeeks,asgn,trucks,weekDate]);

  const prevW=()=>{const d=new Date(weekDate);d.setDate(d.getDate()-7);setWeekDate(d);};
  const nextW=()=>{const d=new Date(weekDate);d.setDate(d.getDate()+7);setWeekDate(d);};

  // Same as Yesterday: copy previous day's assignments to a target day
  const sameAsYesterday=(targetDayIdx)=>{
    if(targetDayIdx<0||targetDayIdx>4)return;
    const targetDay=DAYS[targetDayIdx];
    const prevDay=targetDayIdx>0?DAYS[targetDayIdx-1]:null;
    if(!prevDay){alert("No previous day to copy from on Monday. Use previous week's Friday manually.");return;}
    const next={...asgn};
    let copied=0;
    drivers.forEach(d=>{
      const prevVal=asgn[`${d.name}-${prevDay}`]||"";
      if(prevVal){next[`${d.name}-${targetDay}`]=prevVal;copied++;}
    });
    if(copied>0){saveAsgn(next);alert(`Copied ${copied} assignments from ${prevDay} → ${targetDay}`);}
    else alert(`No assignments found for ${prevDay} to copy.`);
  };

  // Computed: assigned trucks per day
  const usedByDay=useMemo(()=>{const m={};DAYS.forEach(day=>{const u=new Set();drivers.forEach(d=>{const v=asgn[`${d.name}-${day}`];if(v&&!OFF_OPTS.includes(v)&&v!=="")u.add(v);});m[day]=u;});return m;},[asgn,drivers]);
  const downByDay=useMemo(()=>{const m={};DAYS.forEach(day=>{const s=new Set();trucks.forEach(t=>{const n=(tStat[`${t.id}-${day}`]||"").toLowerCase();if(n==="oos"||n==="bd"||n.includes("interstate")||n.includes("repair")||n==="4sale"||n.includes("mech"))s.add(t.id);});m[day]=s;});return m;},[tStat,trucks]);

  const getAvail=useCallback((role,day,cur)=>{
    const type=dTT(role);const used=usedByDay[day]||new Set();const down=downByDay[day]||new Set();
    return trucks.filter(t=>{if(type!=="all"&&t.type!==type)return false;if(down.has(t.id))return false;if(used.has(t.id)&&t.id!==cur)return false;return true;});
  },[trucks,usedByDay,downByDay]);

  const gTS=(id,day)=>{
    // 1. Open repair → always show as repair/oos
    const hasOpenRepair=repairs.some(r=>r.truckId===id&&r.status==="open");
    if(hasOpenRepair)return"oos";
    const st=tStat[`${id}-${day}`]||"";
    const stl=st.toLowerCase().trim();
    // 2. Explicit down statuses from truck status board
    if(stl==="oos"||stl==="bd")return"oos";
    if(stl.includes("interstate")||stl.includes("repair")||stl.includes("shop")||stl.includes("mech"))return"repair";
    if(stl.includes("sale"))return"for-sale";
    // 3. Supervisor explicitly marked available
    if(stl==="here"||stl==="avail"||stl==="available"||stl==="ok")return"available";
    // 4. Driver assigned to this truck today
    const hasDriver=drivers.some(d=>{const v=asgn[`${d.name}-${day}`];return v===id;});
    if(hasDriver)return"assigned";
    // 5. Truck status has driver initials or other value → assigned
    if(st&&st!=="")return"assigned";
    // 6. Was used a previous day this week but not today → needs assignment
    const di=DAYS.indexOf(day);
    for(let i=di-1;i>=0;i--){
      const prev=drivers.some(d=>asgn[`${d.name}-${DAYS[i]}`]===id);
      if(prev)return"unassigned";
      const ps=(tStat[`${id}-${DAYS[i]}`]||"").toLowerCase();
      if(ps&&ps!=="here"&&ps!=="avail"&&ps!=="available"&&ps!=="ok"&&ps!=="oos"&&ps!=="bd"&&!ps.includes("sale"))return"unassigned";
    }
    // 7. No history at all → available
    return"available";
  };

  // Dashboard stats
  const stats=useMemo(()=>{
    const dk=DAYS[Math.min(todayDI(),4)];
    let assigned=new Set(),oos=0,repair=0,avail=0;
    trucks.forEach(t=>{
      const hasOpenRepair=repairs.some(r=>r.truckId===t.id&&r.status==="open");
      if(hasOpenRepair){oos++;return;}
      const s=tStat[`${t.id}-${dk}`];if(!s||s===""||s.toLowerCase()==="here")avail++;else if(s.toLowerCase()==="oos"||s.toLowerCase()==="bd")oos++;else if(s.toLowerCase().includes("interstate")||s.toLowerCase().includes("repair"))repair++;else assigned.add(t.id);
    });
    drivers.forEach(d=>{const v=asgn[`${d.name}-${dk}`];if(v&&!OFF_OPTS.includes(v)&&v!=="")assigned.add(v);});
    return{total:trucks.length,straight:trucks.filter(t=>t.type==="straight").length,tractor:trucks.filter(t=>t.type==="tractor").length,auto:trucks.filter(t=>t.tr==="A").length,manual:trucks.filter(t=>t.tr==="M").length,autoBox:trucks.filter(t=>t.tr==="A"&&t.type==="straight").length,autoTr:trucks.filter(t=>t.tr==="A"&&t.type==="tractor").length,manBox:trucks.filter(t=>t.tr==="M"&&t.type==="straight").length,manTr:trucks.filter(t=>t.tr==="M"&&t.type==="tractor").length,assigned:assigned.size,oos,repair,avail,drivers:drivers.length,davis:drivers.filter(d=>d.category==="Davis").length,owner:drivers.filter(d=>d.category==="Owner").length,openRepairs:repairs.filter(r=>r.status==="open").length};
  },[trucks,drivers,asgn,tStat,repairs]);

  const filteredTrucks=useMemo(()=>trucks.filter(t=>{
    if(search&&!t.id.includes(search)&&!t.mk.toLowerCase().includes(search.toLowerCase()))return false;
    if(filterType==="straight"&&t.type!=="straight")return false;if(filterType==="tractor"&&t.type!=="tractor")return false;
    if(filterType==="auto"&&t.tr!=="A")return false;if(filterType==="manual"&&t.tr!=="M")return false;
    if(filterType==="tandem"&&t.ax!=="Tandem")return false;if(filterType==="single"&&t.ax!=="Single")return false;
    return true;
  }),[trucks,search,filterType]);

  const filteredRG=useMemo(()=>{
    if(boardFilter==="all")return RG;if(boardFilter==="box")return RG.filter(g=>g.key.includes("s")&&!g.key.includes("ul")&&!g.key.includes("ls"));
    if(boardFilter==="tractor")return RG.filter(g=>g.key.includes("t")&&!g.key.includes("ls"));if(boardFilter==="shuttle")return RG.filter(g=>g.key==="ul");
    if(boardFilter==="load")return RG.filter(g=>g.key==="ls");if(boardFilter==="owner")return RG.filter(g=>g.key.startsWith("o"));return RG;
  },[boardFilter]);

  // Attendance computation
  const attendance=useMemo(()=>{
    const result={};
    drivers.forEach(d=>{result[d.name]={worked:0,off:0,vac:0,calledOut:0,noShow:0,unassigned:0,totalDays:0};});
    Object.entries(attendWeeks).forEach(([weekKey,weekAsgn])=>{
      DAYS.forEach(day=>{
        drivers.forEach(d=>{
          const v=weekAsgn[`${d.name}-${day}`]||"";
          const a=result[d.name];if(!a)return;
          a.totalDays++;
          if(!v||v==="")a.unassigned++;
          else if(v==="OFF")a.off++;
          else if(v==="VAC")a.vac++;
          else if(v==="CALLED OUT")a.calledOut++;
          else if(v==="NO SHOW")a.noShow++;
          else a.worked++;
        });
      });
    });
    return result;
  },[drivers,attendWeeks]);

  const startEdit=(key,cur)=>{setEditCell(key);setEditVal(cur||"");};
  const commitEdit=(key,type,value)=>{const val=value!==undefined?value:editVal;if(type==="assign")saveAsgn({...asgn,[key]:val});else saveTStat({...tStat,[key]:val});setEditCell(null);setEditVal("");};

  // Find which driver is assigned to a specific truck (check today first, then scan all days)
  const findDriverForTruck=(truckId)=>{
    const ti=todayDI();
    // Check today first
    const todayDriver=drivers.find(d=>{const v=asgn[`${d.name}-${DAYS[Math.min(ti,4)]}`];return v===truckId;});
    if(todayDriver)return todayDriver;
    // Scan all days (most recent first)
    for(let i=4;i>=0;i--){
      if(i===ti)continue;
      const dr=drivers.find(d=>{const v=asgn[`${d.name}-${DAYS[i]}`];return v===truckId;});
      if(dr)return dr;
    }
    return null;
  };
  // Repair functions
  const addRepair=(truckId)=>{
    const rec={id:Date.now(),truckId,reason:repairForm.reason,notes:repairForm.notes,shop:repairForm.shop,dateIn:new Date().toISOString(),estReturn:repairForm.estReturn||null,cost:repairForm.cost?Number(repairForm.cost):0,dateClosed:null,status:"open"};
    const next=[rec,...repairs];
    saveRepairs(next);
    setRepairForm({reason:"Mechanical Repair",notes:"",shop:"",estReturn:"",cost:""});
    setShowRepairForm(null);
  };
  const closeRepair=(id,cost)=>{
    const repair=repairs.find(r=>r.id===id);
    const next=repairs.map(r=>r.id===id?{...r,status:"closed",dateClosed:new Date().toISOString(),cost:cost||r.cost}:r);
    saveRepairs(next);
    // Clear OOS status for today and remaining days this week
    if(repair){
      const ti=Math.min(todayDI(),4);
      const nextStat={...tStat};
      let cleared=false;
      for(let i=ti;i<5;i++){
        const key=`${repair.truckId}-${DAYS[i]}`;
        const cur=(nextStat[key]||"").toLowerCase();
        if(cur==="oos"||cur==="bd"||cur.includes("repair")||cur.includes("interstate")||cur.includes("shop")||cur.includes("mech")){
          nextStat[key]="HERE";
          cleared=true;
        }
      }
      if(cleared)saveTStat(nextStat);
    }
  };

  const addDriver=()=>{if(!newD.name.trim())return;saveDrivers([...drivers,{...newD}]);setNewD({name:"",role:"Davis Straight Driver",category:"Davis"});setShowAddD(false);};
  const addTruck=()=>{if(!newT.id.trim()||trucks.find(t=>t.id===newT.id))return;saveTrucks([...trucks,{...newT}]);setNewT({id:"",mk:"FRTLN",tr:"A",ax:"Single",type:"straight"});setShowAddT(false);};
  const removeTruck=id=>{if(!confirm(`Remove truck ${id}?`))return;saveTrucks(trucks.filter(t=>t.id!==id));};
  const removeDriver=name=>{if(!confirm(`Remove ${name}?`))return;saveDrivers(drivers.filter(d=>d.name!==name));};

  if(!loaded)return <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh",background:"#f5f7fa"}}><div style={{width:36,height:36,border:"3px solid #dde3ea",borderTop:`3px solid ${C.brand}`,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/></div>;

  const dk=DAYS[Math.min(todayDI(),4)];

  return(
    <div style={s.wrap}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} *{box-sizing:border-box}`}</style>
      {/* Header */}
      <div style={s.header}><div style={s.hInner}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <img src={DAVIS_LOGO} alt="Davis Delivery" style={{height:44,width:"auto"}}/>
          <div style={{borderLeft:`2px solid ${C.brand}33`,paddingLeft:10}}><div style={{fontSize:13,fontWeight:700,color:C.dark,lineHeight:1.2}}>Fleet</div><div style={{fontSize:13,fontWeight:700,color:C.dark,lineHeight:1.2}}>Management</div><div style={{fontSize:8,color:"#94a3b8",marginTop:1}}>v{APP_VERSION}</div></div>
        </div>
        <div style={s.tabs}>
          {[["dispatch","Dispatch"],["dashboard","Dashboard"],["board","Weekly Board"],["fleet","Fleet"],["maint","Maintenance"],["costs","Costs"],["drivers","Drivers"],["attend","Attendance"]].map(([k,l])=>
            <button key={k} onClick={()=>setTab(k)} style={tab===k?{...s.tab,...s.tabOn}:s.tab}>{l}{k==="maint"&&stats.openRepairs>0?<span style={s.badge}>{stats.openRepairs}</span>:null}</button>
          )}
        </div>
      </div></div>

      <div style={s.body}>

        {/* ══ DAILY DISPATCH ══ */}
        {tab==="dispatch"&&(()=>{
          const di=Math.min(todayDI(),4);
          const today=DAYS[di];
          const mon=gM(weekDate);
          const todayDate=new Date(mon);todayDate.setDate(todayDate.getDate()+di);
          const dayFull=["Monday","Tuesday","Wednesday","Thursday","Friday"][di];

          // Categorize drivers
          const working=[];const off=[];const calledOut=[];const noTruck=[];
          drivers.filter(d=>d.category==="Davis").forEach(d=>{
            const v=asgn[`${d.name}-${today}`]||"";
            if(!v||v==="")noTruck.push(d);
            else if(v==="OFF"||v==="VAC")off.push({...d,status:v});
            else if(v==="CALLED OUT"||v==="NO SHOW")calledOut.push({...d,status:v});
            else working.push({...d,truck:v,truckInfo:trucks.find(t=>t.id===v)});
          });
          const ownerWorking=[];const ownerOff=[];
          drivers.filter(d=>d.category==="Owner").forEach(d=>{
            const v=asgn[`${d.name}-${today}`]||"";
            if(v&&!OFF_OPTS.includes(v))ownerWorking.push({...d,truck:v,truckInfo:trucks.find(t=>t.id===v)});
            else if(OFF_OPTS.includes(v))ownerOff.push({...d,status:v});
          });

          // Truck status
          const trucksInUse=new Set();
          working.concat(ownerWorking).forEach(d=>trucksInUse.add(d.truck));
          const trucksDown=trucks.filter(t=>{const st=(tStat[`${t.id}-${today}`]||"").toLowerCase();return st==="oos"||st==="bd"||st.includes("interstate")||st.includes("repair")||st.includes("mech");});
          const trucksAvail=trucks.filter(t=>!trucksInUse.has(t.id)&&!trucksDown.find(x=>x.id===t.id));
          const openRep=repairs.filter(r=>r.status==="open");

          return <div>
            {/* Date header */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div>
                <div style={{fontSize:22,fontWeight:800,color:C.dark}}>{dayFull}</div>
                <div style={{fontSize:13,color:"#6b7785"}}>{todayDate.toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>sameAsYesterday(di)} style={s.sayBtn}>📋 Same as Yesterday</button>
              </div>
            </div>

            {/* Quick stats */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(5, 1fr)",gap:8,marginBottom:16}}>
              <div style={{background:C.green+"14",borderRadius:8,padding:"10px 8px",textAlign:"center",border:`1px solid ${C.green}33`}}>
                <div style={{fontSize:22,fontWeight:800,color:C.green}}>{working.length}</div>
                <div style={{fontSize:10,color:"#6b7785",fontWeight:600}}>Working</div>
              </div>
              <div style={{background:C.accent+"14",borderRadius:8,padding:"10px 8px",textAlign:"center",border:`1px solid ${C.accent}33`}}>
                <div style={{fontSize:22,fontWeight:800,color:C.accent}}>{off.length}</div>
                <div style={{fontSize:10,color:"#6b7785",fontWeight:600}}>Off/Vac</div>
              </div>
              <div style={{background:C.red+"14",borderRadius:8,padding:"10px 8px",textAlign:"center",border:`1px solid ${C.red}33`}}>
                <div style={{fontSize:22,fontWeight:800,color:C.red}}>{calledOut.length}</div>
                <div style={{fontSize:10,color:"#6b7785",fontWeight:600}}>Called Out</div>
              </div>
              <div style={{background:C.cyan+"14",borderRadius:8,padding:"10px 8px",textAlign:"center",border:`1px solid ${C.cyan}33`}}>
                <div style={{fontSize:22,fontWeight:800,color:C.cyan}}>{trucksAvail.length}</div>
                <div style={{fontSize:10,color:"#6b7785",fontWeight:600}}>Trucks Free</div>
              </div>
              <div style={{background:C.red+"14",borderRadius:8,padding:"10px 8px",textAlign:"center",border:`1px solid ${C.red}33`}}>
                <div style={{fontSize:22,fontWeight:800,color:C.red}}>{trucksDown.length}</div>
                <div style={{fontSize:10,color:"#6b7785",fontWeight:600}}>Down</div>
              </div>
            </div>

            {/* Needs attention */}
            {(noTruck.length>0||calledOut.length>0||openRep.length>0)&&<div style={{background:"#fef2f2",border:`1px solid ${C.red}22`,borderRadius:8,padding:12,marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:700,color:C.red,marginBottom:6}}>⚠ Needs Attention</div>
              {noTruck.length>0&&<div style={{fontSize:12,color:"#334155",marginBottom:4}}><span style={{fontWeight:700}}>{noTruck.length} driver{noTruck.length>1?"s":""}</span> not assigned a truck: {noTruck.slice(0,5).map(d=>d.name.split(" ")[0]).join(", ")}{noTruck.length>5?"...":""}</div>}
              {calledOut.length>0&&<div style={{fontSize:12,color:C.red,marginBottom:4}}>{calledOut.map(d=><span key={d.name} style={{marginRight:8}}><span style={{fontWeight:700}}>{d.name.split(" ")[0]}</span> — {d.status}</span>)}</div>}
              {openRep.length>0&&<div style={{fontSize:12,color:C.yellow}}>{openRep.length} truck{openRep.length>1?"s":""} in repair: {openRep.map(r=>`#${r.truckId}`).join(", ")}</div>}
            </div>}

            {/* Working drivers */}
            <div style={{fontSize:13,fontWeight:700,color:C.green,marginBottom:6}}>ON THE ROAD — {working.length} Davis + {ownerWorking.length} Owner</div>
            <div style={s.tWrap}><table style={{...s.table,fontSize:12}}><thead><tr>
              <th style={s.th}>Driver</th><th style={s.th}>Truck</th><th style={s.th}>Type</th><th style={s.th}>Trans</th>
            </tr></thead><tbody>
              {working.map(d=> <tr key={d.name} style={s.tr}>
                <td style={{...s.ltd,fontWeight:600,color:C.brand,cursor:"pointer",textDecoration:"underline"}} onClick={()=>setDriverReport(d.name)}>{d.name}</td>
                <td style={{...s.ltd,fontFamily:"monospace",fontWeight:700,cursor:"pointer",color:C.brand,textDecoration:"underline"}} onClick={()=>setHistoryTruck(d.truck)}>#{d.truck}</td>
                <td style={s.ltd}>{d.truckInfo?d.truckInfo.type==="straight"?d.truckInfo.mk:"Tractor":"—"}</td>
                <td style={s.ltd}>{d.truckInfo?<span style={{fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:3,background:d.truckInfo.tr==="A"?"#27ae6018":"#e6a81718",color:d.truckInfo.tr==="A"?C.green:C.accent}}>{d.truckInfo.tr==="A"?"A":"M"}</span>:"—"}</td>
              </tr>)}
              {ownerWorking.length>0&&<tr><td colSpan={4} style={s.roleDiv}>Owner Operators</td></tr>}
              {ownerWorking.map(d=> <tr key={d.name} style={s.tr}>
                <td style={{...s.ltd,fontWeight:600,color:C.brand,cursor:"pointer",textDecoration:"underline"}} onClick={()=>setDriverReport(d.name)}>{d.name}</td>
                <td style={{...s.ltd,fontFamily:"monospace",fontWeight:700,cursor:"pointer",color:C.brand,textDecoration:"underline"}} onClick={()=>setHistoryTruck(d.truck)}>#{d.truck}</td>
                <td style={s.ltd}>{d.truckInfo?d.truckInfo.type==="straight"?d.truckInfo.mk:"Tractor":"—"}</td>
                <td style={s.ltd}>{d.truckInfo?<span style={{fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:3,background:d.truckInfo.tr==="A"?"#27ae6018":"#e6a81718",color:d.truckInfo.tr==="A"?C.green:C.accent}}>{d.truckInfo.tr==="A"?"A":"M"}</span>:"—"}</td>
              </tr>)}
            </tbody></table></div>

            {/* Off / Called Out */}
            {(off.length>0||calledOut.length>0)&&<div style={{marginTop:16}}>
              <div style={{fontSize:13,fontWeight:700,color:C.accent,marginBottom:6}}>NOT WORKING — {off.length+calledOut.length}</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {calledOut.map(d=><span key={d.name} style={{fontSize:11,padding:"4px 10px",background:C.red+"14",color:C.red,borderRadius:6,fontWeight:600,border:`1px solid ${C.red}33`}}>{d.name.split(" ")[0]} — {d.status}</span>)}
                {off.map(d=><span key={d.name} style={{fontSize:11,padding:"4px 10px",background:"#f8fafc",color:"#6b7785",borderRadius:6,fontWeight:600,border:"1px solid #e2e8f0"}}>{d.name.split(" ")[0]} — {d.status}</span>)}
              </div>
            </div>}

            {/* No truck assigned */}
            {noTruck.length>0&&<div style={{marginTop:16}}>
              <div style={{fontSize:13,fontWeight:700,color:"#6b7785",marginBottom:6}}>NEEDS TRUCK — {noTruck.length}</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {noTruck.map(d=><span key={d.name} style={{fontSize:11,padding:"4px 10px",background:"#fff",color:"#334155",borderRadius:6,fontWeight:600,border:"1px solid #e2e8f0"}}>{d.name.split(" ")[0]} <span style={{color:"#94a3b8"}}>({d.role.replace("Davis ","").replace("Owner ","")})</span></span>)}
              </div>
            </div>}

            {/* Available trucks */}
            {trucksAvail.length>0&&<div style={{marginTop:16}}>
              <div style={{fontSize:13,fontWeight:700,color:C.cyan,marginBottom:6}}>AVAILABLE TRUCKS — {trucksAvail.length}</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(120px, 1fr))",gap:6}}>
                {trucksAvail.map(t=><div key={t.id} style={{padding:"8px 10px",background:"#fff",borderRadius:6,border:"1px solid #e2e8f0",cursor:"pointer"}} onClick={()=>setHistoryTruck(t.id)}>
                  <div style={{fontFamily:"monospace",fontWeight:700,fontSize:13,color:C.brand}}>#{t.id}</div>
                  <div style={{fontSize:10,color:"#6b7785"}}>{t.type==="straight"?t.mk:"Tractor"} · {t.tr==="A"?"A":"M"} · {t.ax==="Tandem"?"T":"S"}</div>
                </div>)}
              </div>
            </div>}

            {/* Down trucks */}
            {trucksDown.length>0&&<div style={{marginTop:16}}>
              <div style={{fontSize:13,fontWeight:700,color:C.red,marginBottom:6}}>DOWN / OOS — {trucksDown.length}</div>
              {trucksDown.map(t=>{const r=repairs.find(x=>x.truckId===t.id&&x.status==="open");
                return <div key={t.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 10px",background:"#fef2f2",borderRadius:6,border:`1px solid ${C.red}22`,marginBottom:4,cursor:"pointer"}} onClick={()=>setHistoryTruck(t.id)}>
                  <div><span style={{fontFamily:"monospace",fontWeight:700,color:C.red}}>#{t.id}</span><span style={{fontSize:11,color:"#6b7785",marginLeft:8}}>{t.type==="straight"?t.mk:"Tractor"}</span></div>
                  {r&&<span style={{fontSize:10,color:C.red,fontWeight:600}}>{r.reason}{r.shop&&` · ${r.shop}`}</span>}
                </div>;
              })}
            </div>}
          </div>;
        })()}

        {/* ══ DASHBOARD ══ */}
        {tab==="dashboard"&&<div>
          <div style={s.statGrid}>
            <Stat l="Total Fleet" v={stats.total} sub={`${stats.straight} Straight · ${stats.tractor} Tractor`} c={C.brand}/>
            <Stat l="Assigned Today" v={stats.assigned} c={C.green}/>
            <Stat l="Available" v={stats.avail} c={C.cyan}/>
            <Stat l="OOS / Down" v={stats.oos} c={C.red}/>
            <Stat l="Open Repairs" v={stats.openRepairs} c={C.yellow}/>
            <Stat l="Total Drivers" v={stats.drivers} sub={`${stats.davis} Davis · ${stats.owner} Owner Op`} c={C.purple}/>
            <Stat l="Automatic" v={stats.auto} sub={`${stats.autoBox} Box · ${stats.autoTr} Tractor`} c={C.green}/>
            <Stat l="Manual" v={stats.manual} sub={`${stats.manBox} Box · ${stats.manTr} Tractor`} c={C.accent}/>
          </div>
          <div style={{marginTop:20}}><div style={s.secT}>Fleet by Type</div>
            <div style={s.bGrid}>{[
              {l:"FRTLN Straight",ct:trucks.filter(t=>t.type==="straight"&&t.mk==="FRTLN").length},
              {l:"HINO Straight",ct:trucks.filter(t=>t.type==="straight"&&t.mk==="HINO").length},
              {l:"INTL Straight",ct:trucks.filter(t=>t.type==="straight"&&t.mk==="INTL").length},
              {l:"Ford Straight",ct:trucks.filter(t=>t.type==="straight"&&t.mk==="Ford").length},
              {l:"Tractor Single",ct:trucks.filter(t=>t.type==="tractor"&&t.ax==="Single").length},
              {l:"Tractor Tandem",ct:trucks.filter(t=>t.type==="tractor"&&t.ax==="Tandem").length},
            ].map(x=><div key={x.l} style={s.bItem}><span style={{fontSize:12,color:"#6b7785"}}>{x.l}</span><span style={{fontSize:14,fontWeight:700,color:"#1e293b"}}>{x.ct}</span></div>)}</div>
          </div>
        </div>}

        {/* ══ WEEKLY BOARD ══ */}
        {tab==="board"&&<div>
          <div style={s.weekNav}>
            <button style={s.wBtn} onClick={prevW}>← Prev</button>
            <button style={s.wBtnA} onClick={()=>setWeekDate(new Date())}>This Week</button>
            <span style={s.wLbl}>{fWL(weekDate)}</span>
            <button style={s.wBtn} onClick={nextW}>Next →</button>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,flexWrap:"wrap"}}>
            <span style={{fontSize:12,fontWeight:600,color:"#6b7785"}}>Show:</span>
            <select style={s.bSel} value={boardFilter} onChange={e=>setBoardFilter(e.target.value)}>
              {BF.map(f=><option key={f.k} value={f.k}>{f.l}</option>)}
            </select>
            <button onClick={()=>document.getElementById("truck-status-board")?.scrollIntoView({behavior:"smooth"})} style={s.jumpBtn}>🚛 Truck Status ↓</button>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{...s.secT,marginBottom:0}}>Driver → Truck Assignments</div>
            <button onClick={()=>sameAsYesterday(todayDI())} style={s.sayBtn}>📋 Same as Yesterday</button>
          </div>
          <div style={s.tWrap}><table style={s.table}><thead><tr><th style={{...s.th,...s.thS}}>Driver</th>{DAYS.map((d,i)=><th key={d} style={s.th}>{d}{i>0&&<button onClick={()=>sameAsYesterday(i)} title={`Copy ${DAYS[i-1]} → ${d}`} style={s.sayMini}>←</button>}</th>)}</tr></thead><tbody>
            {filteredRG.map(g=>{
              const gd=drivers.filter(g.f);if(!gd.length)return null;
              return[
                <tr key={`h-${g.key}`}><td colSpan={6} style={{...s.roleDiv,color:g.color}}>{g.label} ({gd.length})</td></tr>,
                ...gd.map(dr=><tr key={dr.name} style={s.tr}><td style={{...s.td,...s.tdN,cursor:"pointer",color:C.brand,textDecoration:"underline",textDecorationColor:C.brand+"44"}} onClick={()=>setDriverReport(dr.name)}>{dr.name}</td>
                  {DAYS.map(day=>{const ck=`${dr.name}-${day}`;const val=asgn[ck]||"";const isE=editCell===ck;const isOff=OFF_OPTS.includes(val);const ti=val&&!isOff?trucks.find(t=>t.id===val):null;
                    if(isE){const av=getAvail(dr.role,day,val);return <td key={day} style={{...s.td,...s.eCell}}><div style={s.ePanel}>
                      <div style={s.offRow}>{OFF_OPTS.map(o=><button key={o} onClick={()=>commitEdit(ck,"assign",o)} style={val===o?{...s.oBtn,...s.oBtnOn}:s.oBtn}>{o}</button>)}{val&&<button onClick={()=>commitEdit(ck,"assign","")} style={s.clrBtn}>✕</button>}</div>
                      <input style={s.cInp} value={editVal} placeholder="Truck #" onChange={e=>setEditVal(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&editVal.trim())commitEdit(ck,"assign");if(e.key==="Escape")setEditCell(null);}} autoFocus/>
                      {editVal.trim()&&<button onClick={()=>commitEdit(ck,"assign")} style={s.goBtn}>GO</button>}
                      <select style={s.tSel} value="" onChange={e=>{if(e.target.value)commitEdit(ck,"assign",e.target.value);}}>
                        <option value="">— Pick {dTT(dr.role)==="tractor"?"Tractor":dTT(dr.role)==="straight"?"Box Truck":"Truck"} —</option>
                        {av.map(t=><option key={t.id} value={t.id}>{t.id} · {t.type==="straight"?t.mk:"Tractor"} · {t.tr==="A"?"Auto":"Man"} · {t.ax==="Tandem"?"Tndm":"Sngl"}</option>)}
                      </select>
                      <button onClick={()=>setEditCell(null)} style={s.doneBtn}>Done</button>
                    </div></td>;}
                    return <td key={day} style={s.td} onClick={()=>startEdit(ck,val)}>{val?<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1}}>
                      <span style={{fontWeight:700,fontFamily:isOff?"inherit":"monospace",fontSize:isOff?9:12,color:isOff?C.accent:"#1e293b"}}>{val}</span>
                      {ti&&<span style={{fontSize:8,color:"#94a3b8"}}>{ti.mk} {ti.tr}</span>}
                    </div>:<span style={{color:"#cbd5e1"}}>—</span>}</td>;
                  })}
                </tr>)
              ];
            })}
          </tbody></table></div>

          {/* Truck Status Board */}
          <div style={{marginTop:24}} id="truck-status-board">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{...s.secT,marginBottom:0}}>Truck Status Board</div>
              <button onClick={()=>window.scrollTo({top:0,behavior:"smooth"})} style={s.jumpBtn}>👤 Driver Assignments ↑</button>
            </div>
            <div style={{display:"flex",gap:12,marginBottom:8,flexWrap:"wrap"}}>{Object.entries(SL).map(([k,v])=><span key={k} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:"#6b7785"}}><span style={{width:8,height:8,borderRadius:4,background:SC[k]}}/>{v}</span>)}</div>
            <div style={s.tWrap}><table style={s.table}><thead><tr><th style={s.th}>Truck #</th><th style={s.th}>Type</th><th style={s.th}>Tr</th><th style={s.th}>Ax</th>{DAYS.map(d=><th key={d} style={s.th}>{d}</th>)}</tr></thead><tbody>
              <tr><td colSpan={9} style={s.secDiv}>Straight Trucks</td></tr>
              {trucks.filter(t=>t.type==="straight").map(t=><TSRow key={t.id} t={t} tStat={tStat} ec={editCell} ev={editVal} sev={setEditVal} se={startEdit} ce={commitEdit} gs={gTS} onOOS={()=>{setShowRepairForm(t.id);setRepairForm({reason:"Mechanical Repair",notes:"",shop:"",estReturn:"",cost:""});}}/>)}
              <tr><td colSpan={9} style={s.secDiv}>Tractors</td></tr>
              {trucks.filter(t=>t.type==="tractor").map(t=><TSRow key={t.id} t={t} tStat={tStat} ec={editCell} ev={editVal} sev={setEditVal} se={startEdit} ce={commitEdit} gs={gTS} onOOS={()=>{setShowRepairForm(t.id);setRepairForm({reason:"Mechanical Repair",notes:"",shop:"",estReturn:"",cost:""});}}/>)}
            </tbody></table></div>
          </div>
        </div>}

        {/* ══ FLEET ══ */}
        {tab==="fleet"&&<div>
          <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
            <input style={s.sInp} placeholder="Search truck # or make..." value={search} onChange={e=>setSearch(e.target.value)}/>
            <select style={s.fSel} value={filterType} onChange={e=>setFilterType(e.target.value)}>
              <option value="all">All Types</option><option value="straight">Straight</option><option value="tractor">Tractors</option>
              <option value="auto">Auto</option><option value="manual">Manual</option><option value="tandem">Tandem</option><option value="single">Single</option>
            </select>
            <div style={s.vTog}><button onClick={()=>setFleetView("tile")} style={fleetView==="tile"?{...s.vBtn,...s.vBtnOn}:s.vBtn}>▦</button><button onClick={()=>setFleetView("list")} style={fleetView==="list"?{...s.vBtn,...s.vBtnOn}:s.vBtn}>☰</button></div>
            <button style={s.addBtn} onClick={()=>setShowAddT(true)}>+ Add</button>
          </div>
          {showAddT&&<div style={s.addForm}>
            <input style={s.fInp} placeholder="Truck #" value={newT.id} onChange={e=>setNewT({...newT,id:e.target.value})}/>
            <div style={{display:"flex",gap:6}}>
              <select style={s.fInp} value={newT.type} onChange={e=>setNewT({...newT,type:e.target.value})}><option value="straight">Straight</option><option value="tractor">Tractor</option></select>
              <select style={s.fInp} value={newT.mk} onChange={e=>setNewT({...newT,mk:e.target.value})}><option value="FRTLN">FRTLN</option><option value="HINO">HINO</option><option value="INTL">INTL</option><option value="Ford">Ford</option><option value="Tractor">Tractor</option></select>
            </div>
            <div style={{display:"flex",gap:6}}>
              <select style={s.fInp} value={newT.tr} onChange={e=>setNewT({...newT,tr:e.target.value})}><option value="A">Auto</option><option value="M">Manual</option></select>
              <select style={s.fInp} value={newT.ax} onChange={e=>setNewT({...newT,ax:e.target.value})}><option value="Single">Single</option><option value="Tandem">Tandem</option></select>
            </div>
            <div style={{display:"flex",gap:8}}><button style={s.saveBtn} onClick={addTruck}>Save</button><button style={s.canBtn} onClick={()=>setShowAddT(false)}>Cancel</button></div>
          </div>}
          {fleetView==="tile"&&<div style={s.cardGrid}>{filteredTrucks.map(t=>{
            const st2=gTS(t.id,dk);const dr=findDriverForTruck(t.id);const openR=repairs.filter(r=>r.truckId===t.id&&r.status==="open");const totalR=repairs.filter(r=>r.truckId===t.id).length;
            return <div key={t.id} style={s.tCard}><div style={s.cHdr}><span style={{...s.tNum,cursor:"pointer",textDecoration:"underline",textDecorationColor:C.brand+"44"}} onClick={()=>setHistoryTruck(t.id)}>#{t.id}</span><span style={{...s.sBdg,background:SC[st2]+"18",color:SC[st2],borderColor:SC[st2]}}>{SL[st2]}</span></div>
              <div style={s.cBody}><Row l="Type" v={t.type==="straight"?"Box Truck":"Tractor"}/><Row l="Make" v={t.mk}/>
                <Row l="Trans" v={<span style={{fontSize:9,fontWeight:700,padding:"1px 6px",borderRadius:3,background:t.tr==="A"?"#27ae6018":"#e6a81718",color:t.tr==="A"?C.green:C.accent}}>{t.tr==="A"?"AUTO":"MANUAL"}</span>}/>
                <Row l="Axle" v={t.ax}/>{dr&&<Row l="Driver" v={<span style={{color:C.brand,cursor:"pointer",textDecoration:"underline"}} onClick={()=>setDriverReport(dr.name)}>{dr.name}</span>}/>}
                {openR.length>0&&<Row l="Repairs" v={<span style={{color:C.red,fontWeight:700}}>{openR.length} open</span>}/>}
                {totalR>0&&<div style={{marginTop:4}}><button onClick={()=>setHistoryTruck(t.id)} style={{fontSize:10,color:C.brand,background:"none",border:"none",cursor:"pointer",textDecoration:"underline",padding:0}}>View history ({totalR})</button></div>}
              </div>
              <button style={s.remBtn} onClick={()=>removeTruck(t.id)}>Remove</button></div>;
          })}</div>}
          {fleetView==="list"&&<div style={s.tWrap}><table style={{...s.table,fontSize:12}}><thead><tr>{["Truck #","Type","Make","Trans","Axle","Status","Driver","Repairs",""].map(h=><th key={h} style={{...s.th,whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead><tbody>
            {filteredTrucks.map(t=>{const st2=gTS(t.id,dk);const dr=findDriverForTruck(t.id);const openR=repairs.filter(r=>r.truckId===t.id&&r.status==="open").length;
              return <tr key={t.id} style={s.tr}><td style={{...s.ltd,fontWeight:700,fontFamily:"monospace",color:C.brand,cursor:"pointer",textDecoration:"underline"}} onClick={()=>setHistoryTruck(t.id)}>{t.id}</td><td style={s.ltd}>{t.type==="straight"?"Box":"Tractor"}</td><td style={s.ltd}>{t.mk}</td>
                <td style={s.ltd}><span style={{fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:3,background:t.tr==="A"?"#27ae6018":"#e6a81718",color:t.tr==="A"?C.green:C.accent}}>{t.tr==="A"?"A":"M"}</span></td>
                <td style={s.ltd}>{t.ax}</td><td style={s.ltd}><span style={{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:4,background:SC[st2]+"18",color:SC[st2]}}>{SL[st2]}</span></td>
                <td style={{...s.ltd,color:C.brand,cursor:dr?"pointer":"default",textDecoration:dr?"underline":"none"}} onClick={()=>{if(dr)setDriverReport(dr.name);}}>{dr?dr.name:"—"}</td>
                <td style={s.ltd}>{openR>0?<span style={{color:C.red,fontWeight:700}}>{openR}</span>:"—"}</td>
                <td style={s.ltd}><button style={s.xBtn} onClick={()=>removeTruck(t.id)}>×</button></td></tr>;
            })}</tbody></table></div>}
        </div>}

        {/* ══ MAINTENANCE ══ */}
        {tab==="maint"&&<div>
          <div style={s.secT}>Open Repairs ({repairs.filter(r=>r.status==="open").length})</div>
          {repairs.filter(r=>r.status==="open").length===0&&<div style={s.emptyMsg}>No open repairs. All trucks operational.</div>}
          {repairs.filter(r=>r.status==="open").map(r=>{
            const t=trucks.find(x=>x.id===r.truckId);
            return <div key={r.id} style={s.repairCard}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div><span style={{fontFamily:"monospace",fontWeight:700,fontSize:16,color:C.brand,cursor:"pointer",textDecoration:"underline"}} onClick={()=>setHistoryTruck(r.truckId)}>#{r.truckId}</span>{t&&<span style={{fontSize:11,color:"#6b7785",marginLeft:8}}>{t.type==="straight"?t.mk:"Tractor"} · {t.tr==="A"?"Auto":"Man"}</span>}</div>
                <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:4,background:C.red+"18",color:C.red}}>{r.reason}</span>
              </div>
              {r.notes&&<div style={{fontSize:12,color:"#334155",marginTop:6}}>{r.notes}</div>}
              <div style={{display:"flex",gap:16,marginTop:6,fontSize:11,color:"#6b7785"}}>
                {r.shop&&<span>Shop: {r.shop}</span>}
                <span>In: {dateStr(r.dateIn)}</span>
                {r.estReturn&&<span>Est: {dateStr(r.estReturn)}</span>}
                {r.cost>0&&<span>Cost: ${r.cost.toLocaleString()}</span>}
              </div>
              <div style={{marginTop:8,display:"flex",gap:8}}>
                <button onClick={()=>{const cost=prompt("Final cost (or leave blank):",r.cost||"");closeRepair(r.id,cost?Number(cost):r.cost);}} style={s.closeRepBtn}>Repair Completed</button>
              </div>
            </div>;
          })}

          <div style={{marginTop:24,...s.secT}}>Log New Repair</div>
          <div style={s.addForm}>
            <select style={s.fInp} value={showRepairForm||""} onChange={e=>setShowRepairForm(e.target.value||null)}>
              <option value="">Select Truck...</option>
              {trucks.map(t=><option key={t.id} value={t.id}>#{t.id} — {t.type==="straight"?t.mk:"Tractor"}</option>)}
            </select>
            {showRepairForm&&<>
              <select style={s.fInp} value={repairForm.reason} onChange={e=>setRepairForm({...repairForm,reason:e.target.value})}>
                {OOS_REASONS.map(r=><option key={r} value={r}>{r}</option>)}
              </select>
              <input style={s.fInp} placeholder="Notes (what's wrong)" value={repairForm.notes} onChange={e=>setRepairForm({...repairForm,notes:e.target.value})}/>
              <input style={s.fInp} placeholder="Shop / Location" value={repairForm.shop} onChange={e=>setRepairForm({...repairForm,shop:e.target.value})}/>
              <div style={{display:"flex",gap:6}}>
                <input style={s.fInp} type="date" placeholder="Est Return" value={repairForm.estReturn} onChange={e=>setRepairForm({...repairForm,estReturn:e.target.value})}/>
                <input style={s.fInp} type="number" placeholder="Cost $" value={repairForm.cost} onChange={e=>setRepairForm({...repairForm,cost:e.target.value})}/>
              </div>
              <button style={s.saveBtn} onClick={()=>addRepair(showRepairForm)}>Log Repair</button>
            </>}
          </div>

          <div style={{marginTop:24,...s.secT}}>Repair History</div>
          <input style={{...s.sInp,marginBottom:12}} placeholder="Filter by truck #..." value={search} onChange={e=>setSearch(e.target.value)}/>
          {repairs.filter(r=>!search||r.truckId.includes(search)).sort((a,b)=>b.id-a.id).map(r=>{
            const t=trucks.find(x=>x.id===r.truckId);
            return <div key={r.id} style={{...s.repairCard,opacity:r.status==="closed"?0.7:1,borderLeftColor:r.status==="open"?C.red:C.green}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><span style={{fontFamily:"monospace",fontWeight:700,color:C.brand,cursor:"pointer",textDecoration:"underline"}} onClick={()=>setHistoryTruck(r.truckId)}>#{r.truckId}</span><span style={{fontSize:11,color:"#6b7785",marginLeft:8}}>{r.reason}</span></div>
                <span style={{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:3,background:r.status==="open"?C.red+"18":C.green+"18",color:r.status==="open"?C.red:C.green}}>{r.status==="open"?"OPEN":"CLOSED"}</span>
              </div>
              {r.notes&&<div style={{fontSize:11,color:"#6b7785",marginTop:4}}>{r.notes}</div>}
              <div style={{fontSize:10,color:"#94a3b8",marginTop:4}}>
                In: {dateStr(r.dateIn)}{r.dateClosed&&` · Resolved: ${dateStr(r.dateClosed)}`}{r.cost>0&&` · $${r.cost.toLocaleString()}`}{r.shop&&` · ${r.shop}`}
              </div>
            </div>;
          })}
        </div>}

        {/* ══ DRIVERS ══ */}
        {tab==="drivers"&&<div>
          <div style={{display:"flex",gap:8,marginBottom:12}}><input style={s.sInp} placeholder="Search driver..." value={search} onChange={e=>setSearch(e.target.value)}/><button style={s.addBtn} onClick={()=>setShowAddD(true)}>+ Add</button></div>
          {showAddD&&<div style={s.addForm}>
            <input style={s.fInp} placeholder="Driver Name" value={newD.name} onChange={e=>setNewD({...newD,name:e.target.value})}/>
            <select style={s.fInp} value={newD.role} onChange={e=>setNewD({...newD,role:e.target.value,category:e.target.value.includes("Owner")?"Owner":"Davis"})}>
              <option value="Davis Straight Driver">Davis Straight Driver</option><option value="Davis Tractor Driver">Davis Tractor Driver</option>
              <option value="Uline Shuttle Driver">Uline Shuttle</option><option value="Load/Shift Driver">Load/Shift</option>
              <option value="Owner Straight Driver">Owner Straight</option><option value="Owner Tractor Driver">Owner Tractor</option>
            </select>
            <div style={{display:"flex",gap:8}}><button style={s.saveBtn} onClick={addDriver}>Save</button><button style={s.canBtn} onClick={()=>setShowAddD(false)}>Cancel</button></div>
          </div>}
          {RG.map(g=>{const fl=drivers.filter(d=>g.f(d)&&(!search||d.name.toLowerCase().includes(search.toLowerCase())));if(!fl.length)return null;
            return <div key={g.key}><div style={{...s.dCat,color:g.color}}>{g.label} ({fl.length})</div>
              {fl.map(d=>{const tv=asgn[`${d.name}-${dk}`]||"";
                return <div key={d.name} style={s.dRow}><div><div style={{...s.dNm,cursor:"pointer",color:C.brand,textDecoration:"underline",textDecorationColor:C.brand+"44"}} onClick={()=>setDriverReport(d.name)}>{d.name}</div><div style={s.dRl}>{d.role}</div></div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    {tv&&!OFF_OPTS.includes(tv)?<span style={s.tBdg}>#{tv}</span>:OFF_OPTS.includes(tv)?<span style={s.oBdg}>{tv}</span>:null}
                    <button style={s.xBtn} onClick={()=>removeDriver(d.name)}>×</button>
                  </div></div>;
              })}</div>;
          })}
        </div>}

        {/* ══ ATTENDANCE ══ */}
        {tab==="attend"&&<div>
          <div style={s.secT}>Driver Attendance — Last {Object.keys(attendWeeks).length} Weeks</div>
          <div style={{fontSize:11,color:"#6b7785",marginBottom:12}}>Based on weekly assignment data. Showing days worked, off, vacation, call-outs, and no-shows.</div>
          <div style={s.tWrap}><table style={{...s.table,fontSize:11}}><thead><tr>
            <th style={{...s.th,minWidth:120}}>Driver</th>
            <th style={s.th}>Worked</th><th style={s.th}>Off</th><th style={s.th}>Vac</th>
            <th style={{...s.th,color:C.red}}>Called Out</th><th style={{...s.th,color:C.red}}>No Show</th>
            <th style={s.th}>Unassigned</th><th style={s.th}>Rate</th>
          </tr></thead><tbody>
            {RG.map(g=>{
              const gd=drivers.filter(g.f);if(!gd.length)return null;
              return[
                <tr key={`ah-${g.key}`}><td colSpan={8} style={{...s.roleDiv,color:g.color}}>{g.label}</td></tr>,
                ...gd.map(d=>{
                  const a=attendance[d.name]||{worked:0,off:0,vac:0,calledOut:0,noShow:0,unassigned:0,totalDays:0};
                  const scheduledDays=a.totalDays-a.vac;
                  const rate=scheduledDays>0?Math.round((a.worked/scheduledDays)*100):0;
                  const isBad=a.calledOut>=3||a.noShow>=1||rate<70;
                  return <tr key={d.name} style={{...s.tr,background:isBad?"#fef2f2":"transparent"}}>
                    <td style={{...s.td,fontWeight:600,color:"#1e293b"}}>{d.name}</td>
                    <td style={{...s.td,color:C.green,fontWeight:700}}>{a.worked}</td>
                    <td style={s.td}>{a.off}</td><td style={s.td}>{a.vac}</td>
                    <td style={{...s.td,color:a.calledOut>=3?C.red:"inherit",fontWeight:a.calledOut>=3?700:400}}>{a.calledOut}</td>
                    <td style={{...s.td,color:a.noShow>=1?C.red:"inherit",fontWeight:a.noShow>=1?700:400}}>{a.noShow}</td>
                    <td style={s.td}>{a.unassigned}</td>
                    <td style={{...s.td,fontWeight:700,color:rate>=90?C.green:rate>=70?C.accent:C.red}}>{rate}%</td>
                  </tr>;
                })
              ];
            })}
          </tbody></table></div>
        </div>}

        {/* ══ COSTS / INVOICE SCANNER ══ */}
        {tab==="costs"&&<div>
          {/* Scanner section */}
          {/* Gmail Vendors */}
          <div style={{background:"#fff",borderRadius:8,padding:14,marginBottom:16,border:"1px solid #e2e8f0"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{fontSize:14,fontWeight:700,color:"#1e293b"}}>📧 Known Invoice Vendors</div>
              <button onClick={()=>setShowAddVendor(!showAddVendor)} style={{fontSize:11,fontWeight:600,color:C.brand,background:"none",border:`1px solid ${C.brand}44`,borderRadius:4,padding:"3px 8px",cursor:"pointer"}}>+ Add Vendor</button>
            </div>
            <div style={{fontSize:11,color:"#6b7785",marginBottom:8}}>Vendors who send truck-related invoices. Download their PDF attachments from Gmail and upload below.</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {knownVendors.map(v=><span key={v.name} style={{fontSize:11,padding:"4px 10px",background:C.light,color:C.dark,borderRadius:5,fontWeight:600,border:"1px solid #e2e8f0",display:"flex",alignItems:"center",gap:6}}>
                {v.name} <span style={{color:"#94a3b8"}}>({v.category})</span>
                <button onClick={()=>removeVendor(v.name)} style={{background:"none",border:"none",color:"#94a3b8",cursor:"pointer",fontSize:12,padding:0,lineHeight:1}}>×</button>
              </span>)}
              {knownVendors.length===0&&<span style={{fontSize:11,color:"#94a3b8"}}>No vendors added yet.</span>}
            </div>
            {showAddVendor&&<div style={{display:"flex",gap:6,marginTop:8}}>
              <input style={{...s.fInp,flex:1}} placeholder="Vendor name" value={newVendor.name} onChange={e=>setNewVendor({...newVendor,name:e.target.value})}/>
              <select style={s.fInp} value={newVendor.category} onChange={e=>setNewVendor({...newVendor,category:e.target.value})}>
                {COST_CATS.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
              <button onClick={addVendor} style={{...s.saveBtn,padding:"6px 12px",fontSize:11}}>Add</button>
            </div>}
          </div>

          <div style={s.secT}>Invoice Scanner</div>
          <div style={{...s.addForm,marginBottom:16}}>
            <div style={{fontSize:12,color:"#6b7785",marginBottom:4}}>Upload scanned invoices (PDF or images). AI will read each one and extract truck #, vendor, amount, and details automatically.</div>
            <input type="file" accept="image/*,application/pdf" multiple onChange={handleFileUpload} style={{fontSize:13,padding:8}}/>
            {scanQueue.length>0&&<div>
              <div style={{fontSize:12,fontWeight:700,color:"#1e293b",marginTop:8,marginBottom:6}}>{scanQueue.length} invoice{scanQueue.length>1?"s":""} queued</div>
              {scanQueue.map((q,i)=>{const isDup=q.status==="parsed"&&q.parsed&&q.parsed.invoiceNum&&costEntries.some(c=>c.invoiceNum===q.parsed.invoiceNum);
                return <div key={q.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 8px",background:isDup?"#fef3c7":q.status==="parsed"?"#f0fdf4":q.status==="error"?"#fef2f2":"#f8fafc",borderRadius:6,marginBottom:4,border:"1px solid #e2e8f0"}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:600,color:"#1e293b"}}>{q.file}</div>
                  {q.status==="parsed"&&q.parsed&&!q.parsed.error&&<div style={{fontSize:10,color:isDup?C.accent:C.green}}>
                    {isDup?"⚠ DUPLICATE — ":""}Truck #{q.parsed.truckId||"?"} · {q.parsed.vendor} · ${q.parsed.total?.toLocaleString()||0} · {q.parsed.category}{q.parsed.invoiceNum&&` · Inv #${q.parsed.invoiceNum}`}
                  </div>}
                  {q.status==="error"&&<div style={{fontSize:10,color:C.red}}>Error: {q.parsed?.error||"Failed"}</div>}
                  {q.status==="scanning"&&<div style={{fontSize:10,color:C.brand}}>Scanning...</div>}
                  {q.status==="ready"&&<div style={{fontSize:10,color:"#94a3b8"}}>Ready to scan</div>}
                </div>
                {q.status==="parsed"&&q.parsed&&!q.parsed.error&&<span style={{fontSize:16,color:isDup?C.accent:C.green}}>{isDup?"⚠":"✓"}</span>}
                <button onClick={()=>setScanQueue(scanQueue.filter(x=>x.id!==q.id))} style={{...s.xBtn,marginLeft:8}}>×</button>
              </div>;})}
              <div style={{display:"flex",gap:8,marginTop:8}}>
                {scanQueue.some(q=>q.status==="ready")&&<button onClick={scanInvoices} disabled={scanning} style={{...s.saveBtn,opacity:scanning?0.6:1}}>{scanning?"Scanning...":"Scan All with AI"}</button>}
                {scanQueue.some(q=>q.status==="parsed")&&<button onClick={confirmScannedInvoices} style={s.addBtn}>Confirm & Save All</button>}
                <button onClick={()=>setScanQueue([])} style={s.canBtn}>Clear Queue</button>
              </div>
            </div>}
          </div>

          {/* Manual entry */}
          <ManualCostForm trucks={trucks} cats={COST_CATS} onAdd={addManualCost}/>

          {/* Cost Analytics Summary */}
          {costEntries.length>0&&<div>
            <div style={{...s.secT,marginTop:20}}>Cost Overview</div>
            <div style={s.statGrid}>
              <Stat l="Total Spend" v={`$${Math.round(costAnalytics.totalAll).toLocaleString()}`} c={C.red}/>
              <Stat l="Invoices" v={costAnalytics.entryCount} c={C.brand}/>
              <Stat l="Trucks w/ Costs" v={Object.keys(costAnalytics.byTruck).length} c={C.accent}/>
            </div>

            {/* Top trucks by cost */}
            {costAnalytics.topTrucks.length>0&&<div style={{marginTop:16}}>
              <div style={{fontSize:13,fontWeight:700,color:"#1e293b",marginBottom:8}}>Highest Cost Trucks</div>
              {costAnalytics.topTrucks.map(([tid,data])=> <div key={tid} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:"#fff",borderRadius:6,border:"1px solid #e2e8f0",marginBottom:4}}>
                <div><span style={{fontFamily:"monospace",fontWeight:700,color:C.brand,cursor:"pointer",textDecoration:"underline"}} onClick={()=>setHistoryTruck(tid)}>#{tid}</span><span style={{fontSize:11,color:"#6b7785",marginLeft:8}}>{data.count} invoice{data.count>1?"s":""}</span></div>
                <span style={{fontWeight:700,color:C.red,fontSize:14}}>${Math.round(data.total).toLocaleString()}</span>
              </div>)}
            </div>}

            {/* By category */}
            {Object.keys(costAnalytics.byCat).length>0&&<div style={{marginTop:16}}>
              <div style={{fontSize:13,fontWeight:700,color:"#1e293b",marginBottom:8}}>Spend by Category</div>
              <div style={s.bGrid}>{Object.entries(costAnalytics.byCat).sort((a,b)=>b[1]-a[1]).map(([cat,amt])=>
                <div key={cat} style={s.bItem}><span style={{fontSize:12,color:"#6b7785"}}>{cat}</span><span style={{fontSize:14,fontWeight:700,color:"#1e293b"}}>${Math.round(amt).toLocaleString()}</span></div>
              )}</div>
            </div>}
          </div>}

          {/* Cost Ledger */}
          <div style={{...s.secT,marginTop:20}}>Cost Ledger</div>
          <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
            <select style={s.fSel} value={costFilter} onChange={e=>setCostFilter(e.target.value)}>
              <option value="all">All Trucks</option>
              {[...new Set(costEntries.map(c=>c.truckId))].sort().map(tid=><option key={tid} value={tid}>#{tid}</option>)}
            </select>
            <select style={s.fSel} value={costCatFilter} onChange={e=>setCostCatFilter(e.target.value)}>
              <option value="all">All Categories</option>
              {COST_CATS.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={s.tWrap}><table style={{...s.table,fontSize:12}}><thead><tr>
            {["Date","Truck #","Vendor","Category","Amount","Invoice #","Notes",""].map(h=><th key={h} style={{...s.th,whiteSpace:"nowrap"}}>{h}</th>)}
          </tr></thead><tbody>
            {costEntries.filter(c=>(costFilter==="all"||c.truckId===costFilter)&&(costCatFilter==="all"||c.category===costCatFilter)).sort((a,b)=>b.date?.localeCompare(a.date)).map(c=>
              <tr key={c.id} style={s.tr}>
                <td style={s.ltd}>{c.date}</td>
                <td style={{...s.ltd,fontFamily:"monospace",fontWeight:700,color:C.brand,cursor:"pointer",textDecoration:"underline"}} onClick={()=>setHistoryTruck(c.truckId)}>#{c.truckId}</td>
                <td style={s.ltd}>{c.vendor}</td>
                <td style={s.ltd}><span style={{fontSize:10,fontWeight:600,padding:"2px 6px",borderRadius:3,background:C.light,color:C.brand}}>{c.category}</span></td>
                <td style={{...s.ltd,fontWeight:700,color:C.red}}>${(c.total||0).toLocaleString()}</td>
                <td style={{...s.ltd,color:"#94a3b8"}}>{c.invoiceNum||"—"}</td>
                <td style={{...s.ltd,maxWidth:200,overflow:"hidden",textOverflow:"ellipsis"}}>{c.notes||"—"}</td>
                <td style={s.ltd}><button style={s.xBtn} onClick={()=>deleteCost(c.id)}>×</button></td>
              </tr>
            )}
            {costEntries.filter(c=>(costFilter==="all"||c.truckId===costFilter)&&(costCatFilter==="all"||c.category===costCatFilter)).length===0&&
              <tr><td colSpan={8} style={{...s.ltd,textAlign:"center",color:"#94a3b8",padding:20}}>No cost entries yet. Upload invoices or add manually.</td></tr>
            }
          </tbody></table></div>
        </div>}

      </div>

      {/* ── Repair Form Modal (from truck status board) ── */}
      {showRepairForm&&tab==="board"&&<div style={s.modal} onClick={()=>setShowRepairForm(null)}><div style={s.modalBox} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:16,fontWeight:700,color:"#1e293b",marginBottom:12}}>Log Repair — Truck #{showRepairForm}</div>
        <select style={s.fInp} value={repairForm.reason} onChange={e=>setRepairForm({...repairForm,reason:e.target.value})}>
          {OOS_REASONS.map(r=><option key={r} value={r}>{r}</option>)}
        </select>
        <input style={s.fInp} placeholder="Notes" value={repairForm.notes} onChange={e=>setRepairForm({...repairForm,notes:e.target.value})}/>
        <input style={s.fInp} placeholder="Shop / Location" value={repairForm.shop} onChange={e=>setRepairForm({...repairForm,shop:e.target.value})}/>
        <div style={{display:"flex",gap:6}}>
          <input style={s.fInp} type="date" value={repairForm.estReturn} onChange={e=>setRepairForm({...repairForm,estReturn:e.target.value})}/>
          <input style={s.fInp} type="number" placeholder="Cost $" value={repairForm.cost} onChange={e=>setRepairForm({...repairForm,cost:e.target.value})}/>
        </div>
        <div style={{display:"flex",gap:8,marginTop:4}}>
          <button style={s.saveBtn} onClick={()=>{addRepair(showRepairForm);commitEdit(`${showRepairForm}-${DAYS[todayDI()]}`,"status","OOS");}}>Log & Set OOS</button>
          <button style={s.canBtn} onClick={()=>setShowRepairForm(null)}>Cancel</button>
        </div>
      </div></div>}

      {/* ── Truck Report Modal ── */}
      {historyTruck&&(()=>{
        const t=trucks.find(x=>x.id===historyTruck);
        const tRepairs=repairs.filter(r=>r.truckId===historyTruck).sort((a,b)=>b.id-a.id);
        const tCosts=costEntries.filter(c=>c.truckId===historyTruck).sort((a,b)=>(b.date||"").localeCompare(a.date||""));
        const totalRepairCost=tRepairs.reduce((s,r)=>s+(r.cost||0),0);
        const totalInvoiceCost=tCosts.reduce((s,c)=>s+(c.total||0),0);
        const totalCost=totalRepairCost+totalInvoiceCost;
        const openRepairs=tRepairs.filter(r=>r.status==="open");
        const dr=findDriverForTruck(historyTruck);
        const catBreakdown={};
        tCosts.forEach(c=>{if(!catBreakdown[c.category])catBreakdown[c.category]=0;catBreakdown[c.category]+=(c.total||0);});

        return <div style={s.modal} onClick={()=>setHistoryTruck(null)}><div style={{...s.modalBox,maxWidth:520}} onClick={e=>e.stopPropagation()}>
          {/* Header */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div>
              <div style={{fontSize:22,fontWeight:800,fontFamily:"monospace",color:C.dark}}>#{historyTruck}</div>
              <div style={{fontSize:12,color:"#6b7785",marginTop:2}}>Truck Report</div>
            </div>
            <button onClick={()=>setHistoryTruck(null)} style={s.xBtn}>×</button>
          </div>

          {/* Specs */}
          {t&&<div style={{background:"#f8fafc",borderRadius:8,padding:12,marginBottom:12,border:"1px solid #e2e8f0"}}>
            <div style={{display:"flex",gap:16,flexWrap:"wrap",fontSize:12}}>
              <div><span style={{color:"#6b7785"}}>Type:</span> <span style={{fontWeight:700}}>{t.type==="straight"?"Box Truck":"Tractor"}</span></div>
              <div><span style={{color:"#6b7785"}}>Make:</span> <span style={{fontWeight:700}}>{t.mk}</span></div>
              <div><span style={{color:"#6b7785"}}>Trans:</span> <span style={{fontWeight:700,color:t.tr==="A"?C.green:C.accent}}>{t.tr==="A"?"Auto":"Manual"}</span></div>
              <div><span style={{color:"#6b7785"}}>Axle:</span> <span style={{fontWeight:700}}>{t.ax}</span></div>
            </div>
            {dr&&<div style={{marginTop:6,fontSize:12}}><span style={{color:"#6b7785"}}>Current Driver:</span> <span style={{fontWeight:700,color:C.brand,cursor:"pointer",textDecoration:"underline"}} onClick={()=>{setHistoryTruck(null);setTimeout(()=>setDriverReport(dr.name),100);}}>{dr.name}</span></div>}
            {openRepairs.length>0&&<div style={{marginTop:6,fontSize:12,color:C.red,fontWeight:700}}>⚠ {openRepairs.length} open repair{openRepairs.length>1?"s":""}</div>}
          </div>}

          {/* Cost Summary */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
            <div style={{background:"#fff",borderRadius:6,padding:"8px 10px",border:"1px solid #e2e8f0",textAlign:"center"}}>
              <div style={{fontSize:18,fontWeight:800,color:C.red}}>${Math.round(totalCost).toLocaleString()}</div>
              <div style={{fontSize:9,color:"#6b7785"}}>Total Cost</div>
            </div>
            <div style={{background:"#fff",borderRadius:6,padding:"8px 10px",border:"1px solid #e2e8f0",textAlign:"center"}}>
              <div style={{fontSize:18,fontWeight:800,color:C.yellow}}>${Math.round(totalRepairCost).toLocaleString()}</div>
              <div style={{fontSize:9,color:"#6b7785"}}>Repairs</div>
            </div>
            <div style={{background:"#fff",borderRadius:6,padding:"8px 10px",border:"1px solid #e2e8f0",textAlign:"center"}}>
              <div style={{fontSize:18,fontWeight:800,color:C.brand}}>${Math.round(totalInvoiceCost).toLocaleString()}</div>
              <div style={{fontSize:9,color:"#6b7785"}}>Invoices</div>
            </div>
          </div>

          {/* Category breakdown */}
          {Object.keys(catBreakdown).length>0&&<div style={{marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:700,color:"#1e293b",marginBottom:4}}>Cost by Category</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {Object.entries(catBreakdown).sort((a,b)=>b[1]-a[1]).map(([cat,amt])=>
                <span key={cat} style={{fontSize:10,padding:"3px 8px",background:C.light,color:C.dark,borderRadius:4,fontWeight:600}}>{cat}: ${Math.round(amt).toLocaleString()}</span>
              )}
            </div>
          </div>}

          {/* Repair History */}
          <div style={{fontSize:13,fontWeight:700,color:"#1e293b",marginBottom:6,borderTop:"2px solid #e2e8f0",paddingTop:12}}>Repair History ({tRepairs.length})</div>
          {tRepairs.length===0&&<div style={{fontSize:11,color:"#94a3b8",padding:"8px 0"}}>No repairs logged.</div>}
          {tRepairs.map(r=>
            <div key={r.id} style={{padding:"8px 0",borderBottom:"1px solid #f1f5f9"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontWeight:600,fontSize:12}}>{r.reason}</span>
                <span style={{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:3,background:r.status==="open"?C.red+"18":C.green+"18",color:r.status==="open"?C.red:C.green}}>{r.status==="open"?"OPEN":"CLOSED"}</span>
              </div>
              {r.notes&&<div style={{fontSize:11,color:"#6b7785"}}>{r.notes}</div>}
              <div style={{fontSize:10,color:"#94a3b8"}}>
                In: {dateStr(r.dateIn)}{r.dateClosed&&` · Out: ${dateStr(r.dateClosed)}`}{r.cost>0&&` · $${r.cost.toLocaleString()}`}{r.shop&&` · ${r.shop}`}
              </div>
            </div>
          )}

          {/* Cost History */}
          <div style={{fontSize:13,fontWeight:700,color:"#1e293b",marginBottom:6,borderTop:"2px solid #e2e8f0",paddingTop:12,marginTop:8}}>Invoice / Cost History ({tCosts.length})</div>
          {tCosts.length===0&&<div style={{fontSize:11,color:"#94a3b8",padding:"8px 0"}}>No invoices logged.</div>}
          {tCosts.map(c=>
            <div key={c.id} style={{padding:"8px 0",borderBottom:"1px solid #f1f5f9"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><span style={{fontWeight:600,fontSize:12}}>{c.vendor}</span><span style={{fontSize:10,color:C.brand,marginLeft:6,fontWeight:600,padding:"1px 5px",background:C.light,borderRadius:3}}>{c.category}</span></div>
                <span style={{fontWeight:700,fontSize:13,color:C.red}}>${(c.total||0).toLocaleString()}</span>
              </div>
              <div style={{fontSize:10,color:"#94a3b8"}}>
                {c.date}{c.invoiceNum&&` · Inv #${c.invoiceNum}`}{c.notes&&` · ${c.notes}`}
              </div>
            </div>
          )}

          {/* Driver History for this truck */}
          {(()=>{
            const driverHist=getTruckDriverHistory(historyTruck);
            return <div>
              <div style={{fontSize:13,fontWeight:700,color:"#1e293b",marginBottom:6,borderTop:"2px solid #e2e8f0",paddingTop:12,marginTop:8}}>Driver History ({driverHist.length})</div>
              {driverHist.length===0&&<div style={{fontSize:11,color:"#94a3b8",padding:"8px 0"}}>No driver history recorded yet.</div>}
              {driverHist.map(dh=>
                <div key={dh.name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid #f1f5f9"}}>
                  <div>
                    <span style={{fontSize:12,fontWeight:600,color:C.brand,cursor:"pointer",textDecoration:"underline"}} onClick={()=>{setHistoryTruck(null);setTimeout(()=>setDriverReport(dh.name),100);}}>{dh.name}</span>
                    <span style={{fontSize:10,color:"#94a3b8",marginLeft:6}}>{dh.role}</span>
                  </div>
                  <div style={{fontSize:11,color:"#6b7785"}}>{dh.days} day{dh.days>1?"s":""} · {dh.weeks} week{dh.weeks>1?"s":""}</div>
                </div>
              )}
            </div>;
          })()}

          <button onClick={()=>setHistoryTruck(null)} style={{...s.canBtn,marginTop:12,width:"100%"}}>Close Report</button>
        </div></div>;
      })()}

      {/* ── Driver Report Modal ── */}
      {driverReport&&(()=>{
        const d=drivers.find(x=>x.name===driverReport);
        const truckHist=getDriverTruckHistory(driverReport);
        const a=attendance[driverReport]||{worked:0,off:0,vac:0,calledOut:0,noShow:0,unassigned:0,totalDays:0};
        const scheduledDays=a.totalDays-a.vac;
        const rate=scheduledDays>0?Math.round((a.worked/scheduledDays)*100):0;
        const currentTruck=asgn[`${driverReport}-${DAYS[Math.min(todayDI(),4)]}`]||"";
        const isOff=OFF_OPTS.includes(currentTruck);

        return <div style={s.modal} onClick={()=>setDriverReport(null)}><div style={{...s.modalBox,maxWidth:520}} onClick={e=>e.stopPropagation()}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div>
              <div style={{fontSize:20,fontWeight:800,color:C.dark}}>{driverReport}</div>
              <div style={{fontSize:12,color:"#6b7785",marginTop:2}}>{d?.role||"Driver"} · {d?.category||""}</div>
            </div>
            <button onClick={()=>setDriverReport(null)} style={s.xBtn}>×</button>
          </div>

          <div style={{background:"#f8fafc",borderRadius:8,padding:12,marginBottom:12,border:"1px solid #e2e8f0"}}>
            <div style={{fontSize:12}}>
              <span style={{color:"#6b7785"}}>Today:</span>{" "}
              {currentTruck&&!isOff?<span style={{fontWeight:700,fontFamily:"monospace",color:C.brand}}>Truck #{currentTruck}</span>
                :isOff?<span style={{fontWeight:700,color:C.accent}}>{currentTruck}</span>
                :<span style={{color:"#94a3b8"}}>Not assigned</span>}
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:6,marginBottom:12}}>
            <div style={{background:"#fff",borderRadius:6,padding:"6px 8px",border:"1px solid #e2e8f0",textAlign:"center"}}>
              <div style={{fontSize:16,fontWeight:800,color:rate>=90?C.green:rate>=70?C.accent:C.red}}>{rate}%</div>
              <div style={{fontSize:8,color:"#6b7785"}}>Attend Rate</div>
            </div>
            <div style={{background:"#fff",borderRadius:6,padding:"6px 8px",border:"1px solid #e2e8f0",textAlign:"center"}}>
              <div style={{fontSize:16,fontWeight:800,color:C.green}}>{a.worked}</div>
              <div style={{fontSize:8,color:"#6b7785"}}>Days Worked</div>
            </div>
            <div style={{background:"#fff",borderRadius:6,padding:"6px 8px",border:"1px solid #e2e8f0",textAlign:"center"}}>
              <div style={{fontSize:16,fontWeight:800,color:a.calledOut>=3?C.red:C.accent}}>{a.calledOut}</div>
              <div style={{fontSize:8,color:"#6b7785"}}>Called Out</div>
            </div>
            <div style={{background:"#fff",borderRadius:6,padding:"6px 8px",border:"1px solid #e2e8f0",textAlign:"center"}}>
              <div style={{fontSize:16,fontWeight:800,color:a.noShow>=1?C.red:"#6b7785"}}>{a.noShow}</div>
              <div style={{fontSize:8,color:"#6b7785"}}>No Shows</div>
            </div>
          </div>

          <div style={{fontSize:13,fontWeight:700,color:"#1e293b",marginBottom:6,borderTop:"2px solid #e2e8f0",paddingTop:12}}>Vehicle History ({truckHist.length} trucks)</div>
          {truckHist.length===0&&<div style={{fontSize:11,color:"#94a3b8",padding:"8px 0"}}>No vehicle history recorded yet.</div>}
          {truckHist.map(th=>
            <div key={th.truckId} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid #f1f5f9"}}>
              <div>
                <span style={{fontFamily:"monospace",fontWeight:700,fontSize:13,color:C.brand,cursor:"pointer",textDecoration:"underline"}} onClick={()=>{setDriverReport(null);setTimeout(()=>setHistoryTruck(th.truckId),100);}}>#{th.truckId}</span>
                <span style={{fontSize:10,color:"#94a3b8",marginLeft:6}}>{th.type==="straight"?th.mk:"Tractor"} · {th.tr==="A"?"Auto":"Man"}</span>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:11,fontWeight:600,color:"#1e293b"}}>{th.days} day{th.days>1?"s":""}</div>
                {th.lastSeen&&<div style={{fontSize:9,color:"#94a3b8"}}>Last: {dateStr(th.lastSeen)}</div>}
              </div>
            </div>
          )}

          <button onClick={()=>setDriverReport(null)} style={{...s.canBtn,marginTop:12,width:"100%"}}>Close Report</button>
        </div></div>;
      })()}
    </div>
  );
}

// ── Sub-components ──
function TSRow({t,tStat,ec,ev,sev,se,ce,gs,onOOS}){
  return <tr style={s.tr}><td style={{...s.td,fontWeight:700,fontFamily:"monospace",color:"#1e293b"}}>{t.id}</td><td style={{...s.td,fontSize:11}}>{t.type==="straight"?t.mk:"Tractor"}</td>
    <td style={s.td}><span style={{fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:3,background:t.tr==="A"?"#27ae6018":"#e6a81718",color:t.tr==="A"?C.green:C.accent}}>{t.tr==="A"?"A":"M"}</span></td>
    <td style={{...s.td,fontSize:11}}>{t.ax==="Tandem"?"T":"S"}</td>
    {DAYS.map(day=>{const key=`${t.id}-${day}`;const val=tStat[key]||"";const st2=gs(t.id,day);const isE=ec===key;
      return <td key={day} style={{...s.td,background:SC[st2]+"0a"}} onClick={()=>!isE&&se(key,val)}>
        {isE?<div style={{display:"flex",flexDirection:"column",gap:2}}>
          <input style={s.cInp} value={ev} onChange={e=>sev(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")ce(key,"status");if(e.key==="Escape"){sev("");se(null);}}} autoFocus/>
          <button onClick={onOOS} style={{fontSize:8,padding:"2px 4px",background:C.red+"18",color:C.red,border:`1px solid ${C.red}33`,borderRadius:3,cursor:"pointer",fontWeight:700}}>+ Repair Log</button>
        </div>
        :<span style={{cursor:"pointer",color:SC[st2],fontWeight:600,fontSize:11}}>{val||"—"}</span>}
      </td>;
    })}
  </tr>;
}
function Stat({l,v,sub,c}){return <div style={s.statCard}><div style={{fontSize:28,fontWeight:800,color:c}}>{v}</div><div style={{fontSize:12,color:"#6b7785",marginTop:4}}>{l}</div>{sub&&<div style={{fontSize:10,color:"#94a3b8",marginTop:2}}>{sub}</div>}</div>;}
function Row({l,v}){return <div style={{display:"flex",justifyContent:"space-between",padding:"3px 0"}}><span style={{fontSize:10,color:"#6b7785"}}>{l}</span><span style={{fontSize:11,color:"#1e293b",fontWeight:600}}>{v}</span></div>;}

function ManualCostForm({trucks,cats,onAdd}){
  const[show,setShow]=useState(false);
  const[f,setF]=useState({truckId:"",vendor:"",date:new Date().toISOString().split("T")[0],invoiceNum:"",total:"",category:"Parts",notes:""});
  const submit=()=>{
    if(!f.truckId||!f.total)return;
    onAdd({...f,total:Number(f.total),lineItems:[]});
    setF({truckId:"",vendor:"",date:new Date().toISOString().split("T")[0],invoiceNum:"",total:"",category:"Parts",notes:""});
    setShow(false);
  };
  if(!show) return <button onClick={()=>setShow(true)} style={{...s.wBtn,marginBottom:8}}>+ Add Cost Manually</button>;
  return <div style={{...s.addForm,marginBottom:16}}>
    <div style={{fontSize:13,fontWeight:700,color:"#1e293b"}}>Manual Cost Entry</div>
    <div style={{display:"flex",gap:6}}>
      <select style={s.fInp} value={f.truckId} onChange={e=>setF({...f,truckId:e.target.value})}>
        <option value="">Truck #</option>
        {trucks.map(t=><option key={t.id} value={t.id}>#{t.id} — {t.type==="straight"?t.mk:"Tractor"}</option>)}
      </select>
      <select style={s.fInp} value={f.category} onChange={e=>setF({...f,category:e.target.value})}>
        {cats.map(c=><option key={c} value={c}>{c}</option>)}
      </select>
    </div>
    <div style={{display:"flex",gap:6}}>
      <input style={s.fInp} placeholder="Vendor / Shop" value={f.vendor} onChange={e=>setF({...f,vendor:e.target.value})}/>
      <input style={s.fInp} type="number" placeholder="Amount $" value={f.total} onChange={e=>setF({...f,total:e.target.value})}/>
    </div>
    <div style={{display:"flex",gap:6}}>
      <input style={s.fInp} type="date" value={f.date} onChange={e=>setF({...f,date:e.target.value})}/>
      <input style={s.fInp} placeholder="Invoice #" value={f.invoiceNum} onChange={e=>setF({...f,invoiceNum:e.target.value})}/>
    </div>
    <input style={s.fInp} placeholder="Notes" value={f.notes} onChange={e=>setF({...f,notes:e.target.value})}/>
    <div style={{display:"flex",gap:8}}>
      <button style={s.saveBtn} onClick={submit}>Save Entry</button>
      <button style={s.canBtn} onClick={()=>setShow(false)}>Cancel</button>
    </div>
  </div>;
}

// ── STYLES ──
const s={
  wrap:{fontFamily:"'Segoe UI','Helvetica Neue',system-ui,sans-serif",background:"#f5f7fa",color:"#334155",minHeight:"100vh",width:"100%"},
  header:{background:"#fff",borderBottom:"2px solid #e2e8f0",position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"},
  hInner:{padding:"12px 20px 0",display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8},
  tabs:{display:"flex",gap:0,overflowX:"auto"},
  tab:{padding:"10px 14px",fontSize:12,fontWeight:500,color:"#6b7785",background:"none",border:"none",borderBottom:"2px solid transparent",cursor:"pointer",whiteSpace:"nowrap",position:"relative"},
  tabOn:{color:C.brand,borderBottomColor:C.brand,fontWeight:700},
  badge:{position:"absolute",top:4,right:2,fontSize:9,fontWeight:700,background:C.red,color:"#fff",borderRadius:10,padding:"1px 5px",minWidth:16,textAlign:"center"},
  body:{padding:"16px 12px 40px",maxWidth:1200,margin:"0 auto"},
  statGrid:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(130px, 1fr))",gap:10},
  statCard:{background:"#fff",borderRadius:10,padding:"16px 14px",border:"1px solid #e2e8f0",boxShadow:"0 1px 2px rgba(0,0,0,0.03)"},
  secT:{fontSize:14,fontWeight:700,color:"#1e293b",marginBottom:10},
  bGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6},
  bItem:{display:"flex",justifyContent:"space-between",padding:"8px 12px",background:"#fff",borderRadius:6,border:"1px solid #e2e8f0"},
  weekNav:{display:"flex",alignItems:"center",gap:8,marginBottom:12,flexWrap:"wrap"},
  wBtn:{padding:"6px 12px",fontSize:12,background:"#fff",color:"#6b7785",border:"1px solid #d1d9e0",borderRadius:6,cursor:"pointer"},
  wBtnA:{padding:"6px 12px",fontSize:12,background:C.brand,color:"#fff",border:`1px solid ${C.brand}`,borderRadius:6,cursor:"pointer",fontWeight:600},
  wLbl:{fontSize:14,fontWeight:700,color:"#1e293b",flex:1,textAlign:"center"},
  bSel:{padding:"8px 14px",fontSize:13,fontWeight:600,background:"#fff",color:"#1e293b",border:"1px solid #d1d9e0",borderRadius:6,outline:"none"},
  sayBtn:{padding:"6px 14px",fontSize:12,fontWeight:700,background:"#fff",color:C.brand,border:`2px solid ${C.brand}`,borderRadius:6,cursor:"pointer",whiteSpace:"nowrap"},
  jumpBtn:{padding:"6px 14px",fontSize:12,fontWeight:600,background:"#fff",color:C.brand,border:`1px solid ${C.brand}55`,borderRadius:6,cursor:"pointer",whiteSpace:"nowrap"},
  sayMini:{marginLeft:4,padding:"1px 4px",fontSize:9,fontWeight:700,background:C.light,color:C.brand,border:`1px solid ${C.brand}44`,borderRadius:3,cursor:"pointer",verticalAlign:"middle"},
  tWrap:{overflowX:"auto",borderRadius:8,border:"1px solid #e2e8f0",background:"#fff"},
  table:{width:"100%",borderCollapse:"collapse",fontSize:12},
  th:{padding:"8px 6px",textAlign:"left",background:"#f8fafc",color:"#6b7785",fontWeight:600,fontSize:10,textTransform:"uppercase",letterSpacing:.5,borderBottom:"1px solid #e2e8f0"},
  thS:{position:"sticky",left:0,zIndex:1,background:"#f8fafc"},
  tr:{borderBottom:"1px solid #f1f5f9"},
  td:{padding:"6px",cursor:"pointer",minWidth:50,verticalAlign:"top"},
  tdN:{fontWeight:600,color:"#1e293b",whiteSpace:"nowrap",fontSize:11,position:"sticky",left:0,background:"#fff",zIndex:1},
  roleDiv:{padding:"8px 6px",background:"#f8fafc",fontWeight:700,fontSize:11,letterSpacing:.5,textTransform:"uppercase",borderTop:"2px solid #e2e8f0"},
  secDiv:{padding:"8px 6px",background:"#f8fafc",color:C.brand,fontWeight:700,fontSize:11,letterSpacing:1,textTransform:"uppercase"},
  eCell:{padding:4,background:"#f0f5ff",minWidth:140,cursor:"default"},
  ePanel:{display:"flex",flexDirection:"column",gap:4},
  offRow:{display:"flex",gap:2,flexWrap:"wrap"},
  oBtn:{padding:"2px 5px",fontSize:8,fontWeight:700,background:"#fff",color:"#6b7785",border:"1px solid #d1d9e0",borderRadius:3,cursor:"pointer"},
  oBtnOn:{background:"#fef3c7",color:C.accent,borderColor:C.accent},
  clrBtn:{padding:"2px 5px",fontSize:8,fontWeight:700,background:"#fef2f2",color:C.red,border:`1px solid ${C.red}44`,borderRadius:3,cursor:"pointer"},
  cInp:{width:"100%",padding:"4px 6px",fontSize:12,fontFamily:"monospace",background:"#fff",color:"#1e293b",border:`1px solid ${C.brand}`,borderRadius:3,outline:"none"},
  goBtn:{padding:"3px 8px",fontSize:10,fontWeight:700,background:C.green,color:"#fff",border:"none",borderRadius:3,cursor:"pointer"},
  tSel:{width:"100%",padding:"4px 4px",fontSize:10,background:"#fff",color:"#334155",border:"1px solid #d1d9e0",borderRadius:3,outline:"none"},
  doneBtn:{padding:"3px 8px",fontSize:9,fontWeight:600,background:"#e2e8f0",color:"#6b7785",border:"1px solid #d1d9e0",borderRadius:3,cursor:"pointer",alignSelf:"flex-end"},
  sInp:{flex:1,minWidth:100,padding:"8px 12px",fontSize:13,background:"#fff",color:"#1e293b",border:"1px solid #d1d9e0",borderRadius:6,outline:"none"},
  fSel:{padding:"8px 12px",fontSize:12,background:"#fff",color:"#6b7785",border:"1px solid #d1d9e0",borderRadius:6,outline:"none"},
  addBtn:{padding:"8px 16px",fontSize:12,fontWeight:700,background:C.brand,color:"#fff",border:"none",borderRadius:6,cursor:"pointer",whiteSpace:"nowrap"},
  vTog:{display:"flex",border:"1px solid #d1d9e0",borderRadius:6,overflow:"hidden"},
  vBtn:{padding:"7px 10px",fontSize:14,background:"#fff",color:"#94a3b8",border:"none",cursor:"pointer",lineHeight:1},
  vBtnOn:{background:C.brand,color:"#fff"},
  cardGrid:{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(160px, 1fr))",gap:10},
  tCard:{background:"#fff",borderRadius:10,border:"1px solid #e2e8f0",overflow:"hidden",boxShadow:"0 1px 2px rgba(0,0,0,0.03)"},
  cHdr:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",borderBottom:"1px solid #f1f5f9"},
  tNum:{fontSize:16,fontWeight:800,color:"#1e293b",fontFamily:"monospace"},
  sBdg:{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:4,border:"1px solid",textTransform:"uppercase"},
  cBody:{padding:"8px 12px"},
  remBtn:{width:"100%",padding:"6px",fontSize:10,color:C.red,background:"none",border:"none",borderTop:"1px solid #f1f5f9",cursor:"pointer"},
  ltd:{padding:"8px 8px",fontSize:12,color:"#334155",whiteSpace:"nowrap"},
  addForm:{background:"#fff",borderRadius:8,padding:16,marginBottom:12,border:"1px solid #e2e8f0",display:"flex",flexDirection:"column",gap:8,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"},
  fInp:{padding:"8px 12px",fontSize:13,background:"#f8fafc",color:"#1e293b",border:"1px solid #d1d9e0",borderRadius:6,outline:"none"},
  saveBtn:{padding:"8px 20px",fontSize:12,fontWeight:700,background:C.green,color:"#fff",border:"none",borderRadius:6,cursor:"pointer"},
  canBtn:{padding:"8px 20px",fontSize:12,fontWeight:500,background:"none",color:"#6b7785",border:"1px solid #d1d9e0",borderRadius:6,cursor:"pointer"},
  dCat:{fontSize:13,fontWeight:700,padding:"12px 0 6px",borderBottom:"1px solid #e2e8f0",marginBottom:4},
  dRow:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 10px",borderBottom:"1px solid #f1f5f9"},
  dNm:{fontSize:13,fontWeight:600,color:"#1e293b"},
  dRl:{fontSize:10,color:"#6b7785"},
  tBdg:{fontSize:10,fontWeight:700,padding:"2px 8px",background:C.light,color:C.brand,borderRadius:4},
  oBdg:{fontSize:10,fontWeight:600,padding:"2px 8px",background:"#fef3c7",color:C.accent,borderRadius:4},
  xBtn:{width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"#94a3b8",background:"none",border:"1px solid #e2e8f0",borderRadius:4,cursor:"pointer"},
  // Repair-specific
  repairCard:{padding:"12px 14px",background:"#fff",borderRadius:8,border:"1px solid #e2e8f0",borderLeft:"4px solid",marginBottom:8,borderLeftColor:C.red},
  closeRepBtn:{padding:"6px 14px",fontSize:11,fontWeight:700,background:C.green,color:"#fff",border:"none",borderRadius:5,cursor:"pointer"},
  emptyMsg:{padding:20,textAlign:"center",color:"#94a3b8",fontSize:13,background:"#fff",borderRadius:8,border:"1px solid #e2e8f0"},
  // Modals
  modal:{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:16},
  modalBox:{background:"#fff",borderRadius:12,padding:20,width:"100%",maxWidth:420,maxHeight:"80vh",overflowY:"auto",display:"flex",flexDirection:"column",gap:8,boxShadow:"0 20px 60px rgba(0,0,0,0.2)"},
};
