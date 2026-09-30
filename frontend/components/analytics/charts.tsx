'use client'

import React, { memo } from 'react'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export const RevenueChart = memo(({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height={320}>
    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
      <defs>
        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
        </linearGradient>
        <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
        </linearGradient>
        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
          <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#222" opacity={0.3} />
      <XAxis dataKey="month" stroke="#666" style={{ fontSize: '12px' }} />
      <YAxis stroke="#666" style={{ fontSize: '12px' }} />
      <Tooltip
        contentStyle={{ 
          backgroundColor: '#0f1419', 
          border: '1px solid rgba(79, 70, 229, 0.3)',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)'
        }}
        labelStyle={{ color: '#fff', fontWeight: 'bold' }}
      />
      <Legend wrapperStyle={{ paddingTop: '20px' }} />
      <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" dot={{ fill: '#4f46e5', r: 5 }} activeDot={{ r: 7 }} />
      <Area type="monotone" dataKey="expenses" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorExpenses)" dot={{ fill: '#f59e0b', r: 5 }} activeDot={{ r: 7 }} />
      <Area type="monotone" dataKey="profit" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" dot={{ fill: '#22c55e', r: 5 }} activeDot={{ r: 7 }} />
    </AreaChart>
  </ResponsiveContainer>
))

export const TaskChart = memo(({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height={260}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={({ name, value }) => `${name}: ${value}%`}
        outerRadius={90}
        innerRadius={50}
        fill="#8884d8"
        dataKey="value"
        paddingAngle={2}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.fill} />
        ))}
      </Pie>
      <Tooltip
        contentStyle={{ 
          backgroundColor: '#0f1419', 
          border: '1px solid rgba(79, 70, 229, 0.3)',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)'
        }}
        labelStyle={{ color: '#fff', fontWeight: 'bold' }}
      />
    </PieChart>
  </ResponsiveContainer>
))

export const PerformanceChart = memo(({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height={320}>
    <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
      <defs>
        <linearGradient id="barRevenue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4f46e5" stopOpacity={1}/>
          <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.6}/>
        </linearGradient>
        <linearGradient id="barExpenses" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity={1}/>
          <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.6}/>
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#222" opacity={0.3} />
      <XAxis dataKey="month" stroke="#666" style={{ fontSize: '12px' }} />
      <YAxis stroke="#666" style={{ fontSize: '12px' }} />
      <Tooltip
        contentStyle={{ 
          backgroundColor: '#0f1419', 
          border: '1px solid rgba(79, 70, 229, 0.3)',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)'
        }}
        labelStyle={{ color: '#fff', fontWeight: 'bold' }}
        cursor={{ fill: 'rgba(79, 70, 229, 0.1)' }}
      />
      <Legend wrapperStyle={{ paddingTop: '20px' }} />
      <Bar dataKey="revenue" fill="url(#barRevenue)" radius={[4, 4, 0, 0]} maxBarSize={50} />
      <Bar dataKey="expenses" fill="url(#barExpenses)" radius={[4, 4, 0, 0]} maxBarSize={50} />
    </BarChart>
  </ResponsiveContainer>
))
