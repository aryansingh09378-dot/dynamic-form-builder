export type FormFieldType = 
  | "text" 
  | "email" 
  | "number" 
  | "dropdown" 
  | "checkbox" 
  | "radio" 
  | "date" 
  | "textarea";

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder: string;
  required: boolean;
  options?: string[]; // for dropdown, checkbox, radio
}

export interface FormSettings {
  theme: "light" | "dark" | "teal" | "indigo" | "amber" | "rose" | "dark_nest";
  submitButtonText: string;
  successMessage: string;
}

export interface Form {
  id: string;
  userId: string;
  title: string;
  description: string;
  fields: FormField[];
  published: boolean;
  settings: FormSettings;
  createdAt: string;
  views: number;
}

export interface FormResponse {
  id: string;
  formId: string;
  answers: Record<string, any>; // fieldId -> value (string, string[], boolean, etc.)
  submittedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}
