import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

/* ─── Types ─── */
type FormStep = 'form' | 'sending' | 'success' | 'cancelled';
type Phase = 'boot' | 'typing_prompt' | 'typing_command' | 'form' | 'waiting';

/* ─── Constants ─── */
const RECIPIENT = 'homero9726@gmail.com';
const PROMPT = 'moonsbow@dev:~/cv$';
const COMMAND = ' sendmail ' + RECIPIENT;

const CONTACT = {
  name: 'Homero Cabrera',
  location: 'Vancouver, BC, Canada · Bogotá, Colombia',
  phone: '+1 (604) 754-6694',
  email: 'homero9726@gmail.com',
  linkedin: 'linkedin.com/in/homero-dev',
  github: 'github.com/holk26',
  linkedinUrl: 'https://linkedin.com/in/homero-dev',
  githubUrl: 'https://github.com/holk26',
};

/* ─── Sub-components ─── */

function Cursor() {
  return (
    <span className="inline-block w-[8px] h-[15px] bg-terminal-green animate-cursor-blink ml-[1px] align-middle" />
  );
}

function TerminalWindow({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[800px] mx-auto border border-terminal-green-dim rounded-[6px] bg-terminal-black-alt overflow-hidden">
      {/* Header bar */}
      <div className="h-[32px] bg-terminal-black border-b border-terminal-gray-dark flex items-center px-3 relative shrink-0">
        <div className="flex items-center gap-[6px]">
          <span className="w-[10px] h-[10px] rounded-full bg-terminal-red block" />
          <span className="w-[10px] h-[10px] rounded-full bg-terminal-amber block" />
          <span className="w-[10px] h-[10px] rounded-full bg-terminal-green block" />
        </div>
        <span className="absolute left-1/2 -translate-x-1/2 font-mono text-[11px] text-terminal-gray tracking-[0.5px]">
          user@moonsbow: ~/cv
        </span>
      </div>
      {/* Content */}
      <div className="p-4 min-h-[400px]">{children}</div>
    </div>
  );
}

function FieldLine({
  label,
  value,
  isActive,
  onChange,
  onKeyDown,
  inputRef,
  type = 'text',
  autoFocus = false,
}: {
  label: string;
  value: string;
  isActive: boolean;
  onChange: (val: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  type?: string;
  autoFocus?: boolean;
}) {
  return (
    <div
      className={
        'flex items-center font-mono text-[15px] leading-[1.6] min-h-[24px] px-1 -mx-1 rounded ' +
        (isActive ? 'bg-[rgba(74,246,38,0.04)]' : '')
      }
    >
      <span className="text-terminal-amber shrink-0" style={{ width: '10ch' }}>
        {label}
      </span>
      {isActive ? (
        <div className="relative flex-1 flex items-center min-w-0">
          <input
            ref={inputRef}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            className="w-full bg-transparent text-terminal-white outline-none font-mono text-[15px] leading-[1.6] p-0 border-0"
            autoFocus={autoFocus}
            spellCheck={false}
            autoComplete="off"
          />
          <Cursor />
        </div>
      ) : (
        <span className="text-terminal-white">{value}</span>
      )}
    </div>
  );
}

function BodyField({
  value,
  isActive,
  onChange,
  onKeyDown,
  textareaRef,
  autoFocus = false,
}: {
  value: string;
  isActive: boolean;
  onChange: (val: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
  autoFocus?: boolean;
}) {
  return (
    <div className={isActive ? 'bg-[rgba(74,246,38,0.04)] px-1 -mx-1 rounded' : ''}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        className="w-full bg-transparent text-terminal-white outline-none font-mono text-[15px] leading-[1.6] p-0 border-0 resize-none min-h-[120px]"
        autoFocus={autoFocus}
        spellCheck={false}
        autoComplete="off"
        placeholder="Type your message here..."
      />
      {isActive && (
        <div className="flex items-center gap-1 mt-1">
          <Cursor />
        </div>
      )}
    </div>
  );
}

function SuccessBox({ onReturn }: { onReturn: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
      className="border border-terminal-green p-4 my-4 font-mono text-[13px]"
    >
      <div className="text-terminal-green font-bold text-center mb-3">
        ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
      </div>
      <div className="text-terminal-green font-bold text-center mb-3">
        ┃&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MESSAGE SENT SUCCESSFULLY&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;┃
      </div>
      <div className="text-terminal-green font-bold text-center mb-4">
        ┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
      </div>
      <div className="space-y-2 text-terminal-white px-2">
        <p>Thank you for reaching out!</p>
        <p>Your message has been queued for delivery.</p>
        <p>Expected response time: 24-48 hours.</p>
        <br />
        <p>Meanwhile, you can also reach me at:</p>
        <div className="pl-4 space-y-1">
          <p>
            <span className="text-terminal-green">{'>'}</span> Email:{" "}
            <a
              href={`mailto:${CONTACT.email}`}
              className="text-terminal-green hover:text-terminal-blue hover:underline transition-colors duration-150"
            >
              {CONTACT.email}
            </a>
          </p>
          <p>
            <span className="text-terminal-green">{'>'}</span> LinkedIn:{" "}
            <a
              href={CONTACT.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-terminal-green hover:text-terminal-blue hover:underline transition-colors duration-150"
            >
              {CONTACT.linkedin}
            </a>
          </p>
          <p>
            <span className="text-terminal-green">{'>'}</span> GitHub:{" "}
            <a
              href={CONTACT.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-terminal-green hover:text-terminal-blue hover:underline transition-colors duration-150"
            >
              {CONTACT.github}
            </a>
          </p>
        </div>
      </div>
      <div className="text-terminal-green font-bold text-center mt-4">
        ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
      </div>
      <div className="mt-4 text-terminal-gray text-[12px]">
        <button
          onClick={onReturn}
          className="text-terminal-green hover:text-terminal-blue hover:underline transition-colors duration-150 cursor-pointer bg-transparent border-0 p-0 font-mono text-[12px]"
        >
          Press Enter to return to terminal
        </button>
      </div>
    </motion.div>
  );
}

function CancelledMessage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="my-4 font-mono text-[15px]"
    >
      <p className="text-terminal-white">^C</p>
      <p className="text-terminal-red">Send cancelled.</p>
      <p className="text-terminal-red">Message discarded.</p>
    </motion.div>
  );
}

function ContactCard() {
  return (
    <div className="mt-8 w-full max-w-[800px] mx-auto">
      {/* Divider */}
      <div className="mb-2">
        <span className="text-terminal-green-dim font-mono text-[12px] whitespace-pre">
          {'━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'}
        </span>
      </div>
      <div className="text-center mb-2">
        <span className="text-terminal-gray font-mono text-[13px] font-bold tracking-[0.5px]">
          DIRECT CONTACT INFORMATION
        </span>
      </div>
      <div className="mb-4">
        <span className="text-terminal-green-dim font-mono text-[12px] whitespace-pre">
          {'━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'}
        </span>
      </div>

      {/* Name */}
      <div className="mb-3 font-mono text-[14px] text-terminal-white font-bold">
        {CONTACT.name}
      </div>

      {/* Card */}
      <div className="border border-terminal-green-dim p-4 bg-terminal-black-alt/50">
        <div className="space-y-2 font-mono text-[13px]">
          <div className="flex items-start gap-3">
            <span className="text-terminal-green w-[24px] shrink-0 text-center">@</span>
            <a
              href={`mailto:${CONTACT.email}`}
              className="text-terminal-green hover:text-terminal-blue hover:underline transition-colors duration-150"
            >
              {CONTACT.email}
            </a>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-terminal-green w-[24px] shrink-0 text-center">#</span>
            <a
              href={`tel:${CONTACT.phone.replace(/\D/g, '')}`}
              className="text-terminal-green hover:text-terminal-blue hover:underline transition-colors duration-150"
            >
              {CONTACT.phone}
            </a>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-terminal-green w-[24px] shrink-0 text-center">*</span>
            <span className="text-terminal-white">{CONTACT.location}</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-terminal-green w-[24px] shrink-0 text-center">in</span>
            <a
              href={CONTACT.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-terminal-green hover:text-terminal-blue hover:underline transition-colors duration-150"
            >
              {CONTACT.linkedin}
            </a>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-terminal-green w-[24px] shrink-0 text-center">gh</span>
            <a
              href={CONTACT.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-terminal-green hover:text-terminal-blue hover:underline transition-colors duration-150"
            >
              {CONTACT.github}
            </a>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[12px] text-terminal-gray">
        <span>
          Work authorization:{" "}
          <span className="text-terminal-amber">
            authorized to work in Colombia · in Canada requires employer sponsorship
          </span>
        </span>
        <span>
          Availability:{" "}
          <span className="text-terminal-green">Immediate</span>
        </span>
      </div>

      {/* Bottom divider */}
      <div className="mt-4">
        <span className="text-terminal-green-dim font-mono text-[12px] whitespace-pre">
          {'━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'}
        </span>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */

export default function Contact() {
  const navigate = useNavigate();

  /* Animation & form state */
  const [phase, setPhase] = useState<Phase>('boot');
  const [step, setStep] = useState<FormStep>('form');
  const [formData, setFormData] = useState({
    to: RECIPIENT,
    from: '',
    subject: '',
    body: '',
  });
  const [error, setError] = useState('');
  const [promptTyped, setPromptTyped] = useState('');
  const [commandTyped, setCommandTyped] = useState('');
  const [sendingLines, setSendingLines] = useState<string[]>([]);

  /* Refs */
  const inputRef = useRef<HTMLInputElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* ─── Boot / typing sequence ─── */
  useEffect(() => {
    const bootTimer = setTimeout(() => setPhase('typing_prompt'), 200);
    return () => clearTimeout(bootTimer);
  }, []);

  useEffect(() => {
    if (phase !== 'typing_prompt') return;
    let idx = 0;
    const timer = setInterval(() => {
      if (idx <= PROMPT.length) {
        setPromptTyped(PROMPT.slice(0, idx));
        idx++;
      } else {
        clearInterval(timer);
        setPhase('typing_command');
      }
    }, 30);
    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'typing_command') return;
    let idx = 0;
    const timer = setInterval(() => {
      if (idx <= COMMAND.length) {
        setCommandTyped(COMMAND.slice(0, idx));
        idx++;
      } else {
        clearInterval(timer);
        setTimeout(() => setPhase('form'), 400);
      }
    }, 30);
    return () => clearInterval(timer);
  }, [phase]);

  /* ─── Focus management ─── */
  useEffect(() => {
    if (phase === 'form' && step === 'form') {
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [phase, step]);

  /* ─── Sending animation ─── */
  useEffect(() => {
    if (step !== 'sending') return;

    const sequence = [
      { delay: 200, line: '.' },
      { delay: 600, line: 'Message queued for delivery.' },
      { delay: 1200, line: 'Transfer complete.' },
    ];

    const timers: ReturnType<typeof setTimeout>[] = [];

    sequence.forEach((item) => {
      const t = setTimeout(() => {
        setSendingLines((prev) => [...prev, item.line]);
      }, item.delay);
      timers.push(t);
    });

    const finishTimer = setTimeout(() => {
      setStep('success');
    }, 2200);
    timers.push(finishTimer);

    return () => timers.forEach(clearTimeout);
  }, [step]);

  /* ─── Keyboard handlers ─── */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (phase !== 'form' || step !== 'form') return;

      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        handleSubmit();
        return;
      }
      if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        handleCancel();
        return;
      }
    },
    [phase, step, formData]
  );

  const handleSubmit = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.from.trim()) {
      setError('sendmail: From field is required');
      return;
    }
    if (!emailRegex.test(formData.from.trim())) {
      setError('sendmail: invalid email format in From field');
      return;
    }
    if (!formData.body.trim()) {
      setError('sendmail: message body is required');
      return;
    }
    setError('');
    setSendingLines([]);
    setStep('sending');
    setPhase('waiting');
    // Open the visitor's email client with the message pre-filled — the site
    // is a static SPA with no backend, so mailto is the delivery mechanism.
    const subject = formData.subject.trim() || 'Contact from cv.x.moonsbow.com';
    const body = `${formData.body.trim()}\n\n— ${formData.from.trim()}`;
    const mailto = `mailto:${RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    console.log('[sendmail] Message submitted:', formData);
    window.location.href = mailto;
  };

  const handleCancel = () => {
    setError('');
    setStep('cancelled');
    setPhase('waiting');
  };

  const handleReturnToTerminal = useCallback(() => {
    navigate('/terminal');
  }, [navigate]);

  /* ─── Global key listener for success/cancel states ─── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (step === 'success' && e.key === 'Enter') {
        e.preventDefault();
        handleReturnToTerminal();
      }
      if (step === 'cancelled' && (e.key === 'Enter' || (e.ctrlKey && e.key === 'c'))) {
        e.preventDefault();
        // Reset form
        setFormData({ to: RECIPIENT, from: '', subject: '', body: '' });
        setStep('form');
        setPhase('form');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [step, handleReturnToTerminal]);

  /* ─── Render ─── */
  const isFormActive = phase === 'form';
  const showCursorOnPrompt = phase === 'typing_prompt' || phase === 'typing_command';

  return (
    <div className="min-h-[100dvh] bg-terminal-black text-terminal-white font-mono">
      <div className="max-w-[900px] mx-auto px-4 py-6 md:py-10">
        {/* Terminal Window */}
        <TerminalWindow>
          {/* Command line */}
          <div className="font-mono text-[15px] leading-[1.6] mb-4 min-h-[24px]">
            <span className="text-terminal-green font-bold">{promptTyped}</span>
            <span className="text-terminal-white">{commandTyped}</span>
            {showCursorOnPrompt && <Cursor />}
          </div>

          {/* Form content */}
          <AnimatePresence mode="wait">
            {isFormActive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {/* To field (fixed recipient) */}
                <div className="flex items-center font-mono text-[15px] leading-[1.6] min-h-[24px]">
                  <span className="text-terminal-amber shrink-0" style={{ width: '10ch' }}>
                    To:
                  </span>
                  <span className="text-terminal-gray">{RECIPIENT}</span>
                </div>

                {/* From field */}
                <FieldLine
                  label="From:"
                  value={formData.from}
                  isActive
                  onChange={(v) => setFormData((p) => ({ ...p, from: v }))}
                  onKeyDown={(e) => {
                    handleKeyDown(e);
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      subjectRef.current?.focus();
                    }
                  }}
                  inputRef={inputRef}
                  type="email"
                  autoFocus
                />

                {/* Subject field */}
                <FieldLine
                  label="Subject:"
                  value={formData.subject}
                  isActive
                  onChange={(v) => setFormData((p) => ({ ...p, subject: v }))}
                  onKeyDown={(e) => {
                    handleKeyDown(e);
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      textareaRef.current?.focus();
                    }
                  }}
                  inputRef={subjectRef}
                />

                {/* Body field — always visible and editable */}
                <div className="mt-2">
                  <BodyField
                    value={formData.body}
                    isActive
                    onChange={(v) => setFormData((p) => ({ ...p, body: v }))}
                    onKeyDown={handleKeyDown}
                    textareaRef={textareaRef}
                  />
                </div>

                {/* Error message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-terminal-red font-mono text-[13px] mt-2"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Send row — always visible on desktop and mobile */}
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="border border-terminal-green text-terminal-green px-4 py-2 font-mono text-[13px] hover:bg-terminal-green-dim transition-colors duration-200"
                  >
                    [ SEND ]
                  </button>
                  <span className="text-terminal-gray text-[11px]">
                    opens your email client · Ctrl+D send · Ctrl+C cancel
                  </span>
                </div>
              </motion.div>
            )}

            {/* Sending animation */}
            {step === 'sending' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-mono text-[15px] leading-[1.6] space-y-1"
              >
                {sendingLines.map((line, i) => (
                  <p
                    key={i}
                    className={
                      line === '.'
                        ? 'text-terminal-white'
                        : 'text-terminal-green'
                    }
                  >
                    {line}
                  </p>
                ))}
              </motion.div>
            )}

            {/* Success state */}
            {step === 'success' && <SuccessBox onReturn={handleReturnToTerminal} />}

            {/* Cancelled state */}
            {step === 'cancelled' && <CancelledMessage />}
          </AnimatePresence>

          {/* Cancelled: return prompt */}
          {step === 'cancelled' && (
            <div className="mt-4 text-terminal-gray text-[12px]">
              <button
                onClick={() => {
                  setFormData({ to: RECIPIENT, from: '', subject: '', body: '' });
                  setStep('form');
                  setPhase('form');
                }}
                className="text-terminal-green hover:text-terminal-blue hover:underline transition-colors duration-150 cursor-pointer bg-transparent border-0 p-0 font-mono text-[12px]"
              >
                Press Enter or Ctrl+C to return to prompt
              </button>
            </div>
          )}
        </TerminalWindow>

        {/* Direct Contact Card */}
        <ContactCard />
      </div>
    </div>
  );
}
