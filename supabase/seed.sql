-- ============================================================
-- CVMKR — Seed: Currículo base de Eduardo Damasceno
-- Run AFTER the migration (001_schema.sql)
-- ============================================================

DO $$
DECLARE
  base_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN

-- ── Resume ──────────────────────────────────────────────────────────────────
INSERT INTO resumes (id, name, description, is_base, is_active)
VALUES (
  base_id,
  'Currículo Base',
  'Currículo padrão – Eduardo Damasceno',
  TRUE,
  TRUE
)
ON CONFLICT (id) DO NOTHING;

-- ── Profile ─────────────────────────────────────────────────────────────────
INSERT INTO profile (resume_id, name, title, location, email, phone, linkedin, summary)
VALUES (
  base_id,
  'Eduardo Damasceno',
  'Designer de Produto | UX/UI | Inovação e Estratégia',
  'São Paulo, SP — Brasil',
  'contato@eduardodamasceno.com.br',
  '',
  'https://www.linkedin.com/in/eduardodamasceno',
  'Com mais de 15 anos de experiência em design de produto, UX/UI, inovação e transformação digital, desenvolvi uma sólida expertise na criação de soluções centradas no usuário para produtos digitais e físicos. Atuo como Product Designer em projetos estratégicos voltados à experiência do cliente, com foco em usabilidade, acessibilidade e arquitetura de negócio.
Atualmente, colaboro com equipes multidisciplinares em ambientes complexos, especialmente no setor financeiro, como na XP Inc., onde participei da evolução de ferramentas de atendimento e planejamento financeiro para assessores de investimentos. Também conduzi iniciativas voltadas à organização de estruturas comerciais e à melhoria da experiência de gestão em escritórios parceiros.
Anteriormente, fui designer na Toledo do Brasil, onde atuei em todas as etapas do desenvolvimento de produtos físicos e digitais — da conceituação e esboços à prototipação e entrega final. Tenho domínio de ferramentas como Figma, Adobe Creative Suite, SolidWorks e OnShape. Sou formado em Design e atuo com visão estratégica, foco em métricas e colaboração ativa com times de produto e engenharia.'
)
ON CONFLICT (resume_id) DO NOTHING;

-- ── Experiences ─────────────────────────────────────────────────────────────
INSERT INTO experiences (resume_id, company, role, start_date, end_date, is_current, description, order_index)
VALUES
  (
    base_id,
    'XP Inc.',
    'UX/UI Designer',
    'Junho de 2021',
    NULL,
    TRUE,
    'Participei da evolução de ferramentas de atendimento e planejamento financeiro para assessores de investimentos.
Conduzi iniciativas voltadas à organização de estruturas comerciais e à melhoria da experiência de gestão em escritórios parceiros.',
    0
  ),
  (
    base_id,
    'Sinqia (Torq Inovação)',
    'UX/UI Designer',
    'Outubro de 2018',
    'Julho de 2021',
    FALSE,
    'Colaborei com grandes players do mercado financeiro, atuando com design de serviços e interfaces digitais.
Trabalhei em projetos estratégicos com foco em inovação e arquitetura de negócio.',
    1
  ),
  (
    base_id,
    'Toledo do Brasil',
    'Analista de Design',
    'Janeiro de 2004',
    'Agosto de 2018',
    FALSE,
    'Desenvolvi produtos físicos e digitais, incluindo hardware industrial e interfaces embarcadas.
Atuei com modelagem 3D, prototipação, UI/UX e integração software-hardware.',
    2
  )
ON CONFLICT DO NOTHING;

-- ── Skills ──────────────────────────────────────────────────────────────────
INSERT INTO skills (resume_id, category, items)
VALUES
  (
    base_id,
    'Top Skills',
    ARRAY[
      'UX/UI Design',
      'Interaction Design',
      'Design de Serviços',
      'Modelagem de Jornadas',
      'Prototipação em Alta Fidelidade',
      'Design Systems',
      'Testes de Usabilidade',
      'Integração entre Software e Hardware'
    ]
  ),
  (
    base_id,
    'Ferramentas',
    ARRAY['Figma', 'Adobe Creative Suite', 'SolidWorks', 'OnShape']
  ),
  (
    base_id,
    'Idiomas',
    ARRAY[
      'Português (Nativo ou Bilingue)',
      'Inglês (Profissional Avançado)',
      'Espanhol (Nível Básico)'
    ]
  )
ON CONFLICT DO NOTHING;

-- ── Education ───────────────────────────────────────────────────────────────
INSERT INTO education (resume_id, title, institution, description, order_index)
VALUES
  (base_id, 'Master em Design Industrial', 'Istituto Europeo di Design', '', 0),
  (base_id, 'Bacharelado em Comunicação Social', 'Faculdade Cásper Líbero', '', 1),
  (base_id, 'Extensão em Branding', 'ESPM', '', 2),
  (base_id, 'Curso de Design de Serviços', 'Fluxe School', '', 3),
  (base_id, 'Arquitetura Corporativa com TOGAF 9.1', 'Udemy', '', 4)
ON CONFLICT DO NOTHING;

END $$;
