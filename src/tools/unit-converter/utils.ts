// 单位定义
export interface UnitDef {
  name: string;
  symbol: string;
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
}

export interface UnitCategory {
  name: string;
  key: string;
  baseUnit: string;
  units: Record<string, UnitDef>;
}

// ─── 长度 (base: 米 m) ───
const lengthUnits: Record<string, UnitDef> = {
  mm:  { name: '毫米', symbol: 'mm',  toBase: v => v * 0.001,       fromBase: v => v / 0.001 },
  cm:  { name: '厘米', symbol: 'cm',  toBase: v => v * 0.01,        fromBase: v => v / 0.01 },
  m:   { name: '米',   symbol: 'm',   toBase: v => v,               fromBase: v => v },
  km:  { name: '千米', symbol: 'km',  toBase: v => v * 1000,        fromBase: v => v / 1000 },
  in:  { name: '英寸', symbol: 'in',  toBase: v => v * 0.0254,      fromBase: v => v / 0.0254 },
  ft:  { name: '英尺', symbol: 'ft',  toBase: v => v * 0.3048,      fromBase: v => v / 0.3048 },
  yd:  { name: '码',   symbol: 'yd',  toBase: v => v * 0.9144,      fromBase: v => v / 0.9144 },
  mi:  { name: '英里', symbol: 'mi',  toBase: v => v * 1609.344,    fromBase: v => v / 1609.344 },
  nmi: { name: '海里', symbol: 'nmi', toBase: v => v * 1852,        fromBase: v => v / 1852 },
  li:  { name: '里',   symbol: '里',  toBase: v => v * 500,         fromBase: v => v / 500 },
  zhang: { name: '丈', symbol: '丈',  toBase: v => v * 10 / 3,      fromBase: v => v * 3 / 10 },
  chi:   { name: '尺', symbol: '尺',  toBase: v => v * 10 / 30,     fromBase: v => v * 30 / 10 },
  cun:   { name: '寸', symbol: '寸',  toBase: v => v * 10 / 300,    fromBase: v => v * 300 / 10 },
};

// ─── 重量 (base: 千克 kg) ───
const weightUnits: Record<string, UnitDef> = {
  mg:  { name: '毫克', symbol: 'mg',  toBase: v => v * 0.000001,    fromBase: v => v / 0.000001 },
  g:   { name: '克',   symbol: 'g',   toBase: v => v * 0.001,       fromBase: v => v / 0.001 },
  kg:  { name: '千克', symbol: 'kg',  toBase: v => v,               fromBase: v => v },
  t:   { name: '吨',   symbol: 't',   toBase: v => v * 1000,        fromBase: v => v / 1000 },
  lb:  { name: '磅',   symbol: 'lb',  toBase: v => v * 0.45359237,  fromBase: v => v / 0.45359237 },
  oz:  { name: '盎司', symbol: 'oz',  toBase: v => v * 0.028349523, fromBase: v => v / 0.028349523 },
  jin: { name: '斤',   symbol: '斤',  toBase: v => v * 0.5,         fromBase: v => v / 0.5 },
  liang: { name: '两', symbol: '两',  toBase: v => v * 0.05,        fromBase: v => v / 0.05 },
};

// ─── 温度 (特殊转换) ───
const temperatureUnits: Record<string, UnitDef> = {
  C: {
    name: '摄氏度', symbol: '°C',
    toBase: v => v,
    fromBase: v => v,
  },
  F: {
    name: '华氏度', symbol: '°F',
    toBase: v => (v - 32) * 5 / 9,
    fromBase: v => v * 9 / 5 + 32,
  },
  K: {
    name: '开尔文', symbol: 'K',
    toBase: v => v - 273.15,
    fromBase: v => v + 273.15,
  },
};

// ─── 面积 (base: 平方米 m²) ───
const areaUnits: Record<string, UnitDef> = {
  mm2:  { name: '平方毫米', symbol: 'mm²',  toBase: v => v * 1e-6,       fromBase: v => v / 1e-6 },
  cm2:  { name: '平方厘米', symbol: 'cm²',  toBase: v => v * 1e-4,       fromBase: v => v / 1e-4 },
  m2:   { name: '平方米',   symbol: 'm²',   toBase: v => v,              fromBase: v => v },
  km2:  { name: '平方千米', symbol: 'km²',  toBase: v => v * 1e6,        fromBase: v => v / 1e6 },
  ha:   { name: '公顷',     symbol: 'ha',   toBase: v => v * 10000,      fromBase: v => v / 10000 },
  mu:   { name: '亩',       symbol: '亩',   toBase: v => v * 666.667,    fromBase: v => v / 666.667 },
  acre: { name: '英亩',     symbol: 'acre', toBase: v => v * 4046.856,   fromBase: v => v / 4046.856 },
  ft2:  { name: '平方英尺', symbol: 'ft²',  toBase: v => v * 0.092903,   fromBase: v => v / 0.092903 },
  mi2:  { name: '平方英里', symbol: 'mi²',  toBase: v => v * 2589988.11, fromBase: v => v / 2589988.11 },
};

// ─── 体积 (base: 升 L) ───
const volumeUnits: Record<string, UnitDef> = {
  mL:   { name: '毫升',   symbol: 'mL',   toBase: v => v * 0.001,       fromBase: v => v / 0.001 },
  L:    { name: '升',     symbol: 'L',    toBase: v => v,               fromBase: v => v },
  m3:   { name: '立方米', symbol: 'm³',   toBase: v => v * 1000,        fromBase: v => v / 1000 },
  gal:  { name: '加仑',   symbol: 'gal',  toBase: v => v * 3.78541,     fromBase: v => v / 3.78541 },
  pt:   { name: '品脱',   symbol: 'pt',   toBase: v => v * 0.473176,    fromBase: v => v / 0.473176 },
  ft3:  { name: '立方英尺', symbol: 'ft³', toBase: v => v * 28.3168,     fromBase: v => v / 28.3168 },
};

// ─── 速度 (base: 米/秒 m/s) ───
const speedUnits: Record<string, UnitDef> = {
  ms:    { name: '米/秒',   symbol: 'm/s',    toBase: v => v,              fromBase: v => v },
  kmh:   { name: '千米/时', symbol: 'km/h',   toBase: v => v / 3.6,        fromBase: v => v * 3.6 },
  mph:   { name: '英里/时', symbol: 'mph',    toBase: v => v * 0.44704,    fromBase: v => v / 0.44704 },
  kn:    { name: '节',      symbol: 'kn',     toBase: v => v * 0.514444,   fromBase: v => v / 0.514444 },
  mach:  { name: '马赫',    symbol: 'Ma',     toBase: v => v * 340.29,     fromBase: v => v / 340.29 },
};

// ─── 数据存储 (base: Byte) ───
const dataUnits: Record<string, UnitDef> = {
  bit:  { name: 'bit',  symbol: 'bit',  toBase: v => v / 8,          fromBase: v => v * 8 },
  B:    { name: 'Byte', symbol: 'B',    toBase: v => v,              fromBase: v => v },
  KB:   { name: 'KB',   symbol: 'KB',   toBase: v => v * 1024,       fromBase: v => v / 1024 },
  MB:   { name: 'MB',   symbol: 'MB',   toBase: v => v * 1048576,    fromBase: v => v / 1048576 },
  GB:   { name: 'GB',   symbol: 'GB',   toBase: v => v * 1073741824, fromBase: v => v / 1073741824 },
  TB:   { name: 'TB',   symbol: 'TB',   toBase: v => v * 1099511627776, fromBase: v => v / 1099511627776 },
  PB:   { name: 'PB',   symbol: 'PB',   toBase: v => v * 1125899906842624, fromBase: v => v / 1125899906842624 },
};

// ─── 时间 (base: 秒 s) ───
const timeUnits: Record<string, UnitDef> = {
  ms:   { name: '毫秒',       symbol: 'ms',   toBase: v => v / 1000,       fromBase: v => v * 1000 },
  s:    { name: '秒',         symbol: 's',    toBase: v => v,              fromBase: v => v },
  min:  { name: '分钟',       symbol: 'min',  toBase: v => v * 60,         fromBase: v => v / 60 },
  h:    { name: '小时',       symbol: 'h',    toBase: v => v * 3600,       fromBase: v => v / 3600 },
  d:    { name: '天',         symbol: 'd',    toBase: v => v * 86400,      fromBase: v => v / 86400 },
  wk:   { name: '周',         symbol: 'wk',   toBase: v => v * 604800,     fromBase: v => v / 604800 },
  mo:   { name: '月(30天)',   symbol: 'mo',   toBase: v => v * 2592000,    fromBase: v => v / 2592000 },
  yr:   { name: '年(365天)',  symbol: 'yr',   toBase: v => v * 31536000,   fromBase: v => v / 31536000 },
};

// ─── 压力 (base: 帕斯卡 Pa) ───
const pressureUnits: Record<string, UnitDef> = {
  Pa:   { name: '帕斯卡',       symbol: 'Pa',   toBase: v => v,              fromBase: v => v },
  kPa:  { name: '千帕',         symbol: 'kPa',  toBase: v => v * 1000,       fromBase: v => v / 1000 },
  MPa:  { name: '兆帕',         symbol: 'MPa',  toBase: v => v * 1000000,    fromBase: v => v / 1000000 },
  bar:  { name: '巴',           symbol: 'bar',  toBase: v => v * 100000,     fromBase: v => v / 100000 },
  atm:  { name: '大气压',       symbol: 'atm',  toBase: v => v * 101325,     fromBase: v => v / 101325 },
  mmHg: { name: '毫米汞柱',     symbol: 'mmHg', toBase: v => v * 133.322,    fromBase: v => v / 133.322 },
  psi:  { name: '磅/平方英寸',  symbol: 'psi',  toBase: v => v * 6894.757,   fromBase: v => v / 6894.757 },
};

// 所有分类
export const unitCategories: UnitCategory[] = [
  { name: '长度', key: 'length', baseUnit: 'm', units: lengthUnits },
  { name: '重量', key: 'weight', baseUnit: 'kg', units: weightUnits },
  { name: '温度', key: 'temperature', baseUnit: 'C', units: temperatureUnits },
  { name: '面积', key: 'area', baseUnit: 'm2', units: areaUnits },
  { name: '体积', key: 'volume', baseUnit: 'L', units: volumeUnits },
  { name: '速度', key: 'speed', baseUnit: 'ms', units: speedUnits },
  { name: '数据存储', key: 'data', baseUnit: 'B', units: dataUnits },
  { name: '时间', key: 'time', baseUnit: 's', units: timeUnits },
  { name: '压力', key: 'pressure', baseUnit: 'Pa', units: pressureUnits },
];

// 转换函数
export function convert(value: number, fromUnit: string, toUnit: string, category: string): number {
  const cat = unitCategories.find(c => c.key === category);
  if (!cat) return NaN;

  const from = cat.units[fromUnit];
  const to = cat.units[toUnit];
  if (!from || !to) return NaN;

  const baseValue = from.toBase(value);
  return to.fromBase(baseValue);
}

// 格式化数字，避免过长的小数
export function formatResult(value: number): string {
  if (isNaN(value) || !isFinite(value)) return '--';
  if (value === 0) return '0';

  const abs = Math.abs(value);
  if (abs >= 1e15 || (abs < 1e-10 && abs > 0)) {
    return value.toExponential(6);
  }

  // 根据数值大小决定小数位数
  let digits = 8;
  if (abs >= 1000) digits = 4;
  else if (abs >= 1) digits = 6;

  const result = parseFloat(value.toFixed(digits));
  return result.toLocaleString('en-US', { maximumFractionDigits: digits });
}
