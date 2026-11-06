/** Copy da home do portfolio */

export const portfolioHero = {
  role: 'Senior Product Designer',
  /** Quebra controlada abaixo de `sm`. Uma linha só não insere a quebra. */
  roleLines: ['Senior Product Designer'] as const,
}

export const portfolioAbout = {
  heading: 'Transformando complexidade em experiências intuitivas.',
  intro: [
    'Com mais de 15 anos de experiência em Design de Produto, atuo na concepção e evolução de produtos digitais, plataformas financeiras e sistemas complexos. Ao longo da carreira, participei de projetos nos setores financeiro, previdenciário, industrial e de tecnologia, conectando experiência do usuário, processos de negócio, tecnologia e operação.',
    'Meu trabalho envolve estruturar problemas, definir caminhos e transformar desafios complexos em soluções viáveis, simples e consistentes. Da compreensão do problema à materialização das soluções, busco equilibrar necessidades dos usuários, objetivos de negócio e viabilidade técnica.',
  ],
}

export const portfolioSpecialties = [
  'Plataformas financeiras e produtos de investimento',
  'Produtos B2B e SaaS',
  'Sistemas complexos e ambientes regulados',
  'Produtos físicos e interfaces industriais (HMI)',
  'Arquitetura de experiência e Design Systems',
  'IA aplicada à descoberta, concepção e validação de produtos',
] as const

export const portfolioLabels = {
  contactCta: 'Entre em contato →',
  projects: 'Projetos',
  contact: 'Contato',
  specialties: 'Costumo atuar em:',
  experience: 'Empresas:',
  noCases: 'Nenhum case publicado ainda.',
  noCasesFiltered: 'Nenhum projeto neste filtro.',
  caseSegmentAll: 'Todos',
  caseSegmentFilter: 'Filtrar projetos por segmento',
  backToProjects: '← Projetos',
  backToHome: '← Início',
  casesIndexIntro:
    'Seleção de projetos em plataformas financeiras, indústria e produtos autorais.',
  contentMissing: 'Conteúdo ainda não importado.',
  gallery: 'Galeria',
  carouselPrev: 'Imagem anterior',
  carouselNext: 'Próxima imagem',
  carouselGoTo: 'Ir para imagem',
  resume: 'Currículo',
  chatOpen: 'Conversar',
  chatTitle: 'Chat',
  chatClose: 'Fechar conversa',
  chatStatus: 'Offline',
  chatStatusOnline: 'Online',
  chatStatusOffline: 'Offline',
  chatAutomated: '(mensagem automática)',
  chatTyping: 'Edu está digitando',
  chatPlaceholder: 'Sua mensagem…',
  chatWaiting: 'Aguarde…',
  chatSend: 'Enviar',
  chatCharCount: (current: number, max: number) => `${current}/${max}`,
  chatRateLimit: 'Limite excedido, aguarde um momento antes de enviar outra mensagem.',
  chatSessionLimit: 'Limite de mensagens atingido nesta conversa.',
  chatMessageTooLong: 'Máximo de 1000 caracteres.',
  loginRestrictedLabel: 'Acesso restrito',
  loginTitle: 'Portfólio confidencial',
  loginConfidentiality:
    'Este conteúdo contém projetos protegidos por acordos de confidencialidade.',
  loginPasswordHint: 'Se você possui a senha, informe abaixo.',
  loginContactHint: 'Caso contrário, entre em contato para solicitar acesso.',
  footerLinkedIn: 'LinkedIn',
  footerLocation: 'São Paulo, Brasil',
  footerPrivacy: 'Privacidade',
  privacyClose: 'Fechar',
  privacyTitle: 'Privacidade e confidencialidade',
  privacyIntro:
    'Este site é meu portfólio profissional. Abaixo, de forma direta, como trato informações e conteúdo restrito.',
  privacyPortfolio:
    'Cases e imagens podem incluir trabalhos sob confidencialidade com clientes. Parte do portfólio exige senha justamente para proteger materiais sensíveis.',
  privacyChat:
    'Ao usar o chat de contato, você pode enviar nome, e-mail, telefone ou mensagem. Uso essas informações apenas para retornar o contato. Não vendo nem compartilho com terceiros.',
  privacyTechnical:
    'Salvo a preferência de tema claro/escuro no seu navegador (localStorage), não utilizo cookies de rastreamento ou analytics de terceiros neste site.',
  privacyContact: 'Dúvidas? Entre em contato pelo chat ou pelo LinkedIn.',
  themeAuto: 'Seguir tema do sistema',
  themeLight: 'Tema claro',
  themeDark: 'Tema escuro',
  themeCycle: 'Alternar tema',
}
