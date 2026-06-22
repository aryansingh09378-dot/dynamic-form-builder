import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Layers, 
  HelpCircle,
  FileSpreadsheet,
  Globe,
  ArrowBigUpDash,
  CheckCircle,
  Clock
} from "lucide-react";
import { Form, FormField } from "../types";
import { motion } from "motion/react";

interface PublicFormProps {
  formId: string;
}

export default function PublicForm({ formId }: PublicFormProps) {
  const [form, setForm] = useState<Form | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorHeader, setErrorHeader] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await fetch(`/api/forms/${formId}`);
        if (res.ok) {
          const data = await res.json();
          setForm(data);
          
          // Seed initial answers state for checkbox lists
          const initial: Record<string, any> = {};
          data.fields.forEach((f: FormField) => {
            if (f.type === "checkbox") {
              initial[f.id] = [];
            } else {
              initial[f.id] = "";
            }
          });
          setAnswers(initial);
        } else {
          setErrorHeader("Resource loading error: Form not found or expired.");
        }
      } catch (err) {
        setErrorHeader("Network error: Could not contact database.");
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [formId]);

  // Handle Input Changes
  const handleInputChange = (fieldId: string, value: any) => {
    setFieldErrors((prev) => {
      const copy = { ...prev };
      delete copy[fieldId];
      return copy;
    });

    setAnswers((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleCheckboxChange = (fieldId: string, option: string, isChecked: boolean) => {
    setFieldErrors((prev) => {
      const copy = { ...prev };
      delete copy[fieldId];
      return copy;
    });

    setAnswers((prev) => {
      const currentArray = prev[fieldId] || [];
      const updatedArray = isChecked
        ? [...currentArray, option]
        : currentArray.filter((o: string) => o !== option);
      return {
        ...prev,
        [fieldId]: updatedArray,
      };
    });
  };

  // Perform form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    setErrorHeader("");
    setFieldErrors({});

    // Client-side quick checks
    const errors: Record<string, string> = {};
    for (const field of form.fields) {
      const val = answers[field.id];
      if (field.required) {
        if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) {
          errors[field.id] = `${field.label} is required.`;
        }
      }

      if (field.type === "email" && val) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(val))) {
          errors[field.id] = "Must enter a valid email address.";
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorHeader("Please check all required values before submitting responses.");
      return;
    }

    setSubmitLoading(true);
    try {
      const res = await fetch(`/api/forms/${formId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
      } else {
        if (data.fields) {
          setFieldErrors(data.fields);
        }
        setErrorHeader(data.error || "Submission failed. Please check field formatting errors.");
      }
    } catch (err) {
      setErrorHeader("Failed to sync submission onto server database.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Theme style sheets mappings
  const themeClasses: Record<string, any> = {
    light: {
      bg: "bg-[#f8fafc] text-slate-800 border-slate-200 selection:bg-blue-105",
      card: "bg-white border border-slate-200 shadow-sm p-6 sm:p-8 rounded-2xl",
      input: "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
      label: "text-slate-700 font-semibold",
      accentButton: "bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-3xs hover:shadow-2xs",
      title: "text-slate-800 font-bold",
      desc: "text-slate-500",
      footerTex: "text-slate-400"
    },
    dark: {
      bg: "bg-slate-950 text-slate-150 border-slate-800 selection:bg-slate-800",
      card: "bg-slate-900 border border-slate-800/80 shadow-xl p-6 sm:p-8 rounded-3xl",
      input: "bg-slate-950 border-slate-800 text-slate-205 placeholder-slate-500 focus:border-slate-700",
      label: "text-slate-300",
      accentButton: "bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md hover:shadow-lg",
      title: "text-white",
      desc: "text-slate-400",
      footerTex: "text-slate-500"
    },
    teal: {
      bg: "bg-teal-980 text-teal-100 border-teal-900/60 selection:bg-teal-800",
      card: "bg-teal-950/60 backdrop-blur-md border border-teal-850 shadow-[0_4px_30px_rgba(20,184,166,0.05)] p-6 sm:p-8 rounded-3xl",
      input: "bg-teal-980 border-teal-850 text-teal-100 placeholder-teal-650 focus:border-teal-400",
      label: "text-teal-300",
      accentButton: "bg-teal-400 hover:bg-teal-300 text-teal-980 font-black shadow-lg",
      title: "text-teal-100",
      desc: "text-teal-400",
      footerTex: "text-teal-500"
    },
    dark_nest: {
      bg: "bg-slate-950 text-slate-200 border-emerald-950 selection:bg-emerald-950",
      card: "bg-slate-900 border border-emerald-950 shadow-[0_8px_40px_rgba(16,185,129,0.04)] p-6 sm:p-8 rounded-3xl relative overflow-hidden",
      input: "bg-slate-950 border-slate-850 text-slate-100 placeholder-slate-650 focus:border-emerald-500",
      label: "text-slate-300",
      accentButton: "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-lg hover:shadow-emerald-500/10",
      title: "text-white",
      desc: "text-slate-450",
      footerTex: "text-slate-500",
      extraElements: <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-400 via-emerald-500 to-teal-400 animate-pulse-slow" />
    },
    indigo: {
      bg: "bg-indigo-955 text-indigo-100 border-indigo-900/60 selection:bg-indigo-800",
      card: "bg-slate-900 border border-indigo-950 shadow-[0_4px_30px_rgba(99,102,241,0.05)] p-6 sm:p-8 rounded-3xl",
      input: "bg-indigo-955 border-indigo-900 text-indigo-100 placeholder-indigo-650 focus:border-indigo-400",
      label: "text-indigo-300",
      accentButton: "bg-indigo-500 hover:bg-indigo-400 text-white font-black shadow-lg",
      title: "text-white",
      desc: "text-indigo-400/80",
      footerTex: "text-indigo-500"
    },
    amber: {
      bg: "bg-amber-955 text-amber-100 border-amber-900/60 selection:bg-amber-800",
      card: "bg-amber-950/40 border border-amber-900 shadow-md p-6 sm:p-8 rounded-3xl",
      input: "bg-amber-955 border-amber-900 text-amber-100 placeholder-amber-650 focus:border-amber-400",
      label: "text-amber-300",
      accentButton: "bg-amber-400 hover:bg-amber-300 text-amber-985 font-black shadow-lg",
      title: "text-white",
      desc: "text-amber-450",
      footerTex: "text-amber-500"
    },
    rose: {
      bg: "bg-rose-955 text-rose-100 border-rose-900/60 selection:bg-rose-800",
      card: "bg-slate-900 border border-rose-950 shadow-md p-6 sm:p-8 rounded-3xl",
      input: "bg-rose-955 border-rose-900 text-rose-100 placeholder-rose-650 focus:border-rose-400",
      label: "text-rose-300",
      accentButton: "bg-rose-500 hover:bg-rose-400 text-white font-black shadow-lg",
      title: "text-white",
      desc: "text-rose-450",
      footerTex: "text-rose-500"
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center text-slate-800 font-sans text-xs">
        <div className="h-9 w-9 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="font-semibold text-slate-750">Syncing dynamic form schema...</span>
      </div>
    );
  }

  if (errorHeader && !form) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md p-6 bg-white border border-slate-200 rounded-2xl text-center shadow-sm">
          <AlertCircle className="h-10 w-10 text-rose-600 mx-auto mb-3" />
          <h2 className="text-slate-800 font-bold mb-1.5 text-sm">Deployment / Access Fault</h2>
          <p className="text-slate-450 text-xs mb-4 leading-normal">{errorHeader}</p>
          <a
            href="/"
            className="inline-block py-2 px-3 bg-blue-600 hover:bg-blue-700 text-xs font-semibold rounded-lg text-white transition-all font-sans cursor-pointer"
          >
            Create Form Instead
          </a>
        </div>
      </div>
    );
  }

  if (!form) return null;

  // Active theme mapping selectors
  const activeStyle = themeClasses[form.settings.theme] || themeClasses.light;

  return (
    <div className={`min-h-screen ${activeStyle.bg} flex flex-col items-center justify-between py-12 px-4 transition-colors duration-500 font-sans antialiased`}>
      
      {/* Dynamic logo watermark at the top block */}
      <div className="mb-8 select-none opacity-90 transition-opacity">
        <div className="flex items-center justify-center space-x-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-md">
            F
          </div>
          <div>
            <div className="flex items-baseline space-x-0.5">
              <span className={`font-extrabold text-[15px] tracking-tight ${form.settings.theme === "light" ? "text-slate-800" : "text-white"}`}>FORM</span>
              <span className="font-bold text-blue-600 text-xs tracking-wider">FORGE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body container */}
      <div className="w-full max-w-xl">
        
        {submitted ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${activeStyle.card} text-center`}
          >
            <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-4 animate-bounce" />
            <h2 className={`text-xl font-black mb-2 ${activeStyle.title}`}>Responses Telemetry Recorded</h2>
            <p className={`text-xs leading-relaxed ${activeStyle.desc}`}>
              {form.settings.successMessage}
            </p>
            
            <div className="pt-6 border-t border-slate-800/10 mt-6 text-[10px] text-slate-500 font-mono tracking-wide">
              Logged to FormForge Secure Server Registry.
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className={`${activeStyle.card} space-y-6 relative`}>
            
            {/* Dark Forge custom top ambient bar strip */}
            {form.settings.theme === "dark_nest" && activeStyle.extraElements}

            {/* Header info */}
            <div>
              <h1 className={`text-xl sm:text-2xl font-black mb-1.5 tracking-tight ${activeStyle.title}`}>
                {form.title}
              </h1>
              {form.description && (
                <p className={`text-xs sm:text-sm leading-relaxed ${activeStyle.desc}`}>
                  {form.description}
                </p>
              )}
            </div>

            {/* Global Warning Indicator */}
            {errorHeader && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold leading-relaxed flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorHeader}</span>
              </div>
            )}

            {/* Form Fields Generator map */}
            <div className="space-y-5">
              {form.fields.map((field) => {
                const error = fieldErrors[field.id];
                
                return (
                  <div key={field.id} className="space-y-1.5">
                    
                    {/* Label */}
                    <label className={`block text-xs font-bold ${activeStyle.label}`}>
                      {field.label}
                      {field.required && (
                        <span className="text-rose-500 ml-1 font-black" title="Mandatory question">*</span>
                      )}
                    </label>

                    {/* RENDER DIVERGENT FIELD TYPES */}
                    
                    {/* TEXT INPUTS */}
                    {(field.type === "text" || field.type === "email" || field.type === "number") && (
                      <input
                        type={field.type}
                        value={answers[field.id] || ""}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        placeholder={field.placeholder || "Enter answer..."}
                        className={`w-full text-xs rounded-xl py-2.5 px-3.5 border transition-all ${activeStyle.input}`}
                      />
                    )}

                    {/* SELECT BOX */}
                    {field.type === "dropdown" && (
                      <select
                        value={answers[field.id] || ""}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className={`w-full text-xs rounded-xl py-2.5 px-3.5 border transition-all ${activeStyle.input}`}
                      >
                        <option value="" className={form.settings.theme === "light" ? "bg-white text-slate-800" : "bg-slate-900 text-slate-100"}>-- Choose one --</option>
                        {(field.options || []).map((opt) => (
                          <option key={opt} value={opt} className={form.settings.theme === "light" ? "bg-white text-slate-850" : "bg-slate-900 text-slate-100"}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* TEXTAREA BLOCK */}
                    {field.type === "textarea" && (
                      <textarea
                        value={answers[field.id] || ""}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        placeholder={field.placeholder || "Enter response text..."}
                        rows={3}
                        className={`w-full text-xs rounded-xl py-2.5 px-3.5 border resize-none transition-all ${activeStyle.input}`}
                      />
                    )}

                    {/* DATE SELECTOR */}
                    {field.type === "date" && (
                      <input
                        type="date"
                        value={answers[field.id] || ""}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className={`w-full text-xs rounded-xl py-2.5 px-3.5 border transition-all ${activeStyle.input}`}
                      />
                    )}

                    {/* RADIO LIST */}
                    {field.type === "radio" && (
                      <div className="space-y-1.5 pt-1">
                        {(field.options || []).map((opt) => (
                          <label key={opt} className={`flex items-center space-x-2.5 cursor-pointer text-xs ${activeStyle.label}`}>
                            <input
                              type="radio"
                              name={field.id}
                              value={opt}
                              checked={answers[field.id] === opt}
                              onChange={() => handleInputChange(field.id, opt)}
                              className={`focus:ring-blue-500 h-4 w-4 bg-white border-slate-350 ${
                                form.settings.theme === "light" 
                                  ? "text-blue-500 border-slate-300 bg-slate-50" 
                                  : "text-emerald-500 bg-slate-900 border-slate-800"
                              }`}
                            />
                            <span className="font-semibold text-slate-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* CHECKBOX LIST */}
                    {field.type === "checkbox" && (
                      <div className="space-y-1.5 pt-1">
                        {(field.options || []).map((opt) => {
                          const currentChecked = answers[field.id] || [];
                          const isChecked = currentChecked.includes(opt);

                          return (
                            <label key={opt} className={`flex items-center space-x-2.5 cursor-pointer text-xs ${activeStyle.label}`}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => handleCheckboxChange(field.id, opt, e.target.checked)}
                                className={`rounded focus:ring-blue-500 h-4 w-4 ${
                                  form.settings.theme === "light" 
                                    ? "text-blue-500 border-slate-300 bg-slate-50" 
                                    : "text-emerald-500 bg-slate-100 border-slate-800"
                                }`}
                              />
                              <span className="font-semibold text-slate-750">{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {/* Specific inline Field Validation warnings */}
                    {error && (
                      <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {error}
                      </p>
                    )}

                  </div>
                );
              })}
            </div>

            {/* Submit button bar */}
            <div className="pt-4 border-t border-slate-800/10">
              <button
                type="submit"
                disabled={submitLoading}
                className={`w-full py-3 rounded-xl transition-all font-extrabold text-xs active:scale-[0.99] flex items-center justify-center space-x-2 cursor-pointer ${activeStyle.accentButton}`}
              >
                {submitLoading ? (
                  <div className="h-4 w-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{form.settings.submitButtonText || "Submit Responses"}</span>
                    <Send className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>

      {/* Frame Footer copyright and status branding */}
      <footer className="mt-8 text-center text-[10px] font-mono select-none">
        <p className={activeStyle.footerTex}>
          Powered by <strong className="font-extrabold text-blue-600">FormForge</strong> Core Form Engine
        </p>
      </footer>

    </div>
  );
}
