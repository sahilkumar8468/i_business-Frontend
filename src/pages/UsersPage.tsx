import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Users, Plus, Loader2, Shield, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import axios from 'axios';

// Assuming we have an auth header interceptor set up in api.ts or we pass it manually
const API_URL = 'http://localhost:5000/users';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New User Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('employee');
  const [isCreating, setIsCreating] = useState(false);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [selectedBusinessIds, setSelectedBusinessIds] = useState<string[]>([]);

  const [currentUser, setCurrentUser] = useState<any>(null);

  const { t, isRTL } = useLanguage();
  const { theme } = useTheme();

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch current user profile first
      if (!currentUser) {
        const meRes = await axios.get(`${API_URL}/me`, { headers: { Authorization: `Bearer ${token}` } });
        setCurrentUser(meRes.data);
      }

      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);

      // Fetch businesses for assignment
      const bizRes = await axios.get('http://localhost:5000/businesses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBusinesses(bizRes.data);
    } catch (err: any) {
      toast.error('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !displayName) {
      toast.error('Please fill out all fields');
      return;
    }

    try {
      setIsCreating(true);
      const token = localStorage.getItem('token');
      await axios.post(API_URL, {
        username,
        password,
        displayName,
        role,
        businessIds: role === 'employee' ? selectedBusinessIds : []
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('User created successfully!');
      setIsModalOpen(false);
      setUsername('');
      setPassword('');
      setDisplayName('');
      setRole('employee');
      setSelectedBusinessIds([]);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create user');
    } finally {
      setIsCreating(false);
    }
  };

  const [assigningUser, setAssigningUser] = useState<any>(null);
  const [assignBusinessIds, setAssignBusinessIds] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssignBusinesses = async () => {
    if (!assigningUser) return;
    try {
      setIsAssigning(true);
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/${assigningUser.id}/assign-businesses`, 
        { businessIds: assignBusinessIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`${assigningUser.displayName} assigned to ${assignBusinessIds.length} business(es)!`);
      setAssigningUser(null);
      setAssignBusinessIds([]);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to assign businesses');
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <DashboardLayout>
      <div className={`space-y-8 ${isRTL ? 'text-right' : ''}`}>
        <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">User Management</h1>
            <p className="text-slate-500 dark:text-slate-400">Create and manage your employees and admins.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2 px-6"
          >
            <Plus size={20} />
            Add User
          </button>
        </div>

        {/* Users List */}
        <div className="card dark:bg-slate-800 dark:border-slate-700 p-0 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="animate-spin text-primary" size={48} />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-24 flex flex-col items-center">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-full text-slate-300 dark:text-slate-700 mb-4">
                <Users size={64} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">No users created yet</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Start adding employees or admins to your system.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className={`w-full ${isRTL ? 'text-right' : 'text-left'}`}>
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">User</th>
                    <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Username</th>
                    <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Role</th>
                    <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Created</th>
                    <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors text-[var(--color-txt-main)]">
                      <td className="p-4">
                        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                            {user.displayName?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold">{user.displayName}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{user.username || user.email}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' 
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {user.role === 'admin' ? <Shield size={14} /> : <User size={14} />}
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-500">
                        {new Date(user.createdAt?._seconds ? user.createdAt._seconds * 1000 : user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        {user.role === 'employee' && (
                          <button
                            onClick={() => {
                              setAssigningUser(user);
                              setAssignBusinessIds([]);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-xs font-bold transition-colors"
                          >
                            <Plus size={14} />
                            Assign Business
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Create New User</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8">Assign system access with specific roles.</p>
              
              <form onSubmit={handleCreateUser} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                  <input 
                    autoFocus
                    type="text" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-[var(--color-txt-main)]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Username (e.g. bg123)</label>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="bg123"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-[var(--color-txt-main)]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Password</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Secure password"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-[var(--color-txt-main)]"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">System Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-[var(--color-txt-main)]"
                  >
                    <option value="employee">Employee (Limited Access)</option>
                    {currentUser?.role === 'super_admin' && <option value="admin">Admin (Manage Systems & Users)</option>}
                  </select>
                </div>

                {role === 'employee' && (
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Assign to Businesses</label>
                    <div className="max-h-40 overflow-y-auto p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                      {businesses.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">No businesses available to assign.</p>
                      ) : (
                        businesses.map(biz => (
                          <label key={biz.id} className="flex items-center gap-3 cursor-pointer group">
                            <input 
                              type="checkbox" 
                              checked={selectedBusinessIds.includes(biz.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedBusinessIds([...selectedBusinessIds, biz.id]);
                                } else {
                                  setSelectedBusinessIds(selectedBusinessIds.filter(id => id !== biz.id));
                                }
                              }}
                              className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                            />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">{biz.name}</span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                )}

                <div className={`flex gap-3 pt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isCreating}
                    className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all flex items-center justify-center"
                  >
                    {isCreating ? <Loader2 size={20} className="animate-spin" /> : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Assign Business Modal */}
      {assigningUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[var(--color-surface)] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Assign Businesses</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Select businesses to give <span className="font-bold text-primary">{assigningUser.displayName}</span> access to.
              </p>
              <div className="max-h-60 overflow-y-auto space-y-2 mb-6 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                {businesses.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-4">No businesses found.</p>
                ) : (
                  businesses.map(biz => (
                    <label key={biz.id} className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors">
                      <input 
                        type="checkbox" 
                        checked={assignBusinessIds.includes(biz.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAssignBusinessIds([...assignBusinessIds, biz.id]);
                          } else {
                            setAssignBusinessIds(assignBusinessIds.filter(id => id !== biz.id));
                          }
                        }}
                        className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                      />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">{biz.name}</span>
                    </label>
                  ))
                )}
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => { setAssigningUser(null); setAssignBusinessIds([]); }}
                  className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAssignBusinesses}
                  disabled={isAssigning || assignBusinessIds.length === 0}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all flex items-center justify-center disabled:opacity-50"
                >
                  {isAssigning ? <Loader2 size={20} className="animate-spin" /> : `Assign (${assignBusinessIds.length})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default UsersPage;
