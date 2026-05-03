"use client";

import * as React from "react";

interface TabsProps {
  value: string;
  onValueChange: (v: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ value, onValueChange, children, className = "" }: TabsProps) {
  return (
    <div className={className} data-tabs-value={value} data-ontabchange={onValueChange as unknown as string}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child as React.ReactElement<{ _activeTab?: string; _onTabChange?: (v: string) => void }>, {
          _activeTab: value,
          _onTabChange: onValueChange,
        });
      })}
    </div>
  );
}

export function TabsList({ children, className = "", _activeTab, _onTabChange }: {
  children: React.ReactNode; className?: string;
  _activeTab?: string; _onTabChange?: (v: string) => void;
}) {
  return (
    <div className={`inline-flex rounded-lg bg-muted p-0.5 ${className}`}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child as React.ReactElement<{ _activeTab?: string; _onTabChange?: (v: string) => void }>, {
          _activeTab, _onTabChange,
        });
      })}
    </div>
  );
}

export function TabsTrigger({ value, children, className = "", _activeTab, _onTabChange }: {
  value: string; children: React.ReactNode; className?: string;
  _activeTab?: string; _onTabChange?: (v: string) => void;
}) {
  const active = _activeTab === value;
  return (
    <button
      onClick={() => _onTabChange?.(value)}
      className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? "bg-card text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className = "", _activeTab }: {
  value: string; children: React.ReactNode; className?: string; _activeTab?: string;
}) {
  if (_activeTab !== value) return null;
  return <div className={className}>{children}</div>;
}
