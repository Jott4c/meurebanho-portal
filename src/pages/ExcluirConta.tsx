
export default function ExcluirConta() {
  return (
    <div className="bg-white min-h-screen pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-neutral-900 mb-8">Solicitação de Exclusão de Conta e Dados</h1>
        
        <div className="prose prose-neutral max-w-none text-neutral-600 space-y-6">
          <p>
            No <strong>MeuRebanho</strong>, valorizamos a sua privacidade e o controle sobre seus dados. 
            Se você deseja encerrar sua conta e excluir suas informações de nossa plataforma, siga as orientações abaixo.
          </p>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mt-8 mb-4">Como solicitar a exclusão</h2>
            <p>Você pode solicitar a exclusão de sua conta de duas maneiras:</p>
            <ol className="list-decimal pl-6 space-y-4 mt-2">
              <li>
                <strong>Pelo Aplicativo:</strong> Acesse o menu "Configurações" ou "Perfil" dentro do app 
                MeuRebanho e selecione a opção "Excluir minha conta". O processo é imediato para dados locais 
                e inicia a limpeza em nossos servidores.
              </li>
              <li>
                <strong>Via E-mail:</strong> Envie um e-mail para <strong>contato@meurebanho.app</strong> 
                com o assunto "Solicitação de Exclusão de Conta". Para sua segurança, a solicitação deve 
                partir do mesmo e-mail cadastrado na plataforma.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mt-8 mb-4">Etapas do Processo</h2>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Após a solicitação, sua conta será desativada imediatamente.</li>
              <li>Nossa equipe processará a exclusão definitiva dos dados em até 30 dias.</li>
              <li>Você receberá uma confirmação por e-mail assim que o processo estiver concluído.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mt-8 mb-4">Quais dados são excluídos?</h2>
            <p>Ao processar sua solicitação, excluiremos permanentemente:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Suas informações de perfil (nome, e-mail, foto).</li>
              <li>Todos os registros de animais e rebanhos vinculados à sua conta.</li>
              <li>Históricos de vacinas, ocorrências e notas de manejo.</li>
              <li>Dados de localização de propriedades vinculadas.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mt-8 mb-4">Dados Mantidos</h2>
            <p>
              Em conformidade com a legislação vigente (LGPD), poderemos manter registros de 
              transações financeiras e notas fiscais por períodos determinados para cumprimento de 
              obrigações legais, contábeis ou ordens judiciais.
            </p>
          </section>

          <section className="bg-neutral-50 p-6 rounded-2xl border border-neutral-100 italic">
            <p className="mb-0">
              <strong>Importante:</strong> A exclusão da conta é um processo irreversível. 
              Uma vez concluída, não será possível recuperar os dados do seu rebanho.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
