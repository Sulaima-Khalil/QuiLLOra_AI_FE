import { Component, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { Link, useSearchParams } from "react-router-dom";
import { Box, Button, IconButton, InputBase, Menu, MenuItem, Snackbar, Alert, Tooltip, CircularProgress } from "@mui/material";
import { ChevronDown, ChevronUp, CircleHelp, Download, FileText, Home, Moon, Pencil, Send, Sparkles, Trash2, WandSparkles, PenLine, ListCollapse, CheckCircle2, Plus } from "lucide-react";
import Editor from "../components/editer/Editer";
import { getArticles, createArticle, fetchArticleById, updateArticle, refreshArticles } from "../utils/articlesStore";
import api, { errorMessage } from "../utils/apiClient";
import { nextUntitledTitle } from "../utils/articleTitle";
import { getInitials, getProfile } from "../utils/profileStore";
import { useColorMode } from "../theme/useColorMode";
import QuilloraMark from "../components/brand/QuilloraMark";
import { markdownToHtml } from "../utils/markdown";
import "../components/editer/Editor.css";

const wordsOf = (text) => (text || "").trim().split(/\s+/).filter(Boolean).length;

export const Write = () => {
  const [params, setParams] = useSearchParams();
  const editorRef = useRef(null);
  const chatEndRef = useRef(null);
  const chatInputRef = useRef(null);
  const requestIdRef = useRef(0);
  const { toggleMode } = useColorMode();
  const editId = params.get("edit");
  const profile = useMemo(() => getProfile(), []);
  const [article, setArticle] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [assistantOpen, setAssistantOpen] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [conversation, setConversation] = useState([]);

  useEffect(() => {
    let cancelled = false;
    refreshArticles().catch(() => {});
    if (!editId) {
      setArticle(null);
      setTitle(nextUntitledTitle(getArticles()));
      setContent("");
      return () => { cancelled = true; };
    }

    fetchArticleById(editId).then((item) => {
      if (cancelled) return;
      if (!item || typeof item !== "object") {
        setToast({ severity: "error", message: "Could not load this document." });
        return;
      }
      setArticle(item);
      setTitle(item.title || "");
      setContent(item.content || "");
    }).catch(() => {
      if (!cancelled) setToast({ severity: "error", message: "Could not load this document." });
    });

    return () => { cancelled = true; };
  }, [editId]);

  const persist = async (status = "Draft") => {
    const html = editorRef.current?.getHTML() || "";
    if (!title.trim() || editorRef.current?.isEmpty()) {
      setToast({ severity: "warning", message: "Add a title and some content first." }); return false;
    }
    setSaving(true);
    const payload = { title: title.trim(), content: html, status, category: "General", excerpt: "", tags: [], visibility: "public", allowComments: true, seoTitle: "" };
    try {
      const saved = article ? await updateArticle(article.id, payload) : await createArticle(payload);
      setArticle(saved); if (!article) setParams({ edit: saved.id }, { replace: true });
      return true;
    } catch (error) {
      setToast({ severity: "error", message: errorMessage(error, "Could not publish your document. Please try again.") });
      return false;
    }
    finally { setSaving(false); }
  };
  const publish = async () => { if (await persist("Published")) { setToast({ severity: "success", message: "Article published." }); } };
  const insertAtCursor = (text) => {
    if (!text.trim()) {
      setToast({ severity: "warning", message: "Tell the assistant what you want to write." });
      return;
    }
    editorRef.current?.insertContent(markdownToHtml(text));
    setPrompt("");
    setToast({ severity: "success", message: "Inserted into your document." });
  };

  useEffect(() => {
    const scrollToEnd = chatEndRef.current?.scrollIntoView;
    if (typeof scrollToEnd === "function") {
      scrollToEnd.call(chatEndRef.current, { behavior: "smooth", block: "end" });
    }
  }, [conversation, assistantLoading, assistantOpen]);

  useEffect(() => {
    if (!assistantLoading && assistantOpen) chatInputRef.current?.focus();
  }, [assistantLoading, assistantOpen]);

  const handleAssistantAction = async (action = "customPrompt", customPrompt = prompt) => {
    const trimmedPrompt = (customPrompt || "").trim();
    if (!trimmedPrompt || assistantLoading) {
      setToast({ severity: "warning", message: "Type a prompt so the assistant knows what to help with." });
      return;
    }

    if ((action === "improveWriting" || action === "summarize") && !editorRef.current?.getSelectedText?.()) {
      setToast({ severity: "info", message: action === "summarize" ? "Select text in the editor to summarize it." : "Select text in the editor to improve it." });
      return;
    }

    const requestId = ++requestIdRef.current;
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setConversation((messages) => [...messages, { id: `user-${requestId}`, role: "user", content: trimmedPrompt, timestamp }]);
    setPrompt("");
    setAssistantLoading(true);
    try {
      const response = await axios.post(`${(import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "")}/api/ai/generate`, {
        action,
        prompt: trimmedPrompt,
        selectedText: editorRef.current?.getSelectedText?.() || "",
        documentTitle: title || "Untitled document",
        documentContent: editorRef.current?.getHTML?.() || content,
      }, { withCredentials: true });
      const text = response?.data?.text || "";
      if (requestId !== requestIdRef.current) return;
      setConversation((messages) => [...messages, { id: `assistant-${requestId}`, role: "assistant", content: text, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      setToast({ severity: "error", message: errorMessage(error, "The assistant could not respond right now.") });
    } finally {
      if (requestId === requestIdRef.current) setAssistantLoading(false);
    }
  };

  const startNewChat = () => {
    requestIdRef.current += 1;
    setConversation([]);
    setPrompt("");
    setAssistantLoading(false);
    requestAnimationFrame(() => chatInputRef.current?.focus());
  };

  const handleChatKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleAssistantAction();
    }
  };

  const recents = getArticles().slice(0, 4);

  return <main className="writer-shell">
    <aside className="writer-nav" aria-label="Editor navigation">
      <Link className="writer-logo" to="/dashboard"><QuilloraMark size={34} /><span>QuiLLora</span> <em>AI</em></Link>
      <Button component={Link} to="/dashboard/write" className="new-document"><span>＋</span> New Document</Button>
      <nav className="writer-links">
        <Link to="/dashboard"><Home size={18} />Dashboard</Link>
        <Link to="/dashboard/my-article"><FileText size={18} />All Documents</Link>
        <Link to="/dashboard/archive"><Trash2 size={18} />Trash</Link>
      </nav>
      <section className="recent-documents"><p>Recent Documents</p>{recents.length ? recents.map((item) => <Link key={item.id} to={`/dashboard/write?edit=${item.id}`}><strong>{item.title}</strong><small>{item.updatedAt ? "Recently edited" : "Draft"}</small></Link>) : <span className="empty-recent">Your recent work will appear here.</span>}</section>
      <div className="upgrade-card"><div><Sparkles size={18} /> <strong>Upgrade to Pro</strong></div><p>Unlock unlimited AI generations</p><Link to="/dashboard/upgrade">Upgrade Now</Link></div>
      <div className="writer-profile"><span>{profile?.initials || getInitials(profile?.name) || "AR"}</span><div><strong>{profile?.name || "Alex Rivera"}</strong><small>{profile?.email || "alex@example.com"}</small></div><ChevronDown size={16} /></div>
    </aside>

    <section className="writer-workspace">
      <header className="writer-topbar">
        <div className="document-name"><InputBase value={title} onChange={(e) => setTitle(e.target.value)} inputProps={{ "aria-label": "Document title" }} /><Pencil size={16} /></div>
        <div className="save-state"><CheckCircle2 size={16} />{saving ? "Saving…" : "Saved just now"}</div>
        <div className="top-actions"><Tooltip title="Toggle appearance"><IconButton onClick={toggleMode}><Moon size={19} /></IconButton></Tooltip><Button className="export-button" endIcon={<ChevronDown size={16} />} onClick={(e) => setMenuAnchor(e.currentTarget)}>Export</Button><Button className="publish-button" onClick={publish} disabled={saving}>Publish</Button></div>
      </header>
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}><MenuItem onClick={() => { setMenuAnchor(null); persist(); }}><Download size={16} />&nbsp; Save as draft</MenuItem><MenuItem onClick={() => { setMenuAnchor(null); window.print(); }}><FileText size={16} />&nbsp; Print document</MenuItem></Menu>
      <div className="writer-body">
        <section className="document-panel"><Editor key={article?.id || "new"} ref={editorRef} initialContent={content} onUpdate={({ text }) => setWordCount(wordsOf(text))} /></section>
        <aside className={`assistant-panel ${assistantOpen ? "" : "collapsed"}`}>
          <div className="assistant-heading"><button type="button" aria-label={assistantOpen ? "Collapse AI Assistant" : "Open AI Assistant"} aria-expanded={assistantOpen} onClick={() => setAssistantOpen((value) => !value)}><span><Sparkles size={20} />AI Assistant</span>{assistantOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</button>{assistantOpen && <button type="button" className="new-chat-button" onClick={startNewChat}><Plus size={15} />New Chat</button>}</div>
          {assistantOpen && <div className="assistant-content">
            <div className="chat-messages" aria-live="polite">
              {!conversation.length && <div className="chat-welcome"><Sparkles size={25} /><h3>Ask AI anything...</h3><p>Get ideas, draft content, improve writing, or summarize selected text.</p><div className="welcome-actions"><AssistantAction icon={<WandSparkles />} title="Generate Ideas" copy="Get topic ideas" onClick={() => handleAssistantAction("generateIdeas", "Generate several fresh article ideas about this document")} /><AssistantAction icon={<PenLine />} title="Write Paragraph" copy="Expand your content" onClick={() => handleAssistantAction("writeParagraph", "Write an engaging paragraph for this document")} /><AssistantAction icon={<Pencil />} title="Improve Writing" copy="Enhance clarity & tone" onClick={() => handleAssistantAction("improveWriting", "Improve the selected writing for clarity and tone")} /><AssistantAction icon={<ListCollapse />} title="Summarize" copy="Shorten selected content" onClick={() => handleAssistantAction("summarize", "Summarize the selected text")} /></div></div>}
              {conversation.map((message) => <ChatMessage key={message.id} message={message} onInsert={insertAtCursor} />)}
              {assistantLoading && <div className="chat-message assistant"><div className="chat-bubble typing-indicator"><span /><span /><span />AI is thinking</div></div>}
              <div ref={chatEndRef} />
            </div>
            <div className="chat-composer"><textarea ref={chatInputRef} id="ai-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={handleChatKeyDown} maxLength="2000" placeholder="Ask AI anything..." disabled={assistantLoading} /><div><small>{prompt.length}/2000</small><button type="button" aria-label="Send AI prompt" disabled={assistantLoading || !prompt.trim()} onClick={() => handleAssistantAction()}><Send size={17} /></button></div></div>
            <small className="assistant-note">AI can make mistakes. Always review the content.</small>
          </div>}
        </aside>
      </div>
      <footer className="writer-footer">{wordCount} {wordCount === 1 ? "word" : "words"}<button type="button" onClick={() => setToast({ severity: "info", message: "Try typing / in the editor for quick commands." })}><CircleHelp size={16} />Help</button></footer>
    </section>
    <Snackbar open={Boolean(toast)} autoHideDuration={3200} onClose={() => setToast(null)}><Alert severity={toast?.severity} onClose={() => setToast(null)}>{toast?.message}</Alert></Snackbar>
  </main>;
};

function AssistantAction({ icon, title, copy, onClick }) { return <button type="button" className="assistant-action" onClick={onClick}><span>{icon}</span><div><strong>{title}</strong><small>{copy}</small></div></button>; }

class MarkdownMessageBoundary extends Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed
      ? <p>Your response is ready. Click <strong>Insert into editor</strong> to add it to your document.</p>
      : this.props.children;
  }
}

function ChatMessage({ message, onInsert }) {
  return <div className={`chat-message ${message.role}`}><div className="chat-bubble">{message.role === "assistant" ? <><MarkdownMessageBoundary><ReactMarkdown className="markdown-content" remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>{message.content}</ReactMarkdown></MarkdownMessageBoundary><Button size="small" variant="outlined" className="assistant-insert" onClick={() => onInsert(message.content)}>Insert into editor</Button></> : <p>{message.content}</p>}</div><time>{message.timestamp}</time></div>;
}

export default Write;
