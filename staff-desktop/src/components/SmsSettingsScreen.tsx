'use client';

import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send,
  Save,
  RotateCcw,
  ExternalLink,
  ShieldAlert,
  Info,
  Eye,
  EyeOff,
  Copy,
  Sliders,
  MessageSquare
} from 'lucide-react';
import { Language, SmsGatewaySettings, UserProfile } from '../lib/types';
import { staffTranslations } from '../lib/i18n';
import {
  getSmsSettings,
  updateSmsSettings,
  sendTestSms,
  resetSmsTemplates
} from '../lib/api';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Badge
} from './ui';

interface SmsSettingsScreenProps {
  lang: Language;
  currentUser: UserProfile;
}

export default function SmsSettingsScreen({ lang, currentUser }: SmsSettingsScreenProps) {
  const t = staffTranslations[lang];

  const [settings, setSettings] = useState<SmsGatewaySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form fields
  const [isEnabled, setIsEnabled] = useState(true);
  const [gatewayUrl, setGatewayUrl] = useState('');
  const [username, setUsername] = useState('sms');
  const [password, setPassword] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [templateFr, setTemplateFr] = useState('');
  const [templateAr, setTemplateAr] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Test SMS modal / card state
  const [testPhone, setTestPhone] = useState('0555000001');
  const [testMessage, setTestMessage] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);

  // Active preview tab for templates
  const [previewLang, setPreviewLang] = useState<'fr' | 'ar'>('fr');

  const loadSettings = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await getSmsSettings();
      setSettings(res);
      setIsEnabled(res.is_enabled);
      setGatewayUrl(res.gateway_url);
      setUsername(res.username || 'sms');
      setPassword(res.password || '');
      setDeviceName(res.device_name || 'Mon Téléphone Android');
      setTemplateFr(res.template_fr || res.default_template_fr);
      setTemplateAr(res.template_ar || res.default_template_ar);
    } catch (err: any) {
      setErrorMsg(err.message || 'Impossible de charger les paramètres SMS.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSaveSuccess(false);

    try {
      let finalUrl = gatewayUrl.trim();
      if (finalUrl.includes('sms-gate.app')) {
        finalUrl = 'https://api.sms-gate.app/3rdparty/v1/message';
        setGatewayUrl(finalUrl);
      }

      const payload: Partial<SmsGatewaySettings> = {
        is_enabled: isEnabled,
        gateway_url: finalUrl,
        username: username.trim(),
        password: password.trim(),
        device_name: deviceName.trim(),
        template_fr: templateFr,
        template_ar: templateAr,
      };

      const updated = await updateSmsSettings(payload);
      setSettings(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Échec de la sauvegarde des paramètres.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetTemplates = async () => {
    if (!window.confirm('Voulez-vous rétablir les modèles de messages par défaut ?')) return;
    setSaving(true);
    try {
      const res = await resetSmsTemplates();
      setTemplateFr(res.settings.template_fr);
      setTemplateAr(res.settings.template_ar);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur lors de la réinitialisation des modèles.');
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestSms = async () => {
    if (!testPhone) {
      alert('Veuillez saisir un numéro de téléphone pour le test.');
      return;
    }
    setSendingTest(true);
    setTestResult(null);

    try {
      const res = await sendTestSms(testPhone, testMessage || undefined);
      if (res.success) {
        setTestResult({
          success: true,
          message: 'SMS envoyé avec succès ! Le message a été transmis à votre téléphone Android.',
          data: res.report
        });
      } else {
        setTestResult({
          success: false,
          message: res.report?.error || 'Échec de transmission vers le téléphone Android.',
          data: res.report
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Erreur réseau ou passerelle injoignable.'
      });
    } finally {
      setSendingTest(false);
    }
  };

  const insertVariable = (target: 'fr' | 'ar', variable: string) => {
    if (target === 'fr') {
      setTemplateFr((prev) => `${prev} ${variable}`);
    } else {
      setTemplateAr((prev) => `${prev} ${variable}`);
    }
  };

  // Sample data for live preview
  const sampleParcel = {
    tracking_code: 'KX-ALG-EUL-261012-8841',
    destination_office: previewLang === 'ar' ? 'العلمة' : 'El Eulma',
    destination_address: previewLang === 'ar' ? 'شارع دبي، العلمة' : 'Rue Dubaï, El Eulma',
    destination_phone: '036 87 12 34',
    recipient_name: previewLang === 'ar' ? 'أمين بوزيد' : 'Amine Bouzid',
    fee_amount: '800',
    payment_status: previewLang === 'ar' ? 'غير مدفوع' : 'Non payé',
  };

  const renderPreview = (template: string) => {
    let result = template;
    for (const [key, val] of Object.entries(sampleParcel)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), val);
    }
    return result;
  };

  const placeholders = [
    { key: '{tracking_code}', label: 'Code Suivi' },
    { key: '{destination_office}', label: 'Agence Destination' },
    { key: '{destination_address}', label: 'Adresse Agence' },
    { key: '{destination_phone}', label: 'Tél Agence' },
    { key: '{recipient_name}', label: 'Nom Client' },
    { key: '{fee_amount}', label: 'Frais (DZD)' },
    { key: '{payment_status}', label: 'Statut Paiement' },
  ];

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-500 mb-3" />
        <p className="text-xs">Chargement de la configuration de la passerelle SMS...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-600/20 text-brand-400 border border-brand-500/30 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Passerelle Android SMS Gateway
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Connexion avec l'application open-source <span className="font-mono text-brand-400">capcom6/android-sms-gateway</span> pour l'envoi de vrais SMS depuis votre téléphone.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadSettings}
            icon={RefreshCw}
          >
            Actualiser
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleSave()}
            loading={saving}
            icon={Save}
          >
            Enregistrer
          </Button>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Paramètres et modèles SMS enregistrés avec succès dans le système.</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Guide Banner */}
      <div className="p-5 rounded-3xl bg-dark-900 border border-dark-750 shadow-card relative overflow-hidden">
        <div className="flex items-start gap-3.5">
          <Info className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="font-bold text-white flex items-center gap-2">
              <span>Comment connecter votre téléphone Android en 3 étapes :</span>
              <a
                href="https://github.com/capcom6/android-sms-gateway"
                target="_blank"
                rel="noreferrer"
                className="text-brand-400 hover:text-brand-300 inline-flex items-center gap-1 font-mono text-[11px] underline"
              >
                GitHub capcom6/android-sms-gateway <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px] leading-relaxed">
              <li>Installez l'application <strong>Android SMS Gateway</strong> sur votre smartphone Android (téléchargez l'APK depuis GitHub).</li>
              <li>Ouvrez l'application, activez le serveur local (sur le même Wi-Fi que l'ordinateur) ou utilisez le mode Cloud (<span className="font-mono">api.sms-gate.app</span>).</li>
              <li>Copiez l'URL de l'API (ex: <span className="font-mono text-brand-300">http://192.168.1.50:8080/message</span>) et vos identifiants ci-dessous, puis testez la connexion.</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Gateway Connection & Test (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Configuration du Téléphone & Réseau</CardTitle>
                  <CardDescription>Paramètres de connexion HTTP de la passerelle Android</CardDescription>
                </div>
                <Badge variant={isEnabled ? 'success' : 'secondary'}>
                  {isEnabled ? 'Passerelle Active' : 'Mode Simulation'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Enable toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-dark-850 border border-dark-750">
                <div>
                  <div className="text-xs font-bold text-white">Activer l'envoi réel via Android Gateway</div>
                  <div className="text-[11px] text-slate-400">Si désactivé, les SMS sont enregistrés et simulés localement sans solliciter votre téléphone.</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(e) => setIsEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                </label>
              </div>

              {/* Device name */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Nom d'identification du téléphone
                </label>
                <input
                  type="text"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder="Ex: Xiaomi Redmi Note 12 / Samsung A54"
                  className="w-full bg-dark-900 border border-dark-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Gateway URL */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    URL du Serveur de l'Application (Endpoint)
                  </label>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setGatewayUrl('http://192.168.1.100:8080/message')}
                      className="px-2 py-0.5 rounded bg-dark-800 text-slate-400 hover:text-white"
                    >
                      Exemple Local
                    </button>
                    <button
                      type="button"
                      onClick={() => setGatewayUrl('https://api.sms-gate.app/3rdparty/v1/message')}
                      className="px-2 py-0.5 rounded bg-dark-800 text-slate-400 hover:text-white"
                    >
                      Exemple Cloud
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={gatewayUrl}
                  onChange={(e) => setGatewayUrl(e.target.value)}
                  placeholder="http://192.168.1.50:8080/message"
                  className="w-full bg-dark-900 border border-dark-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  En mode Cloud, l'adresse est <span className="font-mono text-brand-300">https://api.sms-gate.app/3rdparty/v1/message</span> (ne pas mettre /mobile/v1). En mode Wi-Fi local : <span className="font-mono text-brand-300">http://IP:8080/message</span>.
                </p>
              </div>

              {/* Credentials grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Identifiant (Username)
                    </label>
                    <span className="text-[10px] text-slate-500">Optionnel si Bearer Token</span>
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="sms (ou laisser vide)"
                    className="w-full bg-dark-900 border border-dark-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Mot de passe ou Token Bearer / JWT
                    </label>
                    <span className="text-[10px] text-slate-500">Basic ou Cloud Token</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mot de passe ou token JWT..."
                      className="w-full bg-dark-900 border border-dark-700 rounded-xl ps-3.5 pe-10 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <span className="text-[11px] text-slate-500">
                Modifié par : {settings?.updated_by_name || 'Système'}
              </span>
              <div className="flex items-center gap-3 self-end">
                {saveSuccess && (
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    Enregistré !
                  </span>
                )}
                {errorMsg && (
                  <span className="text-xs text-red-400 font-semibold flex items-center gap-1.5 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {errorMsg}
                  </span>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleSave()}
                  loading={saving}
                  icon={Save}
                >
                  Enregistrer la passerelle
                </Button>
              </div>
            </CardFooter>
          </Card>

          {/* Test SMS Card */}
          <Card className="border-brand-500/20">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Send className="w-4 h-4 text-brand-500" />
                Tester la Connexion & Envoi SMS Réel
              </CardTitle>
              <CardDescription>
                Déclenchez un SMS immédiat vers un numéro de test pour vérifier la transmission en direct.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Numéro de Téléphone Destinataire
                  </label>
                  <input
                    type="text"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="0555000001 ou +213555..."
                    className="w-full bg-dark-900 border border-dark-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Message Test (Optionnel)
                  </label>
                  <input
                    type="text"
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    placeholder="Message par défaut de test..."
                    className="w-full bg-dark-900 border border-dark-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {testResult && (
                <div
                  className={`p-4 rounded-2xl border text-xs space-y-2 ${
                    testResult.success
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-red-950/40 border-red-500/40 text-red-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold">
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                  {testResult.data && (
                    <pre className="p-2.5 rounded-xl bg-black/60 font-mono text-[10px] text-slate-300 overflow-x-auto max-h-36">
                      {JSON.stringify(testResult.data, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={handleSendTestSms}
                loading={sendingTest}
                icon={Send}
              >
                Envoyer le SMS Test Maintenant
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: Message Templates & Live Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Modèles de Message SMS</CardTitle>
                  <CardDescription>Personnalisez le contenu envoyé lors de la mise à disposition</CardDescription>
                </div>
                <button
                  type="button"
                  onClick={handleResetTemplates}
                  title="Rétablir les modèles par défaut"
                  className="p-1.5 rounded-xl bg-dark-800 hover:bg-dark-750 text-slate-400 hover:text-white transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Variable pills */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 block mb-2">
                  Variables dynamiques (cliquez pour insérer) :
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {placeholders.map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => insertVariable(previewLang, p.key)}
                      className="px-2 py-1 rounded-lg bg-dark-850 hover:bg-brand-600/30 border border-dark-700 hover:border-brand-500/50 text-brand-300 text-[10px] font-mono transition-all"
                    >
                      {p.key}
                    </button>
                  ))}
                </div>
              </div>

              {/* French Template */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Modèle Français
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {templateFr.length} caractères
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={templateFr}
                  onChange={(e) => setTemplateFr(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-xs text-white leading-relaxed placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Arabic Template */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Modèle Arabe (العربية)
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {templateAr.length} caractères
                  </span>
                </div>
                <textarea
                  rows={4}
                  dir="rtl"
                  value={templateAr}
                  onChange={(e) => setTemplateAr(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-xs text-white leading-relaxed placeholder-slate-500 focus:outline-none focus:border-brand-500 font-sans"
                />
              </div>

              {/* Live Preview Box */}
              <div className="pt-2 border-t border-dark-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-400">
                    Aperçu en direct (Simulation Client) :
                  </span>
                  <div className="flex items-center rounded-xl bg-dark-850 p-0.5 border border-dark-750 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setPreviewLang('fr')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        previewLang === 'fr' ? 'bg-brand-400 text-dark-950 font-black shadow-card' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      FR
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewLang('ar')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        previewLang === 'ar' ? 'bg-brand-400 text-dark-950 font-black shadow-card' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      AR
                    </button>
                  </div>
                </div>

                <div
                  className="p-4 rounded-2xl bg-dark-950 border border-dark-800 text-xs text-slate-200 leading-relaxed shadow-inner"
                  dir={previewLang === 'ar' ? 'rtl' : 'ltr'}
                >
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-400 mb-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Khaled Express SMS</span>
                  </div>
                  <p className="whitespace-pre-wrap">
                    {renderPreview(previewLang === 'ar' ? templateAr : templateFr)}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleResetTemplates}
                icon={RotateCcw}
              >
                Rétablir par défaut
              </Button>
              <div className="flex items-center gap-3 self-end">
                {saveSuccess && (
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    Modèles sauvegardés !
                  </span>
                )}
                {errorMsg && (
                  <span className="text-xs text-red-400 font-semibold flex items-center gap-1.5 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {errorMsg}
                  </span>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleSave()}
                  loading={saving}
                  icon={Save}
                >
                  Sauvegarder les modèles
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {saveSuccess && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-emerald-950/95 border border-emerald-500/50 text-emerald-100 text-xs font-semibold rounded-2xl shadow-2xl backdrop-blur animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Paramètres et modèles SMS enregistrés avec succès !</span>
        </div>
      )}

      {errorMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-red-950/95 border border-red-500/50 text-red-100 text-xs font-semibold rounded-2xl shadow-2xl backdrop-blur animate-in fade-in slide-in-from-bottom-4">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <div className="flex flex-col">
            <span className="font-bold">Erreur</span>
            <span className="text-[11px] text-red-300">{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="ms-3 text-slate-400 hover:text-white text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
