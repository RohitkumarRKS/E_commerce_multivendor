import { useState, useEffect } from 'react';
import { FiMail, FiCheckCircle, FiXCircle, FiClock, FiEye, FiSend, FiRefreshCw, FiSliders, FiShield, FiX, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { emailAPI } from '../../services/api';
import { formatDate } from '../../utils/helpers';

const EmailManagerPage = () => {
  const [activeTab, setActiveTab] = useState('logs'); // 'logs' | 'settings'
  const [logs, setLogs] = useState([]);
  const [settings, setSettings] = useState({
    enable_welcome_email: 'true',
    enable_order_confirmation_email: 'true',
    enable_order_status_email: 'true',
    enable_return_request_email: 'true',
    enable_refund_processed_email: 'true',
  });
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [testEmail, setTestEmail] = useState('');
  const [testSending, setTestSending] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');

  const fetchLogs = async () => {
    try {
      const res = await emailAPI.getLogs({ type: typeFilter });
      setLogs(res.data.data.logs || []);
    } catch (err) {
      console.error('Failed to load email logs:', err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await emailAPI.getSettings();
      setSettings(res.data.data.settings || {});
    } catch (err) {
      console.error('Failed to load email settings:', err);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchLogs(), fetchSettings()]);
      setLoading(false);
    };
    loadAll();
  }, [typeFilter]);

  const handleToggleSetting = (key) => {
    const currentValue = settings[key] === 'true' || settings[key] === '1';
    setSettings({
      ...settings,
      [key]: currentValue ? 'false' : 'true',
    });
  };

  const handleSaveSettings = async () => {
    try {
      await emailAPI.updateSettings({ settings });
      toast.success('Email notification settings saved successfully!');
    } catch (err) {
      toast.error('Failed to update email settings');
    }
  };

  const handleSendTestEmail = async (e) => {
    e.preventDefault();
    if (!testEmail) return;

    setTestSending(true);
    try {
      await emailAPI.sendTest({ email: testEmail });
      toast.success(`Test email sent to ${testEmail}! Check inbox/logs.`);
      fetchLogs();
    } catch (err) {
      toast.error('Failed to send test email');
    } finally {
      setTestSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiMail className="text-blue-600" /> Mail Activity & Notification Control
          </h1>
          <p className="text-sm text-gray-500 mt-1">Monitor real-time outgoing mail activity logs and customize buyer notification settings</p>
        </div>
        <button
          onClick={() => { fetchLogs(); fetchSettings(); toast.info('Refreshed email logs!'); }}
          className="btn-ghost flex items-center gap-1.5 text-xs font-bold py-2.5 px-4 rounded-xl border border-gray-200"
        >
          <FiRefreshCw size={14} /> Refresh Logs
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'logs' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <FiMail size={16} /> Live Outgoing Mail Logs ({logs.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 px-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'settings' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <FiSliders size={16} /> Email Notification Controls & Settings
        </button>
      </div>

      {/* TAB 1: LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          {/* Category Filter */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {['all', 'welcome', 'order_confirmation', 'order_status', 'return_request', 'refund_processed', 'test'].map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3.5 py-1.5 rounded-xl font-bold uppercase transition-all ${
                  typeFilter === t ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Logs Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
                  <tr>
                    <th className="text-left px-5 py-3">Time</th>
                    <th className="text-left px-5 py-3">Recipient (To)</th>
                    <th className="text-left px-5 py-3">Subject</th>
                    <th className="text-left px-5 py-3">Email Type</th>
                    <th className="text-left px-5 py-3">Status</th>
                    <th className="text-right px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{formatDate(log.createdAt)}</td>
                      <td className="px-5 py-3 font-bold text-gray-900">{log.toEmail}</td>
                      <td className="px-5 py-3 font-semibold text-gray-800 max-w-[260px] truncate">{log.subject}</td>
                      <td className="px-5 py-3">
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600">
                          {log.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                          log.status === 'sent' ? 'bg-emerald-50 text-emerald-600' :
                          log.status === 'mocked' ? 'bg-indigo-50 text-indigo-600' :
                          'bg-red-50 text-red-600'
                        }`}>
                          {log.status === 'mocked' ? 'Mock Logged (Dev)' : log.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors flex items-center gap-1 ml-auto"
                        >
                          <FiEye size={12} /> View HTML
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {logs.length === 0 && (
              <div className="text-center py-16">
                <FiMail size={40} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No outgoing mail logs found.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SETTINGS & CONTROLS */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Controls Grid */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <FiShield className="text-blue-600" /> Buyer Email Notification Toggles
            </h3>
            <p className="text-xs text-gray-500">Enable or disable specific email notifications sent to users from your platform.</p>

            <div className="space-y-4 pt-2">
              {[
                { key: 'enable_welcome_email', label: 'Welcome / Registration Email', desc: 'Sent when a new buyer or seller creates an account' },
                { key: 'enable_order_confirmation_email', label: 'Order Confirmation Email', desc: 'Sent when a buyer places an order with items & shipping breakdown' },
                { key: 'enable_order_status_email', label: 'Order Status Update Email', desc: 'Sent when order status changes to Shipped, Delivered, etc.' },
                { key: 'enable_return_request_email', label: 'Return Request Confirmation Email', desc: 'Sent to buyer when a return request is submitted' },
                { key: 'enable_refund_processed_email', label: 'Refund Processed (2-3 Days Bank Credit) Email', desc: 'Sent to buyer when refund status is updated to Refund Processed' },
              ].map((item) => {
                const isEnabled = settings[item.key] === 'true' || settings[item.key] === '1';
                return (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div>
                      <p className="text-sm font-extrabold text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>

                    <button
                      onClick={() => handleToggleSetting(item.key)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                        isEnabled
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {isEnabled ? <><FiCheck size={14} /> ENABLED</> : <><FiX size={14} /> DISABLED</>}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={handleSaveSettings}
                className="btn-primary text-xs py-3 px-6 rounded-xl font-bold shadow-md"
              >
                Save Email Controls
              </button>
            </div>
          </div>

          {/* Test Email Dispatcher */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <FiSend className="text-blue-600" /> Send Test Email
            </h3>
            <p className="text-xs text-gray-500">Dispatch a test notification email to verify your SMTP server setup and parameters.</p>

            <form onSubmit={handleSendTestEmail} className="flex gap-3 max-w-md">
              <input
                type="email"
                required
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter recipient email address..."
                className="input text-xs flex-1"
              />
              <button
                type="submit"
                disabled={testSending}
                className="btn-primary text-xs py-2.5 px-5 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap"
              >
                {testSending ? 'Sending...' : <><FiSend size={14} /> Send Test</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* HTML Email Preview Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setSelectedLog(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <FiX size={20} />
            </button>

            <h3 className="text-base font-bold text-gray-900 mb-1">Email Preview</h3>
            <p className="text-xs text-gray-500 mb-4">To: <strong>{selectedLog.toEmail}</strong> | Subject: {selectedLog.subject}</p>

            <div
              className="border border-gray-200 rounded-2xl p-4 bg-gray-50"
              dangerouslySetInnerHTML={{ __html: selectedLog.html }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailManagerPage;
