import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { Shield, Check, X, Mail, Clock, RefreshCw, Plus } from 'lucide-react';

interface UserData {
  id: string;
  username: string;
  email: string | null;
  role: string;
  is_active: number;
  created_at: string;
}

export function AdminDashboard() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();

  const [showCreate, setShowCreate] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('user');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          logout();
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch users');
      }
      const data = await res.json();
      setUsers(data.users);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [user, token, navigate]);

  const toggleStatus = async (userId: string, currentStatus: number, email: string | null) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      let sendEmail = false;
      
      if (newStatus === 1 && email) {
        sendEmail = window.confirm(`Send an 'account activated' email to ${email}?`);
      }
      
      const res = await fetch(`/api/auth/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: newStatus, send_email: sendEmail })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update user status');
      }
      
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) return;
    
    try {
      const res = await fetch('/api/auth/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: newUsername,
          password: newPassword,
          email: newEmail,
          role: newRole,
          is_active: 1 // Admins creating users make them active by default
        })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create user');
      }
      
      setShowCreate(false);
      setNewUsername('');
      setNewPassword('');
      setNewEmail('');
      setNewRole('user');
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Admin Dashboard</h1>
              <p className="text-sm text-[#888]">Manage users and access permissions</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-colors"
            >
              <Plus size={16} />
              Create User
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#222] border border-[#333] rounded-lg text-sm font-bold transition-colors"
            >
              Back to Editor
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-sm font-bold transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {showCreate && (
          <div className="bg-[#141414] border border-[#222] rounded-xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-cyan-500"></div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Create New User</h2>
              <button onClick={() => setShowCreate(false)} className="text-[#666] hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#888] uppercase">Username</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="Enter username"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#888] uppercase">Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="Enter temporary password"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#888] uppercase">Email (Optional)</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="user@example.com"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#888] uppercase">Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="user">Standard User</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              
              <div className="md:col-span-2 flex justify-end mt-2">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-bold transition-colors"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-[#141414] border border-[#222] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#222] flex justify-between items-center bg-[#1A1A1A]">
            <h2 className="font-bold">Registered Users</h2>
            <button 
              onClick={fetchUsers}
              className="p-1.5 hover:bg-[#2A2A2A] rounded-lg text-[#888] hover:text-white transition-colors"
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0F0F0F] text-xs uppercase tracking-wider text-[#666]">
                  <th className="p-4 font-bold border-b border-[#222]">Username</th>
                  <th className="p-4 font-bold border-b border-[#222]">Email</th>
                  <th className="p-4 font-bold border-b border-[#222]">Role</th>
                  <th className="p-4 font-bold border-b border-[#222]">Joined</th>
                  <th className="p-4 font-bold border-b border-[#222]">Status</th>
                  <th className="p-4 font-bold border-b border-[#222] text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#666]">Loading users...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#666]">No users found</td>
                  </tr>
                ) : (
                  users.map(u => (
                    <tr key={u.id} className="border-b border-[#1A1A1A] hover:bg-[#1A1A1A]/50 transition-colors">
                      <td className="p-4 font-bold">
                        {u.username}
                        {u.username === 'jatelo' && <span className="ml-2 px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] uppercase rounded">System</span>}
                      </td>
                      <td className="p-4 text-sm text-[#888] flex items-center gap-2">
                        <Mail size={14} className="opacity-50" />
                        {u.email || '-'}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-[#222] text-[#AAA]'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-[#888] flex items-center gap-1.5">
                        <Clock size={14} className="opacity-50" />
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold flex items-center w-fit gap-1 ${
                          u.is_active 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {u.is_active ? <Check size={12}/> : <Clock size={12}/>}
                          {u.is_active ? 'Active' : 'Pending'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {u.username !== 'jatelo' && (
                          <button
                            onClick={() => toggleStatus(u.id, u.is_active, u.email)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                              u.is_active 
                                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                            }`}
                          >
                            {u.is_active ? 'Deactivate' : 'Approve & Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
