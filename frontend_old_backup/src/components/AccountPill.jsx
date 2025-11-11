const accountColors = {
  'Rahul': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'Amit': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Amit HUF': 'bg-purple-100 text-purple-700 border-purple-200',
};

const getAccountColor = (accountName) => {
  return accountColors[accountName] || 'bg-gray-100 text-gray-700 border-gray-200';
};

export default function AccountPill({ accountName, quantity, percentage }) {
  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border ${getAccountColor(accountName)}`}>
      <span className="font-bold">{quantity}</span>
      <span className="mx-1.5">·</span>
      <span>{accountName}</span>
      {percentage !== undefined && (
        <span className="ml-1.5 text-gray-500 font-normal">({percentage.toFixed(1)}%)</span>
      )}
    </span>
  );
}

