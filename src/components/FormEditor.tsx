import React, { useState } from "react";
import { 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  CheckCircle, 
  HelpCircle,
  Hash, 
  Menu,
  Sparkles,
  Plus,
  Settings,
  X,
  PlusCircle,
  Eye
} from "lucide-react";
import { Form, FormField, FormFieldType } from "../types";
import { motion } from "motion/react";

interface FormEditorProps {
  form: Form;
  onChangeForm: (updated: Form) => void;
}

export default function FormEditor({ form, onChangeForm }: FormEditorProps) {
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [newOptionTexts, setNewOptionTexts] = useState<Record<string, string>>({});

  // Helper inside updater
  const updateFields = (newFields: FormField[]) => {
    onChangeForm({
      ...form,
      fields: newFields,
    });
  };

  // Up/down ordering shifts
  const moveField = (index: number, direction: "up" | "down", e: React.MouseEvent) => {
    e.stopPropagation();
    const newFields = [...form.fields];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newFields.length) return;
    
    const [moved] = newFields.splice(index, 1);
    newFields.splice(targetIndex, 0, moved);
    updateFields(newFields);
  };

  const deleteField = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFields = form.fields.filter(f => f.id !== id);
    updateFields(newFields);
    if (activeFieldId === id) setActiveFieldId(null);
  };

  const updateFieldProperty = (id: string, property: keyof FormField, value: any) => {
    const newFields = form.fields.map((f) => {
      if (f.id === id) {
        return { ...f, [property]: value };
      }
      return f;
    });
    updateFields(newFields);
  };

  // Manage choices Options for Select elements
  const addOptionToField = (fieldId: string) => {
    const text = newOptionTexts[fieldId]?.trim();
    if (!text) return;

    const field = form.fields.find(f => f.id === fieldId);
    if (!field) return;

    const existingOptions = field.options || [];
    if (existingOptions.includes(text)) return; // duplicate check

    updateFieldProperty(fieldId, "options", [...existingOptions, text]);
    setNewOptionTexts({ ...newOptionTexts, [fieldId]: "" });
  };

  const removeOptionFromField = (fieldId: string, optionToRemove: string) => {
    const field = form.fields.find(f => f.id === fieldId);
    if (!field) return;

    const remainingOptions = (field.options || []).filter(o => o !== optionToRemove);
    updateFieldProperty(fieldId, "options", remainingOptions);
  };

  return (
    <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col min-h-[500px] shadow-sm">
      
      {/* Dynamic inline Form header editor */}
      <div className="bg-[#f8fafc] border border-slate-200 p-5 rounded-xl mb-6 relative group">
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center text-slate-400 font-mono text-[9px] gap-1">
          <Settings className="h-3 w-3" />
          <span>Form Metadata Edited Instantly</span>
        </div>

        <input
          type="text"
          value={form.title}
          onChange={(e) => onChangeForm({ ...form, title: e.target.value })}
          placeholder="Form Title (e.g. Workshop RSVP)"
          className="w-full bg-transparent text-xl sm:text-2xl font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-b focus:border-blue-500 pb-1 mb-2 tracking-tight"
        />
        <textarea
          value={form.description}
          onChange={(e) => onChangeForm({ ...form, description: e.target.value })}
          placeholder="Brief description about the goals of this dataset..."
          rows={2}
          className="w-full bg-transparent text-xs sm:text-sm text-slate-600 placeholder-slate-400 focus:outline-none focus:border-b focus:border-blue-500 pb-1 resize-none leading-relaxed font-normal"
        />
      </div>

      {/* Main workspace container */}
      <div className="flex-1 space-y-4">
        {form.fields.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-16 border-2 border-dashed border-slate-200 rounded-xl bg-[#f8fafc]">
            <Menu className="h-8 w-8 text-slate-400 mb-2" />
            <p className="text-slate-800 text-xs font-bold mb-1">Canvas is empty</p>
            <p className="text-slate-500 text-[11px] max-w-xs mx-auto">
              Please click any item on the left drawer controls to append editable inputs on this workspace.
            </p>
          </div>
        ) : (
          form.fields.map((field, idx) => {
            const isEditing = activeFieldId === field.id;

            return (
              <div
                key={field.id}
                onClick={() => setActiveFieldId(isEditing ? null : field.id)}
                className={`bg-[#f8fafc] border rounded-xl overflow-hidden cursor-pointer transition-all ${
                  isEditing 
                    ? "border-blue-500 bg-white shadow-xs" 
                    : "border-slate-200/80 hover:border-blue-200 hover:bg-slate-50/50"
                }`}
              >
                {/* Field Summary Row */}
                <div className="p-4 flex items-center justify-between gap-4">
                  
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="text-[10px] font-mono text-slate-450 font-bold tracking-widest shrink-0 w-6">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-800 truncate max-w-[150px] sm:max-w-[250px]">
                          {field.label || "Untitled Field"}
                        </span>
                        {field.required && (
                          <span className="text-rose-600 text-xs font-bold" title="Required field">*</span>
                        )}
                        <span className="text-[9px] font-mono uppercase bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md text-slate-500">
                          {field.type}
                        </span>
                      </div>
                      
                      {!isEditing && (
                        <p className="text-[11px] text-slate-500 truncate max-w-[200px] sm:max-w-md mt-0.5 font-normal">
                          {field.placeholder ? `Placeholder: "${field.placeholder}"` : "No customized placeholder set."}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Right Side */}
                  <div className="flex items-center space-x-1 shrink-0">
                    
                    {/* Move Up */}
                    <button
                      onClick={(e) => moveField(idx, "up", e)}
                      disabled={idx === 0}
                      className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
                      title="Move Up"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>

                    {/* Move Down */}
                    <button
                      onClick={(e) => moveField(idx, "down", e)}
                      disabled={idx === form.fields.length - 1}
                      className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
                      title="Move Down"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={(e) => deleteField(field.id, e)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                      title="Delete Field"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                  </div>

                </div>

                {/* Field Details Expandable Editor Form */}
                {isEditing && (
                  <div 
                    onClick={(e) => e.stopPropagation()} 
                    className="p-5 border-t border-slate-200 bg-white text-xs space-y-4 cursor-default"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Configuration: Label text */}
                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 font-semibold">
                          Field Label Display <span className="text-blue-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => updateFieldProperty(field.id, "label", e.target.value)}
                          placeholder="e.g. Email Address, Select country..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>

                      {/* Configuration: Placeholder text */}
                      {field.type !== "date" && (
                        <div>
                          <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 font-semibold">
                            Placeholder text
                          </label>
                          <input
                            type="text"
                            value={field.placeholder}
                            onChange={(e) => updateFieldProperty(field.id, "placeholder", e.target.value)}
                            placeholder="e.g. Enter value..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
                          />
                        </div>
                      )}

                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
                      
                      {/* Required trigger */}
                      <label className="inline-flex items-center space-x-2.5 cursor-pointer selection:bg-transparent">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => updateFieldProperty(field.id, "required", e.target.checked)}
                          className="rounded border-slate-300 bg-slate-50 text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                        <span className="text-slate-700 font-semibold text-xs select-none">
                          Mark this field as mandatory for submissions (* Require)
                        </span>
                      </label>

                    </div>

                    {/* Configuration: Option selectors for choice questions (dropdown, radio, checkbox) */}
                    {(field.type === "dropdown" || field.type === "radio" || field.type === "checkbox") && (
                      <div className="border-t border-slate-200 pt-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wide font-semibold">
                            Choice List Options <span className="text-blue-600">*</span>
                          </label>
                          <span className="text-[10px] font-mono text-slate-400">
                            {(field.options || []).length} Options added
                          </span>
                        </div>

                        {/* List current values */}
                        <div className="flex flex-wrap gap-2">
                          {(field.options || []).length === 0 ? (
                            <span className="p-1 px-2.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-mono flex items-center gap-1">
                              <HelpCircle className="h-3 w-3" />
                              Please add options below so users have choices to check.
                            </span>
                          ) : (
                            (field.options || []).map((opt) => (
                              <span
                                key={opt}
                                className="inline-flex items-center pl-2.5 pr-1 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-800 font-medium text-[10.5px] font-mono gap-1.5 shadow-3xs"
                              >
                                {opt}
                                <button
                                  type="button"
                                  onClick={() => removeOptionFromField(field.id, opt)}
                                  className="p-0.5 hover:bg-slate-200 hover:text-rose-605 rounded-full transition-colors cursor-pointer"
                                  title={`Remove option ${opt}`}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            ))
                          )}
                        </div>

                        {/* Add option bar */}
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={newOptionTexts[field.id] || ""}
                            onChange={(e) => setNewOptionTexts({ ...newOptionTexts, [field.id]: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addOptionToField(field.id);
                              }
                            }}
                            placeholder="Add selection choice label..."
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => addOptionToField(field.id)}
                            className="p-1.5 px-3.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 font-bold rounded-lg transition-all flex items-center space-x-1 cursor-pointer"
                          >
                            <PlusCircle className="h-4 w-4 text-blue-600 shrink-0" />
                            <span>Add</span>
                          </button>
                        </div>

                      </div>
                    )}

                    {/* Collapse Button */}
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveFieldId(null);
                        }}
                        className="py-1 px-2.5 rounded bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-sans font-semibold text-[10.5px] cursor-pointer shadow-3xs"
                      >
                        Collapse Field Config
                      </button>
                    </div>

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
