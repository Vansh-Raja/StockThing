'use client';

import { useState, useEffect } from 'react';

interface Account {
  id: number;
  account_name: string;
  account_type: string;
}

interface AccountFormProps {
  account?: Account | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const ACCOUNT_TYPES = [
  { value: 'individual', label: 'Individual' },
  { value: 'HUF', label: 'HUF' },
  { value: 'joint', label: 'Joint' },
  { value: 'trust', label: 'Trust' },
  { value: 'other', label: 'Other' },
];

export default function AccountForm({ account, onSuccess, onCancel }: AccountFormProps) {
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState('individual');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (account) {
      setAccountName(account.account_name);
      setAccountType(account.account_type);
    } else {
      setAccountName('');
      setAccountType('individual');
    }
    setError(null);
  }, [account]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!accountName.trim()) {
      setError('Account name is required');
      setIsSubmitting(false);
      return;
    }

    try {
      const { accountAPI } = await import('@/lib/api');
      
      if (account) {
        // Update existing account
        await accountAPI.update(account.id, {
          account_name: accountName.trim(),
          account_type: accountType,
        });
      } else {
        // Create new account
        await accountAPI.create({
          account_name: accountName.trim(),
          account_type: accountType,
        });
      }
      
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="accountName" className="block text-sm font-medium text-gray-700 mb-2">
          Account Name <span className="text-red-500">*</span>
        </label>
        <input
          id="accountName"
          type="text"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          required
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          placeholder="e.g., John's Account"
        />
      </div>

      <div>
        <label htmlFor="accountType" className="block text-sm font-medium text-gray-700 mb-2">
          Account Type <span className="text-red-500">*</span>
        </label>
        <select
          id="accountType"
          value={accountType}
          onChange={(e) => setAccountType(e.target.value)}
          required
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
        >
          {ACCOUNT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex space-x-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200 hover:shadow-sm active:scale-95"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-all duration-200 shadow-md shadow-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/40 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600 disabled:hover:shadow-md"
        >
          {isSubmitting ? 'Saving...' : account ? 'Update Account' : 'Create Account'}
        </button>
      </div>
    </form>
  );
}

