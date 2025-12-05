import React from 'react';
import { AppSettings, ThemeType } from '../types';
import { THEMES } from '../constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onUpdateSettings }) => {
  if (!isOpen) return null;

  const currentThemeColors = THEMES[settings.theme];

  const toggle = (key: keyof AppSettings) => {
    onUpdateSettings({ ...settings, [key]: !settings[key] });
  };

  const handleChange = (key: keyof AppSettings, value: any) => {
    onUpdateSettings({ ...settings, [key]: value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold" style={{ color: currentThemeColors.text }}>Instellingen</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* General Section */}
          <section>
            <h3 className="text-lg font-medium mb-4 border-b pb-2">Algemeen</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Applicatie Naam</label>
                <input 
                  type="text" 
                  value={settings.appName}
                  onChange={(e) => handleChange('appName', e.target.value)}
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:outline-none"
                  style={{ borderColor: '#e5e7eb', '--tw-ring-color': currentThemeColors.primary } as any}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Taal</label>
                <select 
                  value={settings.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="nl">Nederlands</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </section>

          {/* Theme Section */}
          <section>
            <h3 className="text-lg font-medium mb-4 border-b pb-2">Thema & Weergave</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {Object.values(ThemeType).map((t) => (
                <button
                  key={t}
                  onClick={() => handleChange('theme', t)}
                  className={`p-4 rounded border-2 flex flex-col items-center gap-2 transition-all ${settings.theme === t ? 'border-opacity-100' : 'border-opacity-0 hover:border-opacity-50'}`}
                  style={{ borderColor: THEMES[t].primary, backgroundColor: '#f9fafb' }}
                >
                  <div className="w-full h-8 rounded flex overflow-hidden">
                    <div className="flex-1" style={{ backgroundColor: THEMES[t].primary }}></div>
                    <div className="flex-1" style={{ backgroundColor: THEMES[t].riskHigh }}></div>
                    <div className="flex-1" style={{ backgroundColor: THEMES[t].riskMedium }}></div>
                  </div>
                  <span className="text-sm font-medium capitalize">{t.replace('_', ' ').toLowerCase()}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
               <input 
                type="checkbox" 
                checked={settings.currencyInThousands} 
                onChange={() => toggle('currencyInThousands')}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <label className="text-sm text-gray-700">Bedragen in duizendtallen (k)</label>
            </div>
          </section>

          {/* Features Toggle */}
          <section>
            <h3 className="text-lg font-medium mb-4 border-b pb-2">Functionaliteit Zichtbaarheid</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
              {[
                { key: 'showDemo', label: 'Toon Demo Knop' },
                { key: 'showUploadTemplate', label: 'Toon Upload Template' },
                { key: 'showPeriodSelector', label: 'Toon Periode Selectie' },
                { key: 'showAiAnalysis', label: 'Toon AI Analyse' },
                { key: 'showMachineLearning', label: 'Toon Machine Learning Opties' },
                { key: 'showUserComments', label: 'Toon Opmerkingen' },
                { key: 'showExportButtons', label: 'Toon Export Knoppen' },
                { key: 'showUserName', label: 'Toon Gebruikersnaam' },
              ].map((item) => (
                 <div key={item.key} className="flex items-center justify-between">
                  <label className="text-sm text-gray-700">{item.label}</label>
                  <button
                    onClick={() => toggle(item.key as keyof AppSettings)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
                    style={{ backgroundColor: settings[item.key as keyof AppSettings] ? currentThemeColors.primary : '#d1d5db' }}
                  >
                    <span
                      className={`${
                        settings[item.key as keyof AppSettings] ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded text-white font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: currentThemeColors.primary }}
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
};
