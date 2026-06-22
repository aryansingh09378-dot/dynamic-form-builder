import React from "react";
import { 
  Type, 
  Mail, 
  Hash, 
  ChevronDown, 
  CheckSquare, 
  Circle, 
  Calendar, 
  AlignLeft,
  PlusSquare,
  HelpCircle
} from "lucide-react";
import { FormFieldType } from "../types";

interface FieldsSidebarProps {
  onAddField: (type: FormFieldType) => void;
}

interface FieldButton {
  type: FormFieldType;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  color: string;
}

const FIELD_BUTTONS: FieldButton[] = [
  {
    type: "text",
    label: "Text Input",
    icon: Type,
    description: "Single-line plain text strings",
    color: "from-blue-500/10 to-blue-500/20 text-blue-600 group-hover:border-blue-300",
  },
  {
    type: "email",
    label: "Email Address",
    icon: Mail,
    description: "Vetted email addresses structure",
    color: "from-indigo-500/10 to-indigo-500/20 text-indigo-600 group-hover:border-indigo-300",
  },
  {
    type: "number",
    label: "Number Value",
    icon: Hash,
    description: "Numerical amounts, bounds",
    color: "from-cyan-500/10 to-cyan-500/20 text-cyan-600 group-hover:border-cyan-300",
  },
  {
    type: "dropdown",
    label: "Dropdown Options",
    icon: ChevronDown,
    description: "Single selection choice dropdowns",
    color: "from-purple-500/10 to-purple-500/20 text-purple-600 group-hover:border-purple-300",
  },
  {
    type: "checkbox",
    label: "Checkboxes",
    icon: CheckSquare,
    description: "Multi-select option selections",
    color: "from-emerald-500/10 to-emerald-500/20 text-emerald-600 group-hover:border-emerald-300",
  },
  {
    type: "radio",
    label: "Radio Choices",
    icon: Circle,
    description: "Exclusive binary/multiple choice list",
    color: "from-amber-500/10 to-amber-500/20 text-amber-600 group-hover:border-amber-300",
  },
  {
    type: "date",
    label: "Date Selector",
    icon: Calendar,
    description: "Gregorian dates selection",
    color: "from-rose-500/10 to-rose-500/20 text-rose-600 group-hover:border-rose-300",
  },
  {
    type: "textarea",
    label: "Text Area Block",
    icon: AlignLeft,
    description: "Multi-line paragraph text fields",
    color: "from-blue-500/10 to-blue-500/20 text-blue-600 group-hover:border-blue-300",
  },
];

export default function FieldsSidebar({ onAddField }: FieldsSidebarProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shrink-0 w-full sm:w-72 flex flex-col shadow-sm">
      
      {/* Drawer Section Header */}
      <h3 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-1 flex items-center gap-1.5">
        <PlusSquare className="h-4 w-4 shrink-0" />
        Form Field Controls
      </h3>
      <p className="text-[11px] text-slate-500 mb-4 leading-normal font-normal">
        Click any field type below to append it to your form layout canvas. Customize properties inline.
      </p>

      {/* Interactive Command Buttons */}
      <div className="space-y-2.5 overflow-y-auto max-h-[500px] scrollbar-thin pr-1">
        {FIELD_BUTTONS.map((btn) => {
          const Icon = btn.icon;
          return (
            <button
              key={btn.type}
              onClick={() => onAddField(btn.type)}
              className="w-full text-left p-3 bg-[#f8fafc] hover:bg-slate-100 border border-slate-200/60 hover:border-blue-200 rounded-xl cursor-pointer group transition-all flex items-center space-x-3.5"
            >
              <div className={`p-2 rounded-lg bg-gradient-to-tr border border-slate-100 shrink-0 ${btn.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors block">
                  {btn.label}
                </span>
                <span className="text-[10px] text-slate-500 truncate block">
                  {btn.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 p-3 bg-[#f8fafc] border border-slate-200 rounded-xl text-[10px] text-slate-500 font-mono flex items-start gap-1.5 leading-relaxed">
        <HelpCircle className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        <span>Fields appended are stored sequentially. Use up/down arrow buttons to reorder elements.</span>
      </div>

    </div>
  );
}
