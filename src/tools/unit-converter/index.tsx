import { useState, useMemo } from 'react';
import { Ruler, ArrowLeftRight, RefreshCw } from 'lucide-react';
import BasicToolLayout from '@/components/shared/BasicToolLayout';
import ClayFieldInput from '@/components/shared/ClayFieldInput';
import ClayButton from '@/components/shared/ClayButton';
import ClaySelect from '@/components/shared/ClaySelect';
import { cn } from '@/lib/utils';
import { unitCategories, convert, formatResult } from './utils';

export default function UnitConverter() {
  const [categoryKey, setCategoryKey] = useState('length');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('km');
  const [inputValue, setInputValue] = useState('1');

  const category = useMemo(
    () => unitCategories.find(c => c.key === categoryKey)!,
    [categoryKey]
  );

  const unitOptions = useMemo(
    () => Object.entries(category.units).map(([key, u]) => ({
      value: key,
      label: `${u.name} (${u.symbol})`,
    })),
    [category]
  );

  const result = useMemo(() => {
    const num = parseFloat(inputValue);
    if (isNaN(num)) return '';
    const converted = convert(num, fromUnit, toUnit, categoryKey);
    return formatResult(converted);
  }, [inputValue, fromUnit, toUnit, categoryKey]);

  const handleCategoryChange = (key: string) => {
    setCategoryKey(key);
    const cat = unitCategories.find(c => c.key === key)!;
    const unitKeys = Object.keys(cat.units);
    setFromUnit(unitKeys[0]);
    setToUnit(unitKeys.length > 1 ? unitKeys[1] : unitKeys[0]);
    setInputValue('1');
  };

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const handleReset = () => {
    setInputValue('1');
    const cat = unitCategories.find(c => c.key === categoryKey)!;
    const unitKeys = Object.keys(cat.units);
    setFromUnit(unitKeys[0]);
    setToUnit(unitKeys.length > 1 ? unitKeys[1] : unitKeys[0]);
  };

  return (
    <BasicToolLayout
      title="单位转换"
      description="长度、重量、温度等多种单位实时换算"
      icon={<Ruler className="w-7 h-7" />}
    >
      {/* 分类选择器 */}
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar -mx-1 px-1">
        {unitCategories.map(cat => (
          <button
            key={cat.key}
            onClick={() => handleCategoryChange(cat.key)}
            className={cn(
              'shrink-0 px-4 py-2 rounded-2xl text-xs font-bold spring-transition whitespace-nowrap',
              categoryKey === cat.key
                ? 'bg-clay-green-deep text-white shadow-clay'
                : 'bg-surface-container-low dark:bg-black/20 text-on-surface-variant shadow-clay-inset hover:shadow-clay hover:text-on-surface'
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* 转换区域 */}
      <div className="flex items-end gap-2 md:gap-3">
        {/* 左侧：输入 */}
        <div className="flex-1 flex flex-col gap-2">
          <ClayFieldInput
            label="输入值"
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="输入数值..."
            size="md"
          />
          <ClaySelect
            options={unitOptions}
            value={fromUnit}
            onChange={setFromUnit}
            size="sm"
          />
        </div>

        {/* 中间：交换按钮 */}
        <div className="flex flex-col items-center gap-1 pb-1">
          <button
            onClick={handleSwap}
            className={cn(
              'w-10 h-10 rounded-2xl flex items-center justify-center spring-transition',
              'bg-clay-green-deep text-white shadow-clay hover:shadow-clay-hover active:scale-90'
            )}
            title="交换单位"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>

        {/* 右侧：结果 */}
        <div className="flex-1 flex flex-col gap-2">
          <ClayFieldInput
            label="转换结果"
            type="text"
            value={result}
            readOnly
            placeholder="--"
            size="md"
            className="bg-surface-container dark:bg-surface-container cursor-default"
          />
          <ClaySelect
            options={unitOptions}
            value={toUnit}
            onChange={setToUnit}
            size="sm"
          />
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <ClayButton variant="secondary" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={handleReset}>
          重置
        </ClayButton>
      </div>

      {/* 参考表 */}
      <div className="bg-surface-container-low dark:bg-black/20 rounded-2xl p-4 shadow-clay-inset">
        <span className="text-xs font-semibold tracking-wider text-primary dark:text-clay-green-main mb-3 block">
          参考换算 · 1 {category.units[fromUnit]?.name} = ?
        </span>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {Object.entries(category.units)
            .filter(([key]) => key !== fromUnit)
            .map(([key, u]) => {
              const val = convert(1, fromUnit, key, categoryKey);
              return (
                <div
                  key={key}
                  className={cn(
                    'flex flex-col px-3 py-2 rounded-xl',
                    'bg-surface dark:bg-black/30 shadow-clay-inset',
                    key === toUnit && 'ring-1 ring-primary/30'
                  )}
                >
                  <span className="text-[10px] text-on-surface-variant">{u.name}</span>
                  <span className="text-xs font-mono text-on-surface font-medium truncate">
                    {formatResult(val)} <span className="text-on-surface-variant">{u.symbol}</span>
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </BasicToolLayout>
  );
}
