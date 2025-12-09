import React, { useMemo, useState } from 'react';

type DbTier = 'mongo-atlas' | 'postgres' | 'dynamo' | 'mysql';
type CameraTier = 'none' | 'sd' | 'hd' | 'uhd';

interface Inputs {
  crushers: number;
  sensorsPerCrusher: number;
  aiInferencePerMin: number; // per camera
  cameras: number;
  cameraTier: CameraTier;
  storageTB: number;
  dbTier: DbTier;
  apiRequestsPerDay: number;
  iotMsgsPerDay: number;
  backupTB: number;
  region: string;
}

const PRICING = {
  base: 50, // platform fee
  crusher: 120, // per crusher/month
  sensor: 2.5, // per sensor/month
  iotMsg: 0.00001, // per message
  apiReq: 0.00002, // per request
  storageTB: 18, // per TB/month
  backupTB: 10, // per TB/month (cold)
  cameras: {
    none: 0,
    sd: 15, // per camera/month
    hd: 35,
    uhd: 70
  },
  aiInferencePerMin: 0.0008 // per minute per camera
};

const DB_PRICING: Record<DbTier, { base: number; perTB: number }> = {
  'mongo-atlas': { base: 60, perTB: 25 },
  'postgres': { base: 45, perTB: 20 },
  'dynamo': { base: 75, perTB: 30 },
  'mysql': { base: 40, perTB: 18 }
};

const regions = ['us-east-1', 'us-west-2', 'ap-south-1', 'eu-central-1'];

const currency = (n: number) => `₹${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const PricingCalculator: React.FC = () => {
  const [inputs, setInputs] = useState<Inputs>({
    crushers: 3,
    sensorsPerCrusher: 24,
    aiInferencePerMin: 5,
    cameras: 8,
    cameraTier: 'hd',
    storageTB: 4,
    dbTier: 'mongo-atlas',
    apiRequestsPerDay: 250000,
    iotMsgsPerDay: 500000,
    backupTB: 6,
    region: 'ap-south-1'
  });
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ env: true, fleet: true, vision: true, data: true, traffic: true, breakdown: true });

  const presets = [
    { name: 'Small Site', values: { crushers: 1, sensorsPerCrusher: 16, cameras: 4, cameraTier: 'sd' as CameraTier, aiInferencePerMin: 2, storageTB: 1, backupTB: 2, dbTier: 'postgres' as DbTier, apiRequestsPerDay: 50000, iotMsgsPerDay: 100000, region: 'us-east-1' } },
    { name: 'Medium Site', values: { crushers: 3, sensorsPerCrusher: 24, cameras: 8, cameraTier: 'hd' as CameraTier, aiInferencePerMin: 5, storageTB: 4, backupTB: 6, dbTier: 'mongo-atlas' as DbTier, apiRequestsPerDay: 250000, iotMsgsPerDay: 500000, region: 'ap-south-1' } },
    { name: 'Large Site', values: { crushers: 6, sensorsPerCrusher: 32, cameras: 16, cameraTier: 'uhd' as CameraTier, aiInferencePerMin: 10, storageTB: 12, backupTB: 18, dbTier: 'dynamo' as DbTier, apiRequestsPerDay: 1000000, iotMsgsPerDay: 2000000, region: 'eu-central-1' } },
  ];

  const onChange = (k: keyof Inputs, v: any) => setInputs(prev => ({ ...prev, [k]: v }));

  const breakdown = useMemo(() => {
    const crusherCost = inputs.crushers * PRICING.crusher;
    const sensorCost = inputs.crushers * inputs.sensorsPerCrusher * PRICING.sensor;
    const cameraBase = inputs.cameras * PRICING.cameras[inputs.cameraTier];
    const cameraAI = inputs.cameras * inputs.aiInferencePerMin * 60 * 24 * 30 * PRICING.aiInferencePerMin; // monthly
    const storageCost = inputs.storageTB * PRICING.storageTB;
    const backupCost = inputs.backupTB * PRICING.backupTB;
    const apiCost = inputs.apiRequestsPerDay * 30 * PRICING.apiReq;
    const iotCost = inputs.iotMsgsPerDay * 30 * PRICING.iotMsg;
    const db = DB_PRICING[inputs.dbTier];
    const dbCost = db.base + inputs.storageTB * db.perTB;
    const base = PRICING.base;
    const subtotal = base + crusherCost + sensorCost + cameraBase + cameraAI + storageCost + backupCost + apiCost + iotCost + dbCost;
    const total = subtotal;
    return { base, crusherCost, sensorCost, cameraBase, cameraAI, storageCost, backupCost, apiCost, iotCost, dbCost, subtotal, total };
  }, [inputs]);

  return (
    <div className="min-h-screen flex">
      {/* Left calc panel (sticky) */}
      <aside className="w-full md:w-96 border-r bg-white dark:bg-neutral-900 p-4 md:p-6">
        <div className="md:sticky md:top-0 md:h-[100vh] md:overflow-y-auto space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Pricing Calculator</h2>
            <div className="flex items-center gap-2">
              <select onChange={e => { const p = presets.find(pr => pr.name === e.target.value); if (p) setInputs(prev => ({ ...prev, ...p.values })); }} className="border rounded px-2 py-1 text-sm">
                <option value="">Presets</option>
                {presets.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
              </select>
            </div>
          </div>
          {/* Fleet & Vision */}
          <div className="space-y-3">
            <button className="w-full text-left text-xs font-semibold text-neutral-600" onClick={() => setOpenSections(s => ({ ...s, env: !s.env }))}>
              Environment
            </button>
            {openSections.env && (
          <label className="flex items-center justify-between gap-3">
            <span>Region</span>
            <select value={inputs.region} onChange={e => onChange('region', e.target.value)} className="border rounded px-2 py-1 text-sm">
              {regions.map(r => <option key={r}>{r}</option>)}
            </select>
          </label>
            )}
            <button className="w-full text-left text-xs font-semibold text-neutral-600 pt-2" onClick={() => setOpenSections(s => ({ ...s, fleet: !s.fleet }))}>
              Fleet
            </button>
            {openSections.fleet && (<>
          <label className="flex items-center justify-between gap-3"><span>Crushers</span><input type="number" min={0} value={inputs.crushers} onChange={e => onChange('crushers', Number(e.target.value))} className="border rounded px-2 py-1 w-24 text-right" /></label>
          <label className="flex items-center justify-between gap-3"><span>Sensors / Crusher</span><input type="number" min={0} value={inputs.sensorsPerCrusher} onChange={e => onChange('sensorsPerCrusher', Number(e.target.value))} className="border rounded px-2 py-1 w-24 text-right" /></label>
            </>)}
            <button className="w-full text-left text-xs font-semibold text-neutral-600 pt-2" onClick={() => setOpenSections(s => ({ ...s, vision: !s.vision }))}>
              Vision & AI
            </button>
            {openSections.vision && (<>
          <label className="flex items-center justify-between gap-3"><span>Cameras</span><input type="number" min={0} value={inputs.cameras} onChange={e => onChange('cameras', Number(e.target.value))} className="border rounded px-2 py-1 w-24 text-right" /></label>
          <label className="flex items-center justify-between gap-3">
            <span>Camera Tier</span>
            <select value={inputs.cameraTier} onChange={e => onChange('cameraTier', e.target.value as CameraTier)} className="border rounded px-2 py-1 text-sm">
              <option value="none">None</option>
              <option value="sd">SD</option>
              <option value="hd">HD</option>
              <option value="uhd">UHD</option>
            </select>
          </label>
          <label className="flex items-center justify-between gap-3"><span>AI Inference / min (per camera)</span><input type="number" min={0} value={inputs.aiInferencePerMin} onChange={e => onChange('aiInferencePerMin', Number(e.target.value))} className="border rounded px-2 py-1 w-24 text-right" /></label>
            </>)}
            <button className="w-full text-left text-xs font-semibold text-neutral-600 pt-2" onClick={() => setOpenSections(s => ({ ...s, data: !s.data }))}>
              Data
            </button>
            {openSections.data && (<>
          <label className="flex items-center justify-between gap-3"><span>Primary Storage (TB)</span><input type="number" min={0} value={inputs.storageTB} onChange={e => onChange('storageTB', Number(e.target.value))} className="border rounded px-2 py-1 w-24 text-right" /></label>
          <label className="flex items-center justify-between gap-3"><span>Cold Backup (TB)</span><input type="number" min={0} value={inputs.backupTB} onChange={e => onChange('backupTB', Number(e.target.value))} className="border rounded px-2 py-1 w-24 text-right" /></label>
          <label className="flex items-center justify-between gap-3">
            <span>Database</span>
            <select value={inputs.dbTier} onChange={e => onChange('dbTier', e.target.value as DbTier)} className="border rounded px-2 py-1 text-sm">
              <option value="mongo-atlas">MongoDB Atlas</option>
              <option value="postgres">PostgreSQL</option>
              <option value="dynamo">DynamoDB</option>
              <option value="mysql">MySQL</option>
            </select>
          </label>
            </>)}
            <button className="w-full text-left text-xs font-semibold text-neutral-600 pt-2" onClick={() => setOpenSections(s => ({ ...s, traffic: !s.traffic }))}>
              Traffic
            </button>
            {openSections.traffic && (<>
          <label className="flex items-center justify-between gap-3"><span>API Requests / day</span><input type="number" min={0} value={inputs.apiRequestsPerDay} onChange={e => onChange('apiRequestsPerDay', Number(e.target.value))} className="border rounded px-2 py-1 w-32 text-right" /></label>
          <label className="flex items-center justify-between gap-3"><span>IoT Messages / day</span><input type="number" min={0} value={inputs.iotMsgsPerDay} onChange={e => onChange('iotMsgsPerDay', Number(e.target.value))} className="border rounded px-2 py-1 w-32 text-right" /></label>
            </>)}
          </div>

          <div className="mt-4 space-y-2">
            <button className="w-full text-left text-xs font-semibold text-neutral-600" onClick={() => setOpenSections(s => ({ ...s, breakdown: !s.breakdown }))}>Monthly breakdown</button>
            {openSections.breakdown && (
            <>
              <div className="flex justify-between text-sm"><span>Platform</span><span>{currency(breakdown.base)}/mo</span></div>
              <div className="flex justify-between text-sm"><span>Crushers</span><span>{currency(breakdown.crusherCost)}/mo</span></div>
              <div className="flex justify-between text-sm"><span>Sensors</span><span>{currency(breakdown.sensorCost)}/mo</span></div>
              <div className="flex justify-between text-sm"><span>Cameras (tier)</span><span>{currency(breakdown.cameraBase)}/mo</span></div>
              <div className="flex justify-between text-sm"><span>AI Inference</span><span>{currency(Math.round(breakdown.cameraAI))}/mo</span></div>
              <div className="flex justify-between text-sm"><span>Storage</span><span>{currency(breakdown.storageCost)}/mo</span></div>
              <div className="flex justify-between text-sm"><span>Cold Backup</span><span>{currency(breakdown.backupCost)}/mo</span></div>
              <div className="flex justify-between text-sm"><span>API</span><span>{currency(Math.round(breakdown.apiCost))}/mo</span></div>
              <div className="flex justify-between text-sm"><span>IoT</span><span>{currency(Math.round(breakdown.iotCost))}/mo</span></div>
              <div className="flex justify-between text-sm"><span>Database</span><span>{currency(breakdown.dbCost)}/mo</span></div>
              <div className="border-t my-2"></div>
              <div className="flex justify-between font-semibold text-base"><span>Total</span><span>{currency(Math.round(breakdown.total))}/mo</span></div>
            </>
            )}
          </div>
        </div>
      </aside>

      {/* Right summary */}
      <main className="flex-1 p-4 md:p-6 space-y-6">
        {/* Top summary KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border bg-white dark:bg-neutral-800">
            <div className="text-xs text-neutral-500">Monthly Total</div>
            <div className="mt-2 text-2xl font-bold">{currency(Math.round(breakdown.total))}</div>
            <div className="text-xs text-neutral-500">calculated monthly total</div>
          </div>
          <div className="p-4 rounded-lg border bg-white dark:bg-neutral-800">
            <div className="text-xs text-neutral-500">Infrastructure</div>
            <div className="mt-2 text-2xl font-bold">{currency(Math.round(breakdown.crusherCost + breakdown.sensorCost + breakdown.cameraBase))}</div>
            <div className="text-xs text-neutral-500">crushers + sensors + cameras</div>
          </div>
          <div className="p-4 rounded-lg border bg-white dark:bg-neutral-800">
            <div className="text-xs text-neutral-500">Platform & Data</div>
            <div className="mt-2 text-2xl font-bold">{currency(Math.round(breakdown.base + breakdown.storageCost + breakdown.backupCost + breakdown.dbCost))}</div>
            <div className="text-xs text-neutral-500">platform + storage + DB</div>
          </div>
        </div>

        <h1 className="text-xl font-semibold">Solution Overview</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border bg-white dark:bg-neutral-800">
            <h3 className="text-sm font-semibold mb-2">Fleet</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">{inputs.crushers} crushers with {inputs.sensorsPerCrusher} sensors each, {inputs.cameras} {inputs.cameraTier.toUpperCase()} cameras.</p>
          </div>
          <div className="p-4 rounded-lg border bg-white dark:bg-neutral-800">
            <h3 className="text-sm font-semibold mb-2">Data</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">Primary storage {inputs.storageTB} TB, backups {inputs.backupTB} TB in {inputs.region}. Database: {inputs.dbTier}.</p>
          </div>
          <div className="p-4 rounded-lg border bg-white dark:bg-neutral-800 md:col-span-2">
            <h3 className="text-sm font-semibold mb-2">Traffic</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">~{inputs.apiRequestsPerDay.toLocaleString()} API requests/day, ~{inputs.iotMsgsPerDay.toLocaleString()} IoT messages/day. AI inference ~{inputs.aiInferencePerMin} ops/min per camera.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PricingCalculator;
