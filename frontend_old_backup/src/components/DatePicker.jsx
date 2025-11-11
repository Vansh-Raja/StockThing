import { formatDateForInput, getCurrentDateTime } from '../utils/dateUtils';

export default function DatePicker({ value, onChange, label, required = false }) {
  const handleChange = (e) => {
    const dateTimeString = e.target.value;
    // Convert local datetime to ISO string
    if (dateTimeString) {
      const date = new Date(dateTimeString);
      onChange(date.toISOString());
    } else {
      onChange('');
    }
  };

  const displayValue = value ? formatDateForInput(value) : formatDateForInput(getCurrentDateTime());

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type="datetime-local"
        value={displayValue}
        onChange={handleChange}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
      />
    </div>
  );
}

