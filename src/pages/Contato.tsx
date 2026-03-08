import { useState } from 'react';
import { Mail, MessageCircle, Send, CheckCircle, User, AtSign } from 'lucide-react';

export default function Contato() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 mb-4">
            Fale
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400"> conosco</span>
          </h1>
          <p className="text-lg text-neutral-500 max-w-2xl mx-auto">
            Tem alguma dúvida ou sugestão? Estamos aqui para ajudar.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 -mt-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-12">
            {/* Left - Contact Info */}
            <div className="md:col-span-2 space-y-8">
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-6">Formas de Contato</h3>
                
                <div className="space-y-6">
                  <a 
                    href="https://wa.me/5500000000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-colors group"
                  >
                    <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <MessageCircle size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900">WhatsApp</p>
                      <p className="text-sm text-neutral-500">Resposta rápida</p>
                    </div>
                  </a>

                  <a 
                    href="mailto:contato@meurebanho.com.br"
                    className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors group"
                  >
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Mail size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900">E-mail</p>
                      <p className="text-sm text-neutral-500">contato@meurebanho.com.br</p>
                    </div>
                  </a>
                </div>
              </div>

              <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-100">
                <p className="text-sm text-neutral-500 leading-relaxed">
                  🕒 <strong>Horário de atendimento:</strong><br />
                  Segunda a Sexta, 8h às 18h<br />
                  Sábados, 8h às 12h
                </p>
              </div>
            </div>

            {/* Right - Form */}
            <div className="md:col-span-3">
              {submitted ? (
                <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={32} className="text-primary-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-2">Mensagem Enviada!</h3>
                  <p className="text-neutral-500 mb-6">Retornaremos em até 24 horas úteis.</p>
                  <button
                    onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', message: '' }); }}
                    className="text-primary-600 font-semibold hover:underline"
                  >
                    Enviar nova mensagem
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Nome</label>
                    <div className="relative">
                      <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Seu nome completo"
                        className="w-full pl-11 pr-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">E-mail</label>
                    <div className="relative">
                      <AtSign size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="seu@email.com"
                        className="w-full pl-11 pr-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Mensagem</label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Descreva sua dúvida ou sugestão..."
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl 
                               transition-all hover:shadow-lg hover:shadow-primary-600/25 active:translate-y-0.5"
                  >
                    <Send size={18} />
                    Enviar Mensagem
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
