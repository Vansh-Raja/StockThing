'use client';

interface AccountPillProps {
  accountName: string;
  quantity: number;
  percentage: number;
}

export default function AccountPill({ accountName, quantity, percentage }: AccountPillProps) {
  return (
    <div className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 text-xs font-semibold">
      {accountName}: {quantity} ({percentage.toFixed(1)}%)
    </div>
  );
}

