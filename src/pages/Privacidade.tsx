
export default function Privacidade() {
  return (
    <div className="bg-white min-h-screen pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-neutral-900 mb-8">Política de Privacidade</h1>
        
        <div className="prose prose-neutral max-w-none text-neutral-600 space-y-6">
          <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mt-8 mb-4">1. Introdução</h2>
            <p>
              Bem-vindo ao MeuRebanho. Esta Política de Privacidade explica como coletamos,
              usamos, divulgamos e protegemos suas informações quando você usa nosso
              aplicativo móvel, site e serviços (coletivamente, o "Serviço").
              Respeitamos sua privacidade e estamos comprometidos em proteger seus dados pessoais.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mt-8 mb-4">2. Informações que Coletamos</h2>
            <p>Podemos coletar as seguintes categorias de informações:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Informações de Conta:</strong> Nome, endereço de e-mail e dados de cobrança quando você se cadastra.</li>
              <li><strong>Dados da Propriedade e Animais:</strong> Informações sobre seu rebanho, fazenda, e métricas que você insere no aplicativo.</li>
              <li><strong>Dados de Uso:</strong> Informações sobre como você navega e interage com o Serviço.</li>
              <li><strong>Dados do Dispositivo:</strong> Modelo do dispositivo, sistema operacional e identificadores únicos associados ao dispositivo usado para acessar o MeuRebanho.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mt-8 mb-4">3. Como Usamos Suas Informações</h2>
            <p>Utilizamos as informações coletadas para:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Fornecer, manter e melhorar nossos serviços;</li>
              <li>Processar transações e enviar notificações relacionadas;</li>
              <li>Autenticar seu acesso e garantir a segurança da plataforma;</li>
              <li>Sincronizar seus dados (o app funciona de modo offline e sincroniza quando há internet);</li>
              <li>Prestar suporte ao cliente e responder às suas solicitações.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mt-8 mb-4">4. Compartilhamento de Informações</h2>
            <p>
              Não vendemos suas informações pessoais. Podemos compartilhar seus dados apenas nas seguintes situações:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Com provedores de serviço:</strong> Terceiros que nos ajudam a operar o aplicativo (ex: hospedagem em nuvem, processamento de pagamentos).</li>
              <li><strong>Para conformidade legal:</strong> Quando exigido por lei, regulamentação ou processo legal.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mt-8 mb-4">5. Segurança dos Dados</h2>
            <p>
              Adotamos medidas de segurança razoáveis para proteger suas informações contra acesso,
              alteração, divulgação ou destruição não autorizada. Seus dados são criptografados
              durante a transmissão e armazenados com segurança.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mt-8 mb-4">6. Seus Direitos</h2>
            <p>
              Você tem o direito de solicitar o acesso, a correção ou a exclusão de seus
              dados pessoais. Para exercer esses direitos ou excluir sua conta, entre em
              contato conosco ou utilize a opção diretamente no aplicativo.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mt-8 mb-4">7. Crianças</h2>
            <p>
              Nosso Serviço não é direcionado a menores de 13 anos. Não coletamos intencionalmente informações pessoais de crianças.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mt-8 mb-4">8. Alterações a Esta Política</h2>
            <p>
              Podemos atualizar nossa Política de Privacidade periodicamente. Notificaremos
              sobre quaisquer alterações publicando a nova política nesta página.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mt-8 mb-4">9. Contato</h2>
            <p>
              Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato conosco em:
              <br/>
              <strong>Email:</strong> contato@meurebanho.app
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
