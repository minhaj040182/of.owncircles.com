import React, { useState, useEffect } from 'react';
import { 
  Play, Copy, Check, Trash2, Send, Clock, ShieldCheck, 
  Settings, CheckCircle, AlertCircle, Cpu, BookOpen, 
  Terminal, ArrowRight, RefreshCw, Layers, ShieldAlert 
} from 'lucide-react';

const STRIPE_TEMPLATE = `{
  "id": "evt_1OzXvjLkdIwHu7ixA",
  "object": "event",
  "api_version": "2023-10-16",
  "created": 1710434503,
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_3OzXvjLkdIwHu7ixA",
      "object": "payment_intent",
      "amount": 4900,
      "currency": "usd",
      "status": "succeeded",
      "customer": "cus_Pl3Rkl92W",
      "payment_method": "pm_1OzXvjLkdIwHu",
      "receipt_email": "customer@example.com"
    }
  },
  "livemode": false
}`;

const GITHUB_TEMPLATE = `{
  "ref": "refs/heads/main",
  "before": "a1b2c3d4e5f6g7h8i9j0",
  "after": "9f8e7d6c5b4a3f2e1d0c",
  "repository": {
    "id": 74829381,
    "name": "own-formatters-app",
    "full_name": "developer/own-formatters-app",
    "private": false,
    "owner": {
      "name": "developer",
      "email": "dev@owncircles.com"
    }
  },
  "pusher": {
    "name": "developer",
    "email": "dev@owncircles.com"
  },
  "commits": [
    {
      "id": "9f8e7d6c5b4a3f2e1d0c",
      "message": "feat: integrate premium JSON Schema and JSONPath modules",
      "timestamp": "2026-07-14T11:24:00-07:00",
      "author": {
        "name": "AI Studio Architect"
      }
    }
  ]
}`;

const SHOPIFY_TEMPLATE = `{
  "id": 8273918273918,
  "email": "shopper@domain.com",
  "created_at": "2026-07-14T11:24:00-07:00",
  "total_price": "129.99",
  "subtotal_price": "120.00",
  "total_tax": "9.99",
  "currency": "USD",
  "financial_status": "paid",
  "line_items": [
    {
      "id": 92839182,
      "title": "Developer Desk Pad - Felt Mat",
      "price": "120.00",
      "quantity": 1,
      "sku": "PAD-FELT-01"
    }
  ]
}`;

interface DeliveryLog {
  id: string;
  timestamp: string;
  targetUrl: string;
  event: string;
  status: number;
  latencyMs: number;
  signatureHeader: string;
  payloadSnippet: string;
}

export default function WebhookTool({ theme }: { theme?: any }) {
  const [selectedTemplate, setSelectedTemplate] = useState<'stripe' | 'github' | 'shopify' | 'custom'>('stripe');
  const [payload, setPayload] = useState<string>(STRIPE_TEMPLATE);
  const [targetUrl, setTargetUrl] = useState<string>('http://localhost:8080/webhooks');
  const [secret, setSecret] = useState<string>('whsec_owncircles_secret_key_2026');
  const [signatureHeaderName, setSignatureHeaderName] = useState<string>('Stripe-Signature');
  const [generatedSignature, setGeneratedSignature] = useState<string>('');
  const [dispatchStatus, setDispatchStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
  const [sending, setSending] = useState<boolean>(false);
  const [deliveryLogs, setDeliveryLogs] = useState<DeliveryLog[]>([
    {
      id: 'tx_1',
      timestamp: '11:20:15 AM',
      targetUrl: 'http://localhost:8080/webhooks',
      event: 'payment_intent.succeeded',
      status: 200,
      latencyMs: 42,
      signatureHeader: 'Stripe-Signature: t=1784013615,v1=f8e79e...',
      payloadSnippet: '{"id": "evt_1OzXvj...", "type": "payment_intent.succeeded"}'
    }
  ]);

  const t = theme || {
    isDark: true,
    bg: 'bg-[#02050b]',
    text: 'text-slate-200',
    textMuted: 'text-slate-400',
    border: 'border-slate-900',
    borderMuted: 'border-slate-900/40',
    card: 'bg-slate-950/40',
    inputBg: 'bg-slate-950',
    panelBg: 'bg-slate-900',
    btnPrimary: 'bg-indigo-600 hover:bg-indigo-500 text-white',
    btnSecondary: 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-200',
    canvasBg: 'bg-[#02050c]'
  };

  // React to template change
  useEffect(() => {
    switch (selectedTemplate) {
      case 'stripe':
        setPayload(STRIPE_TEMPLATE);
        setSignatureHeaderName('Stripe-Signature');
        break;
      case 'github':
        setPayload(GITHUB_TEMPLATE);
        setSignatureHeaderName('X-Hub-Signature-256');
        break;
      case 'shopify':
        setPayload(SHOPIFY_TEMPLATE);
        setSignatureHeaderName('X-Shopify-Hmac-SHA256');
        break;
      case 'custom':
        setPayload('{\n  "event": "custom.notification",\n  "timestamp": 1710434503,\n  "data": {\n    "message": "User customized webhook trigger"\n  }\n}');
        setSignatureHeaderName('X-Custom-Webhook-Signature');
        break;
    }
  }, [selectedTemplate]);

  // Compute HMAC hex representation using native crypto API
  const calculateHMAC = async (message: string, key: string): Promise<string> => {
    try {
      const encoder = new TextEncoder();
      const keyData = encoder.encode(key);
      const messageData = encoder.encode(message);

      const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const signature = await window.crypto.subtle.sign(
        'HMAC',
        cryptoKey,
        messageData
      );

      const hashArray = Array.from(new Uint8Array(signature));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    } catch (err) {
      // Fallback pseudo signature if Web Crypto isn't available in iframe
      return 'hash_error_iframe_sandbox';
    }
  };

  // Re-calculate signature whenever payload or secret changes
  useEffect(() => {
    const updateSignature = async () => {
      if (!payload.trim() || !secret.trim()) {
        setGeneratedSignature('');
        return;
      }
      const rawPayload = payload.trim();
      const rawSecret = secret.trim();

      const hash = await calculateHMAC(rawPayload, rawSecret);

      if (selectedTemplate === 'stripe') {
        const timestamp = Math.floor(Date.now() / 1000);
        const stripeSignedPayload = `t=${timestamp},v1=${hash}`;
        setGeneratedSignature(stripeSignedPayload);
      } else if (selectedTemplate === 'github') {
        setGeneratedSignature(`sha256=${hash}`);
      } else {
        setGeneratedSignature(hash);
      }
    };

    updateSignature();
  }, [payload, secret, selectedTemplate]);

  const handleSendWebhook = async () => {
    if (!targetUrl.trim()) {
      setDispatchStatus({ type: 'error', message: 'Please enter a target URL.' });
      return;
    }

    try {
      new URL(targetUrl);
    } catch (e) {
      setDispatchStatus({ type: 'error', message: 'Invalid Target URL format. Please supply a valid HTTP/HTTPS URL.' });
      return;
    }

    setSending(true);
    setDispatchStatus({ type: 'idle', message: '' });

    const start = Date.now();
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'OwnFormatters-WebhookDispatcher/2.0'
      };

      if (generatedSignature) {
        headers[signatureHeaderName] = generatedSignature;
      }

      // Live request
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers,
        body: payload,
        mode: 'cors'
      });

      const latency = Date.now() - start;
      const responseText = await response.text();

      setDispatchStatus({
        type: 'success',
        message: `Webhook successfully delivered. Server responded with status ${response.status}.`
      });

      // Append delivery logs
      const eventName = selectedTemplate === 'custom' ? 'custom.notification' : `${selectedTemplate}.event`;
      const newLog: DeliveryLog = {
        id: `tx_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        targetUrl,
        event: eventName,
        status: response.status,
        latencyMs: latency,
        signatureHeader: `${signatureHeaderName}: ${generatedSignature.substring(0, 30)}...`,
        payloadSnippet: payload.replace(/\s+/g, ' ').substring(0, 60) + '...'
      };

      setDeliveryLogs(prev => [newLog, ...prev]);

    } catch (err: any) {
      const latency = Date.now() - start;
      setDispatchStatus({
        type: 'error',
        message: `Delivery failed. Network Error / CORS rejection: ${err.message}. (Note: Sending to localhost/127.0.0.1 requires a CORS-compatible endpoint or active receiver server).`
      });

      const eventName = selectedTemplate === 'custom' ? 'custom.notification' : `${selectedTemplate}.event`;
      const newLog: DeliveryLog = {
        id: `tx_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        targetUrl,
        event: eventName,
        status: 0,
        latencyMs: latency,
        signatureHeader: `${signatureHeaderName}: ${generatedSignature.substring(0, 30)}...`,
        payloadSnippet: payload.replace(/\s+/g, ' ').substring(0, 60) + '...'
      };
      setDeliveryLogs(prev => [newLog, ...prev]);
    } finally {
      setSending(false);
    }
  };

  const clearLogs = () => {
    setDeliveryLogs([]);
  };

  return (
    <div className={`p-6 space-y-6 ${t.text}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-sans font-bold tracking-tight">Webhook Tester & Signer</h1>
          <p className={`text-xs ${t.textMuted} mt-1`}>
            Construct authentic mock webhook payloads, sign them cryptographically using HMAC SHA-256, and dispatch them to test local endpoints.
          </p>
        </div>
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/40 rounded-xl border border-slate-900 w-fit self-end">
          <button
            onClick={() => setSelectedTemplate('stripe')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedTemplate === 'stripe' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400'}`}
          >
            Stripe
          </button>
          <button
            onClick={() => setSelectedTemplate('github')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedTemplate === 'github' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400'}`}
          >
            GitHub
          </button>
          <button
            onClick={() => setSelectedTemplate('shopify')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedTemplate === 'shopify' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400'}`}
          >
            Shopify
          </button>
          <button
            onClick={() => setSelectedTemplate('custom')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedTemplate === 'custom' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400'}`}
          >
            Custom
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Webhook config and payload body */}
        <div className="lg:col-span-7 space-y-4">
          {/* Target URL & Shared Secret */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono block">
                Target Endpoint URL
              </label>
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="http://localhost:8080/webhooks"
                className={`w-full p-2.5 rounded-xl border font-mono text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 ${t.inputBg} ${t.border}`}
                id="webhook-target-url"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono block">
                Shared Signing Secret
              </label>
              <input
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="whsec_..."
                className={`w-full p-2.5 rounded-xl border font-mono text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 ${t.inputBg} ${t.border}`}
                id="webhook-signing-secret"
              />
            </div>
          </div>

          {/* Payload Box */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono block">
              Event Body Payload (JSON)
            </span>
            <textarea
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              className={`w-full h-80 p-4 rounded-xl border font-mono text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 ${t.inputBg} ${t.border} resize-none`}
              id="webhook-payload-input"
            />
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3">
            <button
              onClick={handleSendWebhook}
              disabled={sending}
              className={`px-5 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/15 w-full md:w-auto justify-center ${t.btnPrimary}`}
            >
              <Send className="w-4 h-4" />
              {sending ? 'Delivering Webhook...' : 'Fire Webhook POST'}
            </button>
            <div className="flex-1 text-[11px] text-slate-500 italic font-mono text-center md:text-right">
              Secured with {signatureHeaderName} hash signature
            </div>
          </div>
        </div>

        {/* Right Column: Signature details & logs log panel */}
        <div className="lg:col-span-5 space-y-6">
          {/* Signature breakdown */}
          <div className={`p-4 rounded-xl border ${t.border} bg-slate-900/20 space-y-3`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Active Signing Metadata
            </h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center py-1 border-b border-slate-900">
                <span className="text-slate-500">Header Name:</span>
                <span className="text-indigo-400 font-semibold">{signatureHeaderName}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 block">Computed Signature Token:</span>
                <div className="p-2.5 bg-slate-950 border border-slate-900 rounded-lg text-[10px] break-all leading-relaxed text-slate-300">
                  {generatedSignature || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Delivery History Log */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                Local Dispatch History
              </span>
              {deliveryLogs.length > 0 && (
                <button
                  onClick={clearLogs}
                  className="text-[10px] text-red-400 font-semibold uppercase tracking-wider font-mono hover:underline"
                >
                  Clear history
                </button>
              )}
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {deliveryLogs.length > 0 ? (
                deliveryLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className={`p-3 rounded-xl border bg-slate-900/10 text-xs font-mono space-y-1.5 ${
                      log.status >= 200 && log.status < 300 
                        ? 'border-emerald-500/15 hover:border-emerald-500/30' 
                        : 'border-rose-500/15 hover:border-rose-500/30'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-500">{log.timestamp}</span>
                      <span className={`px-1.5 py-0.5 rounded font-bold ${
                        log.status >= 200 && log.status < 300 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {log.status === 0 ? 'CONNECTION FAILED' : `STATUS ${log.status}`}
                      </span>
                    </div>
                    <div className="text-slate-300 truncate">POST {log.targetUrl}</div>
                    <div className="text-[10px] text-indigo-400 truncate">{log.signatureHeader}</div>
                    <div className="text-[10px] text-slate-500 truncate italic">{log.payloadSnippet}</div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 border border-dashed border-slate-900 rounded-xl text-slate-600 gap-1.5">
                  <Terminal className="w-6 h-6 text-slate-800" />
                  <span className="text-xs">No webhooks delivered in this session.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dispatch notifications */}
      {dispatchStatus.type !== 'idle' && (
        <div
          className={`p-4 rounded-xl flex items-start gap-3 border ${
            dispatchStatus.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          {dispatchStatus.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          )}
          <div>
            <span className="text-xs font-semibold font-mono block uppercase tracking-wider">
              {dispatchStatus.type === 'success' ? 'DISPATCH SUCCESS' : 'DISPATCH FAILED'}
            </span>
            <p className="text-xs mt-1 font-mono leading-relaxed">{dispatchStatus.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
