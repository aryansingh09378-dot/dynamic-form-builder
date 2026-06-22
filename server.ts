import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { Form, FormResponse, User } from "./src/types";

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db.json");

// Parse JSON bodies
app.use(express.json());

// Initialize Database File if not exists
function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialData = { users: [], forms: [], responses: [] };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf-8");
      return initialData;
    }
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database file", err);
    return { users: [], forms: [], responses: [] };
  }
}

function writeDB(data: { users: User[]; forms: Form[]; responses: FormResponse[] }) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing database file", err);
  }
}

// Custom simple hashing using standard node:crypto
const SECRET_SALT = "formforge_form_builder_secret_12349876";
function hashPassword(password: string): string {
  return crypto.createHmac("sha256", SECRET_SALT).update(password).digest("hex");
}

// Custom lightweight authentication middleware
function authenticate(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized access. No token provided." });
  }
  const token = authHeader.split(" ")[1];
  try {
    // Decrypt or parse the simple token: base64(userId:timestamp:signature)
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [userId, timestamp, sig] = decoded.split(":");
    
    // Verify signature
    const expectedSig = crypto.createHmac("sha256", SECRET_SALT).update(`${userId}:${timestamp}`).digest("hex");
    if (sig !== expectedSig) {
      return res.status(401).json({ error: "Invalid token signature" });
    }
    
    // Verify expiration (e.g. 7 days = 7 * 24 * 60 * 60 * 1000)
    const tokenTime = parseInt(timestamp, 10);
    if (Date.now() - tokenTime > 7 * 24 * 60 * 60 * 1000) {
      return res.status(401).json({ error: "Token has expired" });
    }

    // Attach user id
    (req as any).userId = userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

function generateToken(userId: string): string {
  const timestamp = Date.now().toString();
  const signature = crypto.createHmac("sha256", SECRET_SALT).update(`${userId}:${timestamp}`).digest("hex");
  return Buffer.from(`${userId}:${timestamp}:${signature}`).toString("base64");
}

// --- AUTH API ENDPOINTS ---

app.post("/api/auth/register", (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: "Email, password, and name are required." });
  }

  const db = readDB();
  const existingUser = db.users.find((u: User) => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ error: "A user with this email already exists." });
  }

  const newUser: User = {
    id: crypto.randomUUID(),
    email: email.toLowerCase(),
    name,
    passwordHash: hashPassword(password),
  };

  db.users.push(newUser);
  writeDB(db);

  const token = generateToken(newUser.id);
  res.status(201).json({
    token,
    user: { id: newUser.id, email: newUser.email, name: newUser.name },
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const db = readDB();
  const user = db.users.find((u: User) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const isPasswordValid = hashPassword(password) === user.passwordHash;
  if (!isPasswordValid) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const token = generateToken(user.id);
  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name },
  });
});

app.get("/api/auth/me", authenticate, (req, res) => {
  const userId = (req as any).userId;
  const db = readDB();
  const user = db.users.find((u: User) => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json({ id: user.id, email: user.email, name: user.name });
});

// --- FORM DESIGNER API ENDPOINTS ---

// Get list of forms for current logged in user
app.get("/api/forms", authenticate, (req, res) => {
  const userId = (req as any).userId;
  const db = readDB();
  const userForms = db.forms.filter((f: Form) => f.userId === userId);
  res.json(userForms);
});

// Create a new empty form
app.post("/api/forms", authenticate, (req, res) => {
  const userId = (req as any).userId;
  const { title, description } = req.body;

  const db = readDB();
  const newForm: Form = {
    id: crypto.randomBytes(8).toString("hex"), // simple neat form code
    userId,
    title: title || "Untitled Form",
    description: description || "Form description...",
    fields: [
      {
        id: crypto.randomUUID(),
        type: "text",
        label: "Full Name",
        placeholder: "Enter user name...",
        required: true,
      },
    ],
    published: false,
    settings: {
      theme: "light",
      submitButtonText: "Submit Responses",
      successMessage: "Thank you! Your response has been recorded successfully.",
    },
    createdAt: new Date().toISOString(),
    views: 0,
  };

  db.forms.push(newForm);
  writeDB(db);

  res.status(201).json(newForm);
});

// Get detailed form for editing OR public viewing
app.get("/api/forms/:id", (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const form = db.forms.find((f: Form) => f.id === id);
  if (!form) {
    return res.status(404).json({ error: "Form not found" });
  }

  // If requester is not the owner, we count this as a public view load
  // To avoid false double-clicks incrementing constantly, we can track views.
  // In a real environment, we check user id or session. For this:
  const authHeader = req.headers.authorization;
  let isOwner = false;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = Buffer.from(token, "base64").toString("utf-8");
      const [userId] = decoded.split(":");
      if (form.userId === userId) {
        isOwner = true;
      }
    } catch (e) {
      // ignore
    }
  }

  if (!isOwner) {
    form.views = (form.views || 0) + 1;
    writeDB(db);
  }

  res.json(form);
});

// Update a form
app.put("/api/forms/:id", authenticate, (req, res) => {
  const userId = (req as any).userId;
  const { id } = req.params;
  const { title, description, fields, published, settings } = req.body;

  const db = readDB();
  const formIndex = db.forms.findIndex((f: Form) => f.id === id && f.userId === userId);
  if (formIndex === -1) {
    return res.status(404).json({ error: "Form not found or you are not authorized to edit." });
  }

  const existingForm = db.forms[formIndex];
  db.forms[formIndex] = {
    ...existingForm,
    title: title !== undefined ? title : existingForm.title,
    description: description !== undefined ? description : existingForm.description,
    fields: fields !== undefined ? fields : existingForm.fields,
    published: published !== undefined ? published : existingForm.published,
    settings: settings !== undefined ? { ...existingForm.settings, ...settings } : existingForm.settings,
  };

  writeDB(db);
  res.json(db.forms[formIndex]);
});

// Duplicate a form
app.post("/api/forms/:id/duplicate", authenticate, (req, res) => {
  const userId = (req as any).userId;
  const { id } = req.params;

  const db = readDB();
  const form = db.forms.find((f: Form) => f.id === id && f.userId === userId);
  if (!form) {
    return res.status(404).json({ error: "Form not found" });
  }

  const duplicatedForm: Form = {
    ...form,
    id: crypto.randomBytes(8).toString("hex"),
    title: `${form.title} (Copy)`,
    createdAt: new Date().toISOString(),
    views: 0,
    published: false,
  };

  db.forms.push(duplicatedForm);
  writeDB(db);

  res.status(201).json(duplicatedForm);
});

// Delete a form
app.delete("/api/forms/:id", authenticate, (req, res) => {
  const userId = (req as any).userId;
  const { id } = req.params;

  const db = readDB();
  const formIndex = db.forms.findIndex((f: Form) => f.id === id && f.userId === userId);
  if (formIndex === -1) {
    return res.status(404).json({ error: "Form not found or you are not authorized" });
  }

  db.forms.splice(formIndex, 1);

  // Also purge responses associated with this form
  db.responses = db.responses.filter((r: FormResponse) => r.formId !== id);

  writeDB(db);
  res.json({ message: "Form and all its submissions successfully deleted." });
});

// --- SUBMISSIONS / RESPONSES API ---

// Submit response to a form (PUBLIC ACCESS)
app.post("/api/forms/:id/submit", (req, res) => {
  const { id } = req.params;
  const { answers } = req.body;

  if (!answers) {
    return res.status(400).json({ error: "Answers object is required." });
  }

  const db = readDB();
  const form = db.forms.find((f: Form) => f.id === id);
  if (!form) {
    return res.status(404).json({ error: "Form does not exist." });
  }

  // Real-time server side field validation
  const errors: Record<string, string> = {};
  for (const field of form.fields) {
    const value = answers[field.id];
    if (field.required) {
      if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
        errors[field.id] = `"${field.label}" is required.`;
      }
    }
    // Simple Email regex validation server side if provided
    if (field.type === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(value))) {
        errors[field.id] = "Must be a valid email address.";
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: "Validation failed", fields: errors });
  }

  const newResponse: FormResponse = {
    id: crypto.randomUUID(),
    formId: id,
    answers,
    submittedAt: new Date().toISOString(),
  };

  db.responses.push(newResponse);
  writeDB(db);

  res.status(201).json({ success: true, message: form.settings.successMessage });
});

// List responses for a specific form (Owner secure access)
app.get("/api/forms/:id/responses", authenticate, (req, res) => {
  const userId = (req as any).userId;
  const { id } = req.params;

  const db = readDB();
  const form = db.forms.find((f: Form) => f.id === id && f.userId === userId);
  if (!form) {
    return res.status(403).json({ error: "Access denied. You do not own this form." });
  }

  const formResponses = db.responses.filter((r: FormResponse) => r.formId === id);
  res.json(formResponses);
});


// Start server and handle environment middleware
async function startServer() {
  // Vite dev mode integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Use Vite middlewares for other assets/requests
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Serve HTML page
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FormForge Form Builder container server booted on http://localhost:${PORT}`);
  });
}

startServer();
