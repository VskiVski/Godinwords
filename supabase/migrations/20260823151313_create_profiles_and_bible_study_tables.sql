/*
# Perfis e estudo da Bíblia (marcações e favoritos)

1. Novas tabelas
  - `profiles`
    - `id` (uuid, chave primária, ligado à conta de autenticação do usuário)
    - `display_name` (texto, nome exibido no site)
    - `created_at` (data de criação)
  - `bible_highlights`
    - `id` (uuid, chave primária)
    - `user_id` (uuid, dono da marcação)
    - `translation` (texto, identificador da versão da Bíblia, ex: "almeida")
    - `book_id` (texto, identificador do livro, ex: "JHN")
    - `chapter` (número do capítulo)
    - `verse` (número do versículo)
    - `color` (cor usada para marcar o texto)
    - `created_at` (data de criação)
  - `bible_bookmarks`
    - `id` (uuid, chave primária)
    - `user_id` (uuid, dono do favorito)
    - `translation` (texto, versão da Bíblia)
    - `book_id` (texto, identificador do livro)
    - `book_name` (texto, nome do livro para exibição)
    - `chapter` (número do capítulo)
    - `verse` (número do versículo)
    - `verse_text` (texto do versículo salvo, para exibir na lista de favoritos sem nova busca)
    - `created_at` (data de criação)

2. Segurança
  - RLS habilitado em todas as tabelas.
  - Cada usuário autenticado só pode ver, criar, alterar e apagar seus próprios registros.
  - `bible_highlights` e `bible_bookmarks` têm uma restrição de unicidade por usuário+versão+livro+capítulo+versículo, evitando duplicados.

3. Observações
  - Nenhuma tabela é pública: leitura da Bíblia em si acontece por uma API externa, então estas tabelas guardam apenas as marcações pessoais de cada leitor.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS bible_highlights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  translation text NOT NULL,
  book_id text NOT NULL,
  chapter integer NOT NULL,
  verse integer NOT NULL,
  color text NOT NULL DEFAULT 'yellow',
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, translation, book_id, chapter, verse)
);

ALTER TABLE bible_highlights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_highlights" ON bible_highlights;
CREATE POLICY "select_own_highlights" ON bible_highlights FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_highlights" ON bible_highlights;
CREATE POLICY "insert_own_highlights" ON bible_highlights FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_highlights" ON bible_highlights;
CREATE POLICY "update_own_highlights" ON bible_highlights FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_highlights" ON bible_highlights;
CREATE POLICY "delete_own_highlights" ON bible_highlights FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS bible_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  translation text NOT NULL,
  book_id text NOT NULL,
  book_name text NOT NULL,
  chapter integer NOT NULL,
  verse integer NOT NULL,
  verse_text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, translation, book_id, chapter, verse)
);

ALTER TABLE bible_bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_bookmarks" ON bible_bookmarks;
CREATE POLICY "select_own_bookmarks" ON bible_bookmarks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_bookmarks" ON bible_bookmarks;
CREATE POLICY "insert_own_bookmarks" ON bible_bookmarks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_bookmarks" ON bible_bookmarks;
CREATE POLICY "update_own_bookmarks" ON bible_bookmarks FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_bookmarks" ON bible_bookmarks;
CREATE POLICY "delete_own_bookmarks" ON bible_bookmarks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
