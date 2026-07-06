/** Catálogo do design system do portfólio — fonte única para /ds e futura migração do CV */

export const designSystemMeta = {
  name: 'Eduardo Damasceno DS',
  version: '0.1.0',
  scope: 'portfolio',
  fontFamily: 'Inter',
  fontWeights: [300, 400, 500, 600, 700, 800] as const,
  themeRoot: '.portfolio-theme',
  themeAttribute: 'data-theme',
  storageKey: 'portfolio-theme-mode',
} as const

export type DesignToken = {
  name: string
  cssVar: `--${string}`
  description: string
}

export const tokenGroups: { id: string; label: string; tokens: DesignToken[] }[] = [
  {
    id: 'foundation',
    label: 'Fundação',
    tokens: [
      { name: 'Background', cssVar: '--pf-bg', description: 'Fundo principal da página' },
      { name: 'Text', cssVar: '--pf-text', description: 'Texto primário e títulos' },
      { name: 'Muted', cssVar: '--pf-muted', description: 'Texto secundário forte' },
      { name: 'Muted 2', cssVar: '--pf-muted-2', description: 'Corpo, links do rodapé, UI secundária' },
      { name: 'Muted 3', cssVar: '--pf-muted-3', description: 'Meta, captions, placeholders' },
    ],
  },
  {
    id: 'surface',
    label: 'Superfícies',
    tokens: [
      { name: 'Surface', cssVar: '--pf-surface', description: 'Cards, inputs, painéis' },
      { name: 'Surface 2', cssVar: '--pf-surface-2', description: 'Rodapé, CTAs secundários, carrossel' },
      { name: 'Sticky BG', cssVar: '--pf-sticky-bg', description: 'Títulos sticky com parallax' },
      { name: 'Blob', cssVar: '--pf-blob', description: 'Decoração do hero' },
    ],
  },
  {
    id: 'border',
    label: 'Bordas e overlay',
    tokens: [
      { name: 'Border', cssVar: '--pf-border', description: 'Divisórias sutis' },
      { name: 'Border strong', cssVar: '--pf-border-strong', description: 'Inputs, botões outline' },
      { name: 'Overlay', cssVar: '--pf-overlay', description: 'Camadas sobre conteúdo' },
    ],
  },
  {
    id: 'interactive',
    label: 'Interação',
    tokens: [
      { name: 'Button hover BG', cssVar: '--pf-btn-hover-bg', description: 'Hover invertido (pill CTAs)' },
      { name: 'Button hover text', cssVar: '--pf-btn-hover-text', description: 'Texto no hover invertido' },
    ],
  },
  {
    id: 'glass',
    label: 'Glass',
    tokens: [
      { name: 'Glass BG', cssVar: '--pf-glass-bg', description: 'Nav e sticky titles (.pf-glass)' },
      { name: 'Glass fallback', cssVar: '--pf-glass-fallback', description: 'Sem backdrop-filter' },
      { name: 'Glass border', cssVar: '--pf-glass-border', description: 'Borda do glass' },
      { name: 'Glass highlight', cssVar: '--pf-glass-highlight', description: 'Reflexo interno' },
      { name: 'Glass shadow', cssVar: '--pf-glass-shadow', description: 'Sombra do glass' },
    ],
  },
  {
    id: 'prose',
    label: 'Prose (cases)',
    tokens: [
      { name: 'Body text', cssVar: '--pf-body-text', description: '.case-body parágrafos' },
      { name: 'Body heading', cssVar: '--pf-body-heading', description: '.case-body títulos' },
      { name: 'Body link', cssVar: '--pf-body-link', description: 'Links no conteúdo' },
      { name: 'Quote border', cssVar: '--pf-body-quote-border', description: 'Blockquote' },
    ],
  },
  {
    id: 'chat',
    label: 'Chat e modais',
    tokens: [
      { name: 'Chat overlay', cssVar: '--pf-chat-overlay', description: 'Backdrop modal / sheet (desktop)' },
      { name: 'Chat BG', cssVar: '--pf-chat-bg', description: 'Fundo sheet, modal, chat' },
      { name: 'Chat surface', cssVar: '--pf-chat-surface', description: 'Bolhas do bot' },
      { name: 'Chat user', cssVar: '--pf-chat-user', description: 'Bolhas do visitante' },
      { name: 'Chat input', cssVar: '--pf-chat-input', description: 'Campo de mensagem' },
      { name: 'Chat send', cssVar: '--pf-chat-send', description: 'Botão enviar' },
      { name: 'Chat send hover', cssVar: '--pf-chat-send-hover', description: 'Hover enviar' },
      { name: 'Chat send text', cssVar: '--pf-chat-send-text', description: 'Texto do botão enviar' },
      { name: 'Chat muted', cssVar: '--pf-chat-muted', description: 'Status, meta, typing' },
      { name: 'Chat text', cssVar: '--pf-chat-text', description: 'Texto principal no chat/modal' },
    ],
  },
]

export const typographyScale = [
  {
    id: 'hero-name',
    label: 'Hero — nome',
    sample: 'Eduardo Damasceno',
    className:
      'hero-name text-[clamp(2.75rem,12vw,7rem)] font-bold uppercase tracking-[-0.04em] leading-[0.92] text-[var(--pf-text)]',
    usage: 'HeroSection',
  },
  {
    id: 'hero-role',
    label: 'Hero — cargo',
    sample: 'Designer de Produto',
    className: 'hero-role text-lg sm:text-xl font-light text-[var(--pf-muted-2)]',
    usage: 'HeroSection',
  },
  {
    id: 'section-heading',
    label: 'Seção — título',
    sample: 'Experiência em:',
    className: 'text-2xl sm:text-3xl font-medium tracking-tight text-[var(--pf-text)] leading-snug',
    usage: 'PortfolioHome, cases',
  },
  {
    id: 'section-body',
    label: 'Seção — corpo',
    sample: 'Plataformas financeiras, produtos B2B e sistemas complexos.',
    className: 'text-base sm:text-lg font-light text-[var(--pf-muted-2)] leading-relaxed',
    usage: 'PortfolioHome, about',
  },
  {
    id: 'ui-base',
    label: 'UI — base',
    sample: 'LinkedIn · Currículo · Privacidade',
    className: 'text-base text-[var(--pf-muted-2)]',
    usage: 'Rodapé, chat launcher',
  },
  {
    id: 'ui-sm',
    label: 'UI — sm',
    sample: 'São Paulo, Brasil · © 2026',
    className: 'text-sm text-[var(--pf-muted-3)]',
    usage: 'Rodapé meta, chat, nav',
  },
  {
    id: 'prose',
    label: 'Prose — case body',
    sample: 'Parágrafo longo com font-light e boa leitura em telas largas.',
    className: 'case-body text-base sm:text-lg',
    usage: '.case-body em CaseDetailView',
  },
] as const

export const layoutTokens = [
  { label: 'Largura máxima', value: 'max-w-[80rem] (1280px)' },
  { label: 'Padding horizontal', value: 'px-6 sm:px-10' },
  { label: 'Seção vertical', value: 'py-16 sm:py-24' },
  { label: 'Grid seção', value: 'lg:grid-cols-[1fr_1.2fr] · gap-8 sm:gap-12 lg:gap-20' },
  { label: 'Nav offset', value: 'var(--pf-nav-offset)' },
  { label: 'Safe area', value: 'env(safe-area-inset-*) em sheet/modal/footer' },
] as const

export const motionTokens = [
  { label: 'Sheet in/out', value: '380ms · cubic-bezier(0.22, 1, 0.36, 1)' },
  { label: 'Overlay fade', value: '280ms ease-out/in' },
  { label: 'Modal panel', value: '320ms in · 280ms out' },
  { label: 'Chat script pause', value: '320ms entre mensagens' },
  { label: 'Typing indicator', value: '520ms (script) · 480ms (reply)' },
  { label: 'Reduced motion', value: 'prefers-reduced-motion → 0.01ms' },
] as const

export const patterns = [
  {
    id: 'modal',
    label: 'Modal centralizado',
    when: 'Conteúdo informacional — leitura, sem fluxo contínuo.',
    example: 'Privacidade (PortfolioPrivacyModal)',
    desktop: 'Centralizado, max-w-lg, overlay clicável',
    mobile: 'Fullscreen, sem overlay externo',
  },
  {
    id: 'sheet',
    label: 'Side sheet',
    when: 'Ações e interação — chat, formulários, fluxo.',
    example: 'Chat (PortfolioSideSheet)',
    desktop: 'Direita, inset 32px, overlay',
    mobile: 'Fullscreen, slide da direita',
  },
  {
    id: 'footer',
    label: 'Rodapé site',
    when: 'Links persistentes + meta legal.',
    example: 'PortfolioSiteFooter',
    desktop: 'Faixa full-bleed surface-2',
    mobile: 'Igual — coluna vertical',
  },
] as const

export const cssUtilities = [
  { name: '.pf-glass', description: 'Blur + saturação para nav e sticky titles' },
  { name: '.case-body', description: 'Prose tipográfico para HTML de cases' },
  { name: '.hero-name', description: 'Peso 700 + antialiasing no display' },
  { name: '.pf-chat-sheet', description: 'Animação entrada/saída do side sheet (keyframes)' },
  { name: '.pf-modal-panel-in', description: 'Animação entrada do modal' },
  { name: '.pf-chat-typing-dot', description: 'Indicador de digitação' },
] as const

export type ComponentEntry = {
  name: string
  path: string
  kind: 'component' | 'motion' | 'pattern'
  description: string
}

export const componentCatalog: ComponentEntry[] = [
  { name: 'PortfolioNav', path: 'components/portfolio/PortfolioNav.tsx', kind: 'component', description: 'Nav fixa com glass e hide on scroll' },
  { name: 'ThemeToggle', path: 'components/portfolio/ThemeToggle.tsx', kind: 'component', description: 'Alternância light/dark manual' },
  { name: 'PortfolioSiteFooter', path: 'components/portfolio/PortfolioSiteFooter.tsx', kind: 'component', description: 'Rodapé full-bleed minimalista' },
  { name: 'PortfolioModal', path: 'components/portfolio/PortfolioModal.tsx', kind: 'pattern', description: 'Shell modal informacional' },
  { name: 'PortfolioSideSheet', path: 'components/portfolio/PortfolioSideSheet.tsx', kind: 'pattern', description: 'Shell lateral para ações' },
  { name: 'PortfolioChat', path: 'components/portfolio/PortfolioChat.tsx', kind: 'component', description: 'Chat scriptado + launcher' },
  { name: 'PortfolioPrivacyModal', path: 'components/portfolio/PortfolioPrivacyModal.tsx', kind: 'component', description: 'Privacidade sobre PortfolioModal' },
  { name: 'CaseCard', path: 'components/portfolio/CaseCard.tsx', kind: 'component', description: 'Card de case no grid' },
  { name: 'CaseImageCarousel', path: 'components/portfolio/CaseImageCarousel.tsx', kind: 'component', description: 'Carrossel com swipe mobile' },
  { name: 'CaseDetailView', path: 'components/portfolio/CaseDetailView.tsx', kind: 'component', description: 'Página de case + prose' },
  { name: 'ClientList', path: 'components/portfolio/ClientList.tsx', kind: 'component', description: 'Logos / nomes de clientes' },
  { name: 'PortfolioLoginForm', path: 'components/portfolio/PortfolioLoginForm.tsx', kind: 'component', description: 'Login cases protegidos' },
  { name: 'HeroSection', path: 'components/portfolio/motion/HeroSection.tsx', kind: 'motion', description: 'Hero com parallax e scroll hint' },
  { name: 'FlyInText', path: 'components/portfolio/motion/FlyInText.tsx', kind: 'motion', description: 'Entrada por caractere (SplitType)' },
  { name: 'RevealOnScroll', path: 'components/portfolio/motion/RevealOnScroll.tsx', kind: 'motion', description: 'Fade/slide on scroll' },
  { name: 'StickyParallaxTitle', path: 'components/portfolio/motion/StickyParallaxTitle.tsx', kind: 'motion', description: 'Título sticky com glass' },
]

export const roadmapNotes = [
  'CV migrará para estes tokens (--pf-*) em vez do tema azul legado.',
  'CVMKR admin mantém .cvmkr-field até unificação completa.',
  'Novos componentes devem consumir CSS vars, não cores hardcoded.',
] as const
