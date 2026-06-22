import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Settings, 
  BarChart3, 
  Layers, 
  Eye, 
  Copy, 
  Check, 
  Globe, 
  CloudLightning,
  PlaySquare,
  Lock,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { Form, FormField, FormFieldType } from "./types";
import AuthPage from "./components/AuthPage";
import Dashboard from "./components/Dashboard";
import FieldsSidebar from "./components/FieldsSidebar";
import FormEditor from "./components/FormEditor";
import SettingsPanel from "./components/SettingsPanel";
import ResponseDashboard from "./components/ResponseDashboard";
import PublicForm from "./components/PublicForm";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Authentication states
  const [token, setToken] = useState<string | null>(localStorage.getItem("rn_token"));
  const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(
    localStorage.getItem("rn_user") ? JSON.parse(localStorage.getItem("rn_user")!) : null
  );

  // Active workspace routing
  const [activeFormId, setActiveFormId] = useState<string | null>(null);
  const [activeForm, setActiveForm] = useState<Form | null>(null);
  
  // Workspace active tab ("build" | "settings" | "responses")
  const [activeTab, setActiveTab] = useState<"build" | "settings" | "responses">("build");

  // Utilities
  const [copiedLink, setCopiedLink] = useState(false);
  const [saveIndicator, setSaveIndicator] = useState<"Saved" | "Saving..." | "Error">("Saved");
  const [sharedFormId, setSharedFormId] = useState<string | null>(null);

  // Detect shared link in URL deep-linking
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedId = params.get("shared");
    if (sharedId) {
      setSharedFormId(sharedId);
    }
  }, []);

  // Fetch individual form details when editing
  useEffect(() => {
    if (!activeFormId || !token) return;

    const fetchForm = async () => {
      try {
        const res = await fetch(`/api/forms/${activeFormId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setActiveForm(data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchForm();
  }, [activeFormId, token]);

  const handleAuthSuccess = (newToken: string, newUser: { id: string; email: string; name: string }) => {
    localStorage.setItem("rn_token", newToken);
    localStorage.setItem("rn_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("rn_token");
    localStorage.removeItem("rn_user");
    setToken(null);
    setUser(null);
    setActiveFormId(null);
    setActiveForm(null);
  };

  // Sync Form Updates instantly onto Express server
  const handleUpdateForm = async (updatedForm: Form) => {
    setActiveForm(updatedForm);
    setSaveIndicator("Saving...");
    
    try {
      const res = await fetch(`/api/forms/${updatedForm.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedForm),
      });

      if (res.ok) {
        setSaveIndicator("Saved");
      } else {
        setSaveIndicator("Error");
      }
    } catch (err) {
      setSaveIndicator("Error");
    }
  };

  const handleTogglePublish = async () => {
    if (!activeForm) return;
    const updated = {
      ...activeForm,
      published: !activeForm.published,
    };
    handleUpdateForm(updated);
  };

  // Add field helper
  const handleAddField = (type: FormFieldType) => {
    if (!activeForm) return;

    const getDefaultLabel = (t: FormFieldType): string => {
      switch (t) {
        case "text": return "Full Name";
        case "email": return "Email Address";
        case "number": return "Age / Age limit";
        case "dropdown": return "Select Options list";
        case "checkbox": return "Check checkboxes option";
        case "radio": return "Choose single selector";
        case "date": return "Select Date";
        case "textarea": return "Additional comments feedback";
        default: return "Untitled input field";
      }
    };

    const getDefaultPlaceholder = (t: FormFieldType): string => {
      switch (t) {
        case "text": return "Enter full name...";
        case "email": return "name@domain.com";
        case "number": return "e.g. 21";
        case "dropdown": return "Please select option...";
        case "textarea": return "Type message here...";
        default: return "";
      }
    };

    const newField: FormField = {
      id: crypto.randomUUID(), // pristine random UUID
      type,
      label: getDefaultLabel(type),
      placeholder: getDefaultPlaceholder(type),
      required: false,
      options: ["dropdown", "radio", "checkbox"].includes(type) 
        ? ["Sample Option A", "Sample Option B"] 
        : undefined,
    };

    const updated = {
      ...activeForm,
      fields: [...activeForm.fields, newField],
    };

    // Auto expand the newly created field by updating its active status
    handleUpdateForm(updated);
  };

  const handleCopyShareLink = () => {
    if (!activeForm) return;
    const shareUrl = `${window.location.origin}/?shared=${activeForm.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // --- RENDER PUBLIC FORM PAGE (IF LINK VISITED) ---
  if (sharedFormId) {
    return <PublicForm formId={sharedFormId} />;
  }

  // --- RENDER AUTHENTICATION GATES FOR CREATOR ---
  if (!token || !user) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  // --- MAIN DOCK GATES: CREATOR AUTHENTICATED ---
  return (
    <div className="bg-[#f8fafc] min-h-screen text-slate-800 antialiased selection:bg-blue-500/10 font-sans">
      
      {/* Dynamic route toggler */}
      <AnimatePresence mode="wait">
        {!activeFormId ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Creator Control Dashboard */}
            <Dashboard
              token={token}
              user={user}
              onLogout={handleLogout}
              onSelectForm={(formId) => {
                setActiveFormId(formId);
                setActiveTab("build"); // default to builder tab
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="workspace"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col min-h-screen"
          >
            {/* WORKSPACE TOP CONTROL HEADER (Exactly matching image layout) */}
            <header className="border-b border-slate-200 bg-white sticky top-0 z-40 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6 shadow-xs">
              
              {/* Back to template listing */}
              <div className="flex items-center space-x-3.5 self-start sm:self-auto">
                <button
                  onClick={() => {
                    setActiveFormId(null);
                    setActiveForm(null);
                  }}
                  className="p-1.5 px-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 hover:text-slate-800 rounded-lg transition-colors cursor-pointer flex items-center space-x-1 font-mono text-[11px] text-slate-500"
                >
                  <ArrowLeft className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">Portal</span>
                </button>

                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-sm font-bold text-slate-800 truncate max-w-[150px] sm:max-w-[200px]" title={activeForm?.title}>
                      {activeForm?.title || "Constructing Form..."}
                    </h2>
                    <span className="text-[10px] font-mono shrink-0 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md text-slate-500">
                      ID: {activeFormId.substring(0, 8)}
                    </span>
                  </div>
                  
                  {/* Saving status indicator tag */}
                  <div className="flex items-center space-x-1.5 mt-0.5 font-mono text-[10px] text-slate-400">
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      saveIndicator === "Saved" 
                        ? "bg-emerald-500" 
                        : saveIndicator === "Saving..." 
                          ? "bg-amber-400 animate-ping" 
                          : "bg-rose-500"
                    }`} />
                    <span>{saveIndicator}</span>
                  </div>
                </div>
              </div>

              {/* TABS SELECTORS CONTROL CENTER */}
              <div className="flex items-center bg-slate-100/80 border border-slate-200 p-1 rounded-xl text-xs font-semibold shrink-0 self-center">
                <button
                  onClick={() => setActiveTab("build")}
                  className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all cursor-pointer ${
                    activeTab === "build" 
                      ? "bg-blue-600 font-semibold text-white shadow-xs" 
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>Build</span>
                </button>

                <button
                  onClick={() => setActiveTab("settings")}
                  className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all cursor-pointer ${
                    activeTab === "settings" 
                      ? "bg-blue-600 font-semibold text-white shadow-xs" 
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Settings className="h-3.5 w-3.5" />
                  <span>Settings</span>
                </button>

                <button
                  onClick={() => setActiveTab("responses")}
                  className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all cursor-pointer ${
                    activeTab === "responses" 
                      ? "bg-blue-600 font-semibold text-white shadow-xs" 
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  <span>Responses</span>
                </button>
              </div>

              {/* ACTION TOGGLES (Share and Live Toggles) */}
              <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0">
                
                {/* Click copy share link button */}
                <button
                  onClick={handleCopyShareLink}
                  className="p-2 bg-white border border-slate-200 hover:border-slate-300 hover:text-slate-800 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 text-xs text-slate-500 shadow-xs"
                  title="Copy shareable link to clipboard"
                >
                  {copiedLink ? (
                    <>
                      <Check className="h-3 w-3 text-green-600 font-semibold" />
                      <span className="text-[11px] text-green-600 font-semibold font-mono">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span className="text-[11px] font-semibold">Copy link</span>
                    </>
                  )}
                </button>

                {/* Open form live in new query parameter tab */}
                <a
                  href={`/?shared=${activeFormId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-white border border-slate-200 hover:border-slate-300 hover:text-slate-800 rounded-xl transition-all flex items-center justify-center text-slate-500 shadow-xs"
                  title="Open live public layout form filler"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>

                {/* Master published / publish control button */}
                {activeForm && (
                  <button
                    onClick={handleTogglePublish}
                    className={`py-2 px-3.5 rounded-xl font-semibold text-xs select-none cursor-pointer transition-all ${
                      activeForm.published 
                        ? "bg-green-50 border border-green-200 text-green-700 hover:bg-green-100" 
                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                    }`}
                  >
                    {activeForm.published ? "Active Live" : "Publish Form"}
                  </button>
                )}

              </div>

            </header>

            {/* MAIN WORKSPACE CONTENT CONTAINER (Stretched bento-layout) */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
              
              <AnimatePresence mode="wait">
                {activeForm ? (
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 7 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -7 }}
                    transition={{ duration: 0.15 }}
                  >
                    {activeTab === "build" && (
                      <div className="flex flex-col sm:flex-row gap-6 items-start">
                        {/* Dynamic Field tool sidebar */}
                        <FieldsSidebar onAddField={handleAddField} />
                        
                        {/* Main custom layouts editor board */}
                        <FormEditor form={activeForm} onChangeForm={handleUpdateForm} />
                      </div>
                    )}

                    {activeTab === "settings" && (
                      <div className="max-w-3xl mx-auto">
                        <SettingsPanel form={activeForm} onChangeForm={handleUpdateForm} />
                      </div>
                    )}

                    {activeTab === "responses" && (
                      <ResponseDashboard token={token} form={activeForm} />
                    )}

                  </motion.div>
                ) : (
                  <div className="py-20 text-center font-mono text-xs text-slate-500">
                    Retrieving active form layout configurations...
                  </div>
                )}
              </AnimatePresence>

            </main>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
