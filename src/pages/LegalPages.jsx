import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Logo from '@/components/Logo';

const CONTACT_EMAIL = 'daniloo.ag2@gmail.com';
const UPDATED_AT = '29 de outubro de 2026';

function LegalLayout({ title, children }) {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <Logo className="h-9 w-9" />
        <span className="font-display text-lg font-semibold tracking-tight">Tá na Lista</span>
      </Link>

      <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">Atualizado em {UPDATED_AT}</p>

      <div className="mt-8 space-y-8 text-[15px] leading-relaxed">{children}</div>

      <nav className="mt-12 flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-6 text-sm text-muted-foreground">
        <Link to="/" className="inline-flex items-center gap-1.5 hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar ao app
        </Link>
        <Link to="/privacidade" className="hover:text-foreground">Política de Privacidade</Link>
        <Link to="/termos" className="hover:text-foreground">Termos de Uso</Link>
      </nav>
    </main>
  );
}

function Section({ title, children }) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-xl font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

const List = ({ children }) => <ul className="list-disc space-y-1.5 pl-5">{children}</ul>;

export function PrivacyPage() {
  return (
    <LegalLayout title="Política de Privacidade">
      <p>
        O <strong>Tá na Lista</strong> é um aplicativo de listas (mercado, casa, viagem, trabalho ou o que você precisar). Esta política explica quais dados
        tratamos, para quê, com quem compartilhamos e como você exerce seus direitos, de acordo com a Lei Geral de
        Proteção de Dados (LGPD, Lei 13.709/2018).
      </p>

      <Section title="1. Quem é o responsável">
        <p>
          O responsável pelo tratamento dos dados é Danilo Araujo, pessoa física, que mantém o aplicativo. Contato
          para qualquer assunto sobre privacidade: <a className="underline underline-offset-4" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </Section>

      <Section title="2. Usar sem conta">
        <p>
          Sem login, suas listas ficam <strong>somente no seu navegador</strong> (armazenamento local). Nada disso é
          enviado aos nossos servidores. Se você limpar os dados do navegador, as listas se perdem.
        </p>
      </Section>

      <Section title="3. Quais dados tratamos quando você cria uma conta">
        <List>
          <li><strong>Dados da conta:</strong> nome, e-mail e, se você entrar com o Google, o identificador da sua conta Google e a foto de perfil.</li>
          <li><strong>Senha:</strong> se você usa e-mail e senha, guardamos apenas um <em>hash</em> da senha (nunca a senha em si).</li>
          <li><strong>Suas listas:</strong> nome das listas e dos produtos, categoria, quantidade, valor, se o item foi marcado, e quem criou e editou cada item.</li>
          <li><strong>Compartilhamento:</strong> quem tem acesso a cada lista e com qual permissão (somente leitura ou edição), e os convites criados.</li>
          <li><strong>Segurança:</strong> sessões de login (guardamos o hash do token e o navegador usado), e o endereço IP por até 24 horas para limitar tentativas abusivas.</li>
          <li><strong>E-mails do serviço:</strong> enviamos mensagens de confirmação de cadastro, recuperação de senha e reativação de conta.</li>
        </List>
        <p>Não usamos publicidade, não vendemos dados e não criamos perfis de comportamento.</p>
      </Section>

      <Section title="4. Para que usamos">
        <List>
          <li>Criar e manter sua conta e permitir que você entre em qualquer aparelho.</li>
          <li>Guardar e sincronizar suas listas, inclusive em tempo real entre aparelhos e pessoas com quem você compartilha.</li>
          <li>Mostrar às pessoas de uma lista o nome de quem fez cada alteração. Quem recebe um convite vê o seu nome; só o dono de uma lista vê o e-mail das pessoas convidadas.</li>
          <li>Proteger o serviço contra fraude e abuso, e enviar os e-mails descritos acima.</li>
        </List>
        <p>As bases legais são a execução do serviço que você solicitou, o legítimo interesse em manter o serviço seguro e, quando aplicável, o seu consentimento.</p>
      </Section>

      <Section title="5. Login com o Google">
        <p>
          Ao entrar com o Google, recebemos apenas o seu nome, e-mail e foto de perfil, e usamos esses dados somente
          para criar e identificar sua conta. O uso e a transferência de informações recebidas das APIs do Google
          seguem a{' '}
          <a className="underline underline-offset-4" href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer">
            Política de Dados do Usuário dos Serviços de API do Google
          </a>
          , incluindo os requisitos de Uso Limitado. Não usamos esses dados para publicidade nem os transferimos a
          terceiros.
        </p>
      </Section>

      <Section title="6. Com quem compartilhamos">
        <p>Usamos prestadores de infraestrutura para operar o serviço. Eles tratam os dados apenas para isso:</p>
        <List>
          <li><strong>Cloudflare</strong> (hospedagem da API e banco de dados);</li>
          <li><strong>Vercel</strong> (hospedagem do site);</li>
          <li><strong>Resend</strong> (envio de e-mails);</li>
          <li><strong>Google</strong> (apenas se você escolher entrar com a conta Google).</li>
        </List>
        <p>
          Esses prestadores podem processar dados em servidores fora do Brasil. Fora isso, só compartilhamos dados
          por obrigação legal ou ordem judicial. As pessoas com quem <em>você</em> compartilha uma lista veem o
          conteúdo dela, por decisão sua.
        </p>
      </Section>

      <Section title="7. Armazenamento no seu navegador">
        <p>
          Não usamos cookies de rastreamento. Guardamos no armazenamento local do navegador apenas o necessário para
          o app funcionar: sua sessão de login, suas listas no modo sem conta, o tema (claro/escuro) e preferências de
          interface.
        </p>
      </Section>

      <Section title="8. Por quanto tempo guardamos">
        <List>
          <li>Enquanto sua conta estiver ativa, guardamos seus dados para prestar o serviço.</li>
          <li>
            <strong>Ao excluir a conta, ela é apenas desativada.</strong> Você deixa de conseguir entrar, mas as
            listas e os dados da conta ficam guardados para que você possa reativá-la (cadastrando o mesmo e-mail ou
            entrando com o Google). Pessoas convidadas nas suas listas continuam com acesso a elas.
          </li>
          <li>
            Se você quiser que seus dados sejam <strong>apagados definitivamente</strong>, peça pelo e-mail acima. Atenderemos
            em prazo razoável, respeitando eventuais obrigações legais.
          </li>
          <li>Sessões expiradas, links de uso único e registros de limite de tentativas são removidos automaticamente.</li>
        </List>
      </Section>

      <Section title="9. Seus direitos">
        <p>Pela LGPD você pode, a qualquer momento, pedir:</p>
        <List>
          <li>confirmação de que tratamos seus dados e acesso a eles;</li>
          <li>correção de dados incompletos ou desatualizados;</li>
          <li>eliminação dos dados, anonimização ou bloqueio;</li>
          <li>portabilidade dos dados;</li>
          <li>informação sobre com quem compartilhamos e revogação de consentimento.</li>
        </List>
        <p>Escreva para <a className="underline underline-offset-4" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Você também pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD).</p>
      </Section>

      <Section title="10. Segurança">
        <p>
          Adotamos medidas como senhas armazenadas só como hash, conexões criptografadas (HTTPS), tokens de acesso
          guardados apenas em forma de hash, limite de tentativas de login e controle de acesso por lista. Nenhum
          sistema é totalmente imune a falhas; em caso de incidente relevante, avisaremos os afetados conforme a lei.
        </p>
      </Section>

      <Section title="11. Crianças e adolescentes">
        <p>O serviço não é direcionado a menores de 13 anos, e não coletamos dados deles de propósito. Se identificarmos, removeremos.</p>
      </Section>

      <Section title="12. Mudanças nesta política">
        <p>Podemos atualizar esta política. A data no topo mostra a última revisão. Mudanças relevantes serão avisadas no app ou por e-mail.</p>
      </Section>
    </LegalLayout>
  );
}

export function TermsPage() {
  return (
    <LegalLayout title="Termos de Uso">
      <p>
        Estes termos regem o uso do <strong>Tá na Lista</strong>, aplicativo gratuito de listas. Ao criar
        uma conta ou usar o serviço, você concorda com eles. Se não concordar, não use o serviço.
      </p>

      <Section title="1. O serviço">
        <p>
          Você pode usar o app sem conta (listas só no navegador) ou criar uma conta para guardar listas na nuvem,
          acessar de vários aparelhos e compartilhar listas com outras pessoas.
        </p>
      </Section>

      <Section title="2. Sua conta">
        <List>
          <li>Você deve informar dados verdadeiros e manter sua senha em segredo. Você responde pelo que é feito na sua conta.</li>
          <li>Para entrar com e-mail e senha, é preciso confirmar o e-mail. Você também pode entrar com o Google.</li>
          <li>Você pode excluir a conta no menu do usuário. A exclusão <strong>desativa</strong> a conta e guarda os dados, que voltam se você reativá-la. Veja a <Link to="/privacidade" className="underline underline-offset-4">Política de Privacidade</Link>.</li>
        </List>
      </Section>

      <Section title="3. Limites de uso">
        <p>Para manter o serviço gratuito e estável, cada conta pode ter até <strong>3 listas próprias</strong>, com até <strong>150 itens</strong> cada, e uma lista pode ter um número limitado de pessoas com acesso. Esses limites podem mudar com aviso.</p>
      </Section>

      <Section title="4. Compartilhamento">
        <List>
          <li>Ao convidar alguém, você escolhe se a pessoa só vê a lista ou também pode editá-la. Quem pode editar altera o conteúdo para todos, e o nome de quem editou fica registrado.</li>
          <li>Os links de convite são pessoais: quem os receber poderá acessar a lista. Compartilhe só com quem você confia. Você pode cancelar convites e remover pessoas quando quiser.</li>
          <li>Você é responsável pelo conteúdo que coloca nas listas e pelas pessoas a quem dá acesso.</li>
        </List>
      </Section>

      <Section title="5. Uso aceitável">
        <p>É proibido usar o serviço para fins ilegais, tentar acessar contas ou dados de outras pessoas, sobrecarregar ou burlar a segurança do serviço, enviar conteúdo ofensivo ou que viole direitos de terceiros, ou usar meios automatizados abusivos. Podemos limitar, suspender ou encerrar contas que violem estes termos.</p>
      </Section>

      <Section title="6. Disponibilidade e garantias">
        <p>
          O serviço é oferecido <strong>&ldquo;como está&rdquo;</strong>, de forma gratuita, sem garantia de disponibilidade
          contínua ou de ausência de erros. Podemos alterar, pausar ou encerrar funcionalidades. Faça cópias do que
          for importante para você. Na máxima extensão permitida pela lei, não nos responsabilizamos por perdas
          indiretas decorrentes do uso ou da impossibilidade de uso do serviço.
        </p>
      </Section>

      <Section title="7. Propriedade">
        <p>O app e sua marca pertencem ao responsável pelo serviço. O conteúdo das suas listas continua sendo seu; você nos autoriza a guardá-lo e exibi-lo às pessoas com quem você compartilhar, apenas para o funcionamento do serviço.</p>
      </Section>

      <Section title="8. Mudanças nestes termos">
        <p>Podemos atualizar estes termos. A data no topo mostra a última revisão, e o uso continuado depois da mudança indica concordância com a nova versão.</p>
      </Section>

      <Section title="9. Lei aplicável e contato">
        <p>
          Estes termos seguem as leis do Brasil. Dúvidas ou solicitações: <a className="underline underline-offset-4" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </Section>
    </LegalLayout>
  );
}
