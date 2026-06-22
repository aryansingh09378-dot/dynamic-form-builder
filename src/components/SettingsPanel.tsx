import React from "react";
import { 
  Settings, 
  Palette, 
  CheckCircle, 
  Type
} from "lucide-react";
import { Form, FormSettings } from "../types";

interface SettingsPanelProps {
  form: Form;
  onChangeForm: (updated: Form) => void;
}

interface ThemeOption {
  id: FormSettings["theme"];
  name: string;
  classes: string;
  desc: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "light",
    name: "Classic Slate Light",
    classes: "border-slate-300 bg-white text-slate-800",
    desc: "A clean, high-contrast light theme with rich charcoal slate typography.",
  },
  {
    id: "dark",
    name: "Midnight Obsidian",
    classes: "border-slate-800 bg-slate-900 text-slate-100",
    desc: "A stunning, eye-easy dark palette designed for late hours.",
  },
  {
    id: "teal",
    name: "FormForge Teal Glow",
    classes: "border-teal-500/30 bg-teal-950/20 text-teal-300",
    desc: "A fresh, cozy mint-teal theme designed on light sage greens.",
  },
  {
    id: "dark_nest",
    name: "Dark Forge Workspace",
    classes: "border-emerald-500/40 bg-slate-950 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]",
    desc: "An elite dark-dashboard style with laser-sharp green accents.",
  },
  {
    id: "indigo",
    name: "Cosmic Indigo",
    classes: "border-indigo-500/30 bg-indigo-950/20 text-indigo-300",
    desc: "Deep atmospheric purples paired with bright cosmic violet tags.",
  },
  {
    id: "amber",
    name: "Warm Autumn Amber",
    classes: "border-amber-500/30 bg-amber-950/20 text-amber-300",
    desc: "A welcoming, organic theme centered on warm honey ochres.",
  },
  {
    id: "rose",
    name: "Velvet Rose",
    classes: "border-rose-500/30 bg-rose-950/20 text-rose-300",
    desc: "A sophisticated warm cherry blush layout for luxury registries.",
  },
];

export default function SettingsPanel({ form, onChangeForm }: SettingsPanelProps) {
  const updateSettings = (key: keyof FormSettings, value: any) => {
    onChangeForm({
      ...form,
      settings: {
        ...form.settings,
        [key]: value,
      },
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
      
      {/* Title */}
      <div className="flex items-center space-x-3 border-b border-slate-200 pb-4">
        <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shadow-3xs">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800">Appearance & Response Presets</h3>
          <p className="text-[11px] text-slate-500">
            Define customized styles for public submitters and define action redirects.
          </p>
        </div>
      </div>

      {/* Theme Matrix Selectors */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
          <Palette className="h-4 w-4" />
          Form Skin Layout Theme
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {THEME_OPTIONS.map((theme) => {
            const isSelected = form.settings.theme === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => updateSettings("theme", theme.id)}
                className={`w-full text-left p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 relative overflow-hidden group ${
                  isSelected
                    ? "border-blue-500 bg-blue-50/20 shadow-xs"
                    : "border-slate-100 bg-[#f8fafc] hover:bg-slate-50 hover:border-blue-200"
                }`}
              >
                {/* Indicator check */}
                {isSelected && (
                  <div className="absolute top-2 right-2 text-blue-600">
                    <CheckCircle className="h-4 w-4 fill-white" />
                  </div>
                )}

                {/* Swatch mini preview indicator dot */}
                <div className={`h-5 w-5 rounded-full shrink-0 border mt-0.5 flex items-center justify-center font-bold text-[9px] ${theme.classes}`}>
                  Aa
                </div>

                <div className="min-w-0 pr-4">
                  <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors block">
                    {theme.name}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 leading-normal block font-normal">
                    {theme.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Button and Confirmation config inputs */}
      <div className="border-t border-slate-200 pt-6 space-y-4">
        
        <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
          <Type className="h-4 w-4 text-blue-600" />
          Language Copywriting Presets
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Submit Button Text */}
          <div>
            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 font-semibold">
              Submit Button Text <span className="text-blue-600">*</span>
            </label>
            <input
              type="text"
              required
              value={form.settings.submitButtonText}
              onChange={(e) => updateSettings("submitButtonText", e.target.value)}
              placeholder="e.g. Submit Application, Done"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Success Message Banner */}
          <div>
            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 font-semibold">
              Post-Submission Thank You Alert
            </label>
            <input
              type="text"
              required
              value={form.settings.successMessage}
              onChange={(e) => updateSettings("successMessage", e.target.value)}
              placeholder="e.g. Record stored successfully!"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
        </div>

      </div>

    </div>
  );
}
