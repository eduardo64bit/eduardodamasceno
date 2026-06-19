import type { SaveResumePayload } from '../types'

export const BASE_RESUME_ID = '00000000-0000-0000-0000-000000000001'

export const baseResumePayload: SaveResumePayload = {
  resumeInfo: {
    name: 'Currículo Base',
    description: 'CV 2026 – Eduardo Damasceno',
  },
  profile: {
    name: 'Eduardo Damasceno',
    title:
      'Senior Product Designer | Plataformas Financeiras | Produtos B2B | Sistemas Complexos',
    location: 'Vila Mariana, São Paulo, SP',
    email: 'eduardo.damasceno@live.com',
    phone: '+55 11 99369-9330',
    linkedin: 'https://linkedin.com/in/eduardodamasceno',
    portfolio: 'https://eduardodamasceno.com.br',
    summary: `Senior Product Designer com mais de 15 anos de experiência no desenvolvimento de produtos, sistemas e experiências digitais. Atuação em plataformas financeiras, sistemas transacionais e ambientes regulados, com foco em arquitetura de experiência, operações, governança e escalabilidade de produtos.
Experiência na condução de iniciativas estratégicas envolvendo onboarding, autenticação, Produto PJ, jornadas complexas, automação de processos e integração entre negócio, tecnologia e operações.`,
  },
  experiences: [
    {
      company: 'XP Inc.',
      role: 'Senior Product Designer',
      start_date: 'Jul/2021',
      end_date: 'Fev/2026',
      is_current: false,
      description: `• Evolução de plataformas financeiras B2B e B2C utilizadas por mais de 18 mil assessores de investimento.
• Liderança da reestruturação do onboarding B2B, consolidando plataformas, automatizando processos e reduzindo em aproximadamente 90% o tempo operacional de cadastro.
• Definição da arquitetura de grupos, governança de acesso e modelos de permissionamento para plataformas corporativas.
• Designer responsável pela evolução da plataforma Wealth Services, redesenhando jornadas de adesão, manutenção e gestão patrimonial.
• Condução da estratégia e discovery da experiência Pessoa Jurídica, incluindo autenticação, perfis de acesso e governança.`,
      order_index: 0,
    },
    {
      company: 'Sinqia (Evertec)',
      role: 'Senior UX/UI Designer',
      start_date: 'Out/2018',
      end_date: 'Jun/2021',
      is_current: false,
      description: `• Desenvolvimento de produtos financeiros e sistemas transacionais para grandes instituições financeiras.
• Atuação na evolução da plataforma HSBC Corporate para pagamentos, transferências, PIX, boletos e operações em lote.
• Construção de dashboards operacionais e experiências voltadas à eficiência e aderência regulatória.
• Participação na transformação da jornada digital de adesão da Quanta Previdência, utilizando pesquisa, service design e prototipação.`,
      order_index: 1,
    },
    {
      company: 'Toledo do Brasil',
      role: 'Analista de Design – Produto & Interface',
      start_date: 'Jan/2004',
      end_date: 'Ago/2018',
      is_current: false,
      description: `• Desenvolvimento de sistemas físico-digitais integrando hardware, software e operação.
• Criação de interfaces homem-máquina (HMI), sistemas embarcados e experiências operacionais para ambientes industriais.
• Reconhecimento com o 27º Prêmio Design Museu da Casa Brasileira na categoria Produto (Prix 6 Touch).`,
      order_index: 2,
    },
    {
      company: 'Bipdoc',
      role: 'Product Designer',
      start_date: '2023',
      end_date: null,
      is_current: true,
      description: `• Desenvolvimento de aplicativo voltado à adesão de tratamentos e gestão de medicamentos.
• Definição da proposta de valor, arquitetura da informação e experiência do usuário.
• Desenvolvimento e validação contínua do MVP utilizando Flutter.`,
      order_index: 3,
    },
  ],
  skills: [
    {
      category: 'Especialidades',
      items: [
        'Product Discovery',
        'UX Strategy',
        'Arquitetura de Experiência',
        'Service Design',
        'IA Aplicada ao Design e Produto',
        'Sistemas Financeiros',
        'Produto PJ',
        'Governança e Permissionamento',
        'Onboarding B2B e KYP',
        'Modelagem de Regras de Negócio',
        'Stakeholder Management',
        'Design Systems',
      ],
    },
    {
      category: 'Ferramentas',
      items: [
        'Figma',
        'FigJam',
        'Miro',
        'Maze',
        'Dovetail',
        'Cursor AI',
        'Claude Code',
        'Flutter',
        'Python',
        'Adobe Creative Suite',
      ],
    },
    {
      category: 'Idiomas',
      items: ['Português (Nativo)', 'Inglês (Avançado)', 'Espanhol (Básico)'],
    },
  ],
  education: [
    {
      title: 'Pós-Graduação em Desenho Industrial',
      institution: 'IED',
      description: '',
      order_index: 0,
    },
    {
      title: 'Bacharelado em Comunicação Social (Publicidade e Propaganda)',
      institution: 'Cásper Líbero',
      description: '',
      order_index: 1,
    },
    {
      title: 'Extensão em Branding',
      institution: 'ESPM',
      description: '',
      order_index: 2,
    },
    {
      title: 'Administrador de Banco de Dados',
      institution: 'IFRS',
      description: 'Formação Complementar',
      order_index: 3,
    },
    {
      title: 'Arquitetura Corporativa com TOGAF 9.1',
      institution: 'Udemy',
      description: 'Formação Complementar',
      order_index: 4,
    },
    {
      title: 'Arquitetura de Software e Design de Sistemas Modernos',
      institution: 'Udemy',
      description: 'Formação Complementar',
      order_index: 5,
    },
    {
      title: 'Design de Serviços',
      institution: 'Fluxe School',
      description: 'Formação Complementar',
      order_index: 6,
    },
    {
      title: 'Programa de Aceleração',
      institution: 'StartSe + ACE',
      description: 'Formação Complementar',
      order_index: 7,
    },
  ],
}
