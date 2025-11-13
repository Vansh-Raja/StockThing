'use client';

import { useState, useEffect } from 'react';
import { accountAPI } from '@/lib/api';
import AccountForm from './AccountForm';

interface Account {
  id: number;
  account_name: string;
  account_type: string;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deletingAccountId, setDeletingAccountId] = useState<number | null>(null);

  const loadAccounts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await accountAPI.getAll();
      setAccounts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load accounts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleCreateClick = () => {
    setEditingAccount(null);
    setShowForm(true);
  };

  const handleEditClick = (account: Account) => {
    setEditingAccount(account);
    setShowForm(true);
  };

  const handleDeleteClick = async (accountId: number) => {
    if (!confirm(`Are you sure you want to delete "${accounts.find(a => a.id === accountId)?.account_name}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingAccountId(accountId);
    try {
      await accountAPI.delete(accountId);
      await loadAccounts();
    } catch (err: any) {
      alert(err.message || 'Failed to delete account');
    } finally {
      setDeletingAccountId(null);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingAccount(null);
    loadAccounts();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingAccount(null);
  };

  const getAccountTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      individual: 'Individual',
      HUF: 'HUF',
      joint: 'Joint',
      trust: 'Trust',
      other: 'Other',
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <svg className="animate-spin h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Share Accounts</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage your share accounts for organizing investments
          </p>
        </div>
        {!showForm && (
          <button
            onClick={handleCreateClick}
            className="px-4 py-2 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-all duration-200 shadow-md shadow-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/40 active:scale-[0.98]"
          >
            + Create Account
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingAccount ? 'Edit Account' : 'Create New Account'}
          </h3>
          <AccountForm
            account={editingAccount}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Accounts List */}
      {accounts.length === 0 && !showForm ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No accounts yet</h3>
          <p className="mt-2 text-sm text-gray-500">
            Get started by creating your first share account
          </p>
          <button
            onClick={handleCreateClick}
            className="mt-6 px-4 py-2 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-all duration-200 shadow-md shadow-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/40 active:scale-[0.98]"
          >
            Create Account
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account Type
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {account.account_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                        {getAccountTypeLabel(account.account_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEditClick(account)}
                          className="text-indigo-600 hover:text-indigo-900 transition-all duration-200 hover:underline active:scale-95"
                        >
                          Edit
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => handleDeleteClick(account.id)}
                          disabled={deletingAccountId === account.id}
                          className="text-red-600 hover:text-red-900 transition-all duration-200 hover:underline active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingAccountId === account.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

