import React from 'react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  BarChart, Bar, Legend, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart, ReferenceLine,
} from 'recharts';
import { formatCurrency, formatCompact } from './formatters';

export const MemoAreaChart = React.memo(({
  data,
  strokeColor = 'var(--primary)',
  gridColor = 'var(--border-color)',
  axisColor = 'var(--text-muted)',
  tooltipBg = 'var(--bg-card)',
  tooltipBorder = '1px solid var(--border-color)',
  gradientId = 'colorSaldo',
}) => (
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={strokeColor} stopOpacity={0.4} />
          <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
      <XAxis dataKey="name" stroke={axisColor} fontSize={12} tickLine={false} />
      <YAxis
        stroke={axisColor}
        fontSize={12}
        tickLine={false}
        axisLine={false}
        width={65}
        tickFormatter={(val) => `R$ ${formatCompact(val)}`}
      />
      <Tooltip
        isAnimationActive={false}
        contentStyle={{
          backgroundColor: tooltipBg,
          border: tooltipBorder,
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}
        labelStyle={{ color: axisColor }}
        itemStyle={{ color: strokeColor, fontWeight: 'bold' }}
        formatter={(value) => [formatCurrency(value), 'Acumulado']}
      />
      <Area
        type="monotone"
        dataKey="Saldo"
        stroke={strokeColor}
        strokeWidth={3}
        activeDot={{ r: 6, fill: strokeColor, stroke: 'white', strokeWidth: 2 }}
        fillOpacity={1}
        fill={`url(#${gradientId})`}
      />
    </AreaChart>
  </ResponsiveContainer>
));
MemoAreaChart.displayName = 'MemoAreaChart';

export const MemoBarChart = React.memo(({
  data,
  gridColor = 'var(--border-color)',
  axisColor = 'var(--text-muted)',
  tooltipBg = 'var(--bg-card)',
  tooltipBorder = '1px solid var(--border-color)',
  cursorFill = 'rgba(255, 255, 255, 0.05)',
  successColor = '#10b981',
  dangerColor = '#ef4444',
}) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
      <XAxis dataKey="name" stroke={axisColor} fontSize={12} tickLine={false} />
      <YAxis
        stroke={axisColor}
        fontSize={12}
        tickLine={false}
        axisLine={false}
        width={65}
        tickFormatter={(val) => `R$ ${formatCompact(val)}`}
      />
      <Tooltip
        cursor={{ fill: cursorFill }}
        contentStyle={{
          backgroundColor: tooltipBg,
          border: tooltipBorder,
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}
        labelStyle={{ color: axisColor }}
        formatter={(value) => formatCurrency(value)}
      />
      <Legend wrapperStyle={{ paddingTop: '20px' }} />
      <Bar dataKey="add" name="Entradas" fill={successColor} radius={[6, 6, 0, 0]} />
      <Bar dataKey="remove" name="Saídas" fill={dangerColor} radius={[6, 6, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
));
MemoBarChart.displayName = 'MemoBarChart';

export const MemoPieChart = React.memo(({
  data,
  tooltipBg = 'var(--bg-card)',
  tooltipBorder = '1px solid var(--border-color)',
}) => (
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie
        data={data}
        innerRadius="70%"
        outerRadius="90%"
        paddingAngle={6}
        dataKey="value"
        stroke="none"
        cornerRadius={6}
      >
        {data.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={entry.name === 'Entradas' ? '#10b981' : '#ef4444'}
          />
        ))}
      </Pie>
      <Tooltip
        position={{ y: -15 }}
        contentStyle={{
          backgroundColor: tooltipBg,
          border: tooltipBorder,
          borderRadius: '12px',
          padding: '8px 16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        }}
        itemStyle={{ fontWeight: 'bold', fontSize: '1.05rem' }}
        formatter={(val) => formatCurrency(val)}
      />
    </PieChart>
  </ResponsiveContainer>
));
MemoPieChart.displayName = 'MemoPieChart';

export const MemoStackedAreaChart = React.memo((
  {
    data,
    gridColor = 'var(--border-color)',
    axisColor = 'var(--text-muted)',
    tooltipBg = 'var(--bg-card)',
    tooltipBorder = '1px solid var(--border-color)',
    gradientIdAdd = 'stackedGradAdd',
    gradientIdRemove = 'stackedGradRemove',
  }
) => (
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
      <defs>
        <linearGradient id={gradientIdAdd} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#10b981" stopOpacity={0.75} />
          <stop offset="95%" stopColor="#10b981" stopOpacity={0.15} />
        </linearGradient>
        <linearGradient id={gradientIdRemove} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.75} />
          <stop offset="95%" stopColor="#ef4444" stopOpacity={0.15} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
      <XAxis dataKey="name" stroke={axisColor} fontSize={12} tickLine={false} />
      <YAxis
        stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} width={65}
        tickFormatter={(v) => `R$ ${formatCompact(v)}`}
      />
      <Tooltip
        contentStyle={{ backgroundColor: tooltipBg, border: tooltipBorder, borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
        labelStyle={{ color: axisColor }}
        formatter={(val, key) => [formatCurrency(val), key === 'add' ? 'Entradas' : 'Saídas']}
      />
      <Legend wrapperStyle={{ paddingTop: '20px' }} formatter={(v) => v === 'add' ? 'Entradas' : 'Saídas'} />
      <Area stackId="1" type="monotone" dataKey="remove" name="remove"
        stroke="#ef4444" strokeWidth={1} fillOpacity={1} fill={`url(#${gradientIdRemove})`} />
      <Area stackId="1" type="monotone" dataKey="add" name="add"
        stroke="#10b981" strokeWidth={2} fillOpacity={1} fill={`url(#${gradientIdAdd})`} />
    </AreaChart>
  </ResponsiveContainer>
));
MemoStackedAreaChart.displayName = 'MemoStackedAreaChart';

export const MemoNetBarChart = React.memo((
  {
    data,
    gridColor = 'var(--border-color)',
    axisColor = 'var(--text-muted)',
    tooltipBg = 'var(--bg-card)',
    tooltipBorder = '1px solid var(--border-color)',
    cursorFill = 'rgba(255, 0, 0, 0.05)',
    refLineColor = 'rgba(255,255,255,0.25)',
    successColor = '#10b981',
    dangerColor = '#ef4444',
  }
) => (
  <ResponsiveContainer width="100%" height="100%">
    <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
      <XAxis dataKey="name" stroke={axisColor} fontSize={12} tickLine={false} />
      <YAxis
        stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} width={65}
        tickFormatter={(v) => `R$ ${formatCompact(v)}`}
      />
      <Tooltip
        cursor={{ fill: cursorFill }}
        contentStyle={{ backgroundColor: tooltipBg, border: tooltipBorder, borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
        labelStyle={{ color: axisColor }}
        formatter={(val) => [formatCurrency(Math.abs(val)), val >= 0 ? '↗ Superávit' : '↘ Déficit']}
      />
      <ReferenceLine y={0} stroke={refLineColor} strokeWidth={1.5} strokeDasharray="5 4" />
      <Bar dataKey="net" name="Saldo Líquido" radius={[5, 5, 0, 0]} maxBarSize={48}>
        {data.map((entry, i) => (
          <Cell key={i} fill={entry.net >= 0 ? successColor : dangerColor} fillOpacity={0.85} />
        ))}
      </Bar>
    </ComposedChart>
  </ResponsiveContainer>
));
MemoNetBarChart.displayName = 'MemoNetBarChart';
