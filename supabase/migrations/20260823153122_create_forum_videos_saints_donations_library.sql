/*
# Fórum, vídeos, santos, biblioteca e doações

1. Novas tabelas
  - `forum_topics`: tópicos criados por usuários (título, conteúdo, autor, contagem de respostas).
  - `forum_replies`: respostas dentro de cada tópico.
  - `videos`: vídeos curtos e longos enviados pelos usuários (título, descrição, URL, tipo, contagem de likes).
  - `video_likes`: registro de likes por usuário em vídeos (evita duplicados).
  - `saints`: santos cadastrados por país (nome, país, história, aparições, milagres).
  - `donations`: registro de doações recebidas (valor, mensagem opcional, doador anônimo ou logado).
  - `library_books`: livros católicos disponíveis para leitura gratuita (título, autor, descrição, URL do conteúdo).

2. Segurança
  - RLS habilitado em todas as tabelas.
  - Leitura pública (anon + authenticated) para santos, livros, vídeos, tópicos e respostas (conteúdo da comunidade).
  - Escrita de tópicos, respostas, vídeos e likes restrita a usuários autenticados, com verificação de propriedade.
  - Doações podem ser feitas por anon ou authenticated (permitir doações sem login).
  - `video_likes` tem restrição de unicidade por usuário+vídeo.

3. Observações
  - `forum_replies_count` é mantido por trigger ao inserir/remover respostas.
  - `video_likes_count` é mantido por trigger ao inserir/remover likes.
*/

CREATE TABLE IF NOT EXISTS forum_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name text NOT NULL DEFAULT 'Peregrino',
  title text NOT NULL,
  content text NOT NULL,
  replies_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE forum_topics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_forum_topics" ON forum_topics;
CREATE POLICY "read_forum_topics" ON forum_topics FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_forum_topics" ON forum_topics;
CREATE POLICY "insert_own_forum_topics" ON forum_topics FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_forum_topics" ON forum_topics;
CREATE POLICY "update_own_forum_topics" ON forum_topics FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_forum_topics" ON forum_topics;
CREATE POLICY "delete_own_forum_topics" ON forum_topics FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS forum_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name text NOT NULL DEFAULT 'Peregrino',
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_forum_replies" ON forum_replies;
CREATE POLICY "read_forum_replies" ON forum_replies FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_forum_replies" ON forum_replies;
CREATE POLICY "insert_own_forum_replies" ON forum_replies FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_forum_replies" ON forum_replies;
CREATE POLICY "delete_own_forum_replies" ON forum_replies FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION increment_replies_count() RETURNS TRIGGER AS $$
BEGIN
  UPDATE forum_topics SET replies_count = replies_count + 1 WHERE id = NEW.topic_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_increment_replies ON forum_replies;
CREATE TRIGGER trg_increment_replies AFTER INSERT ON forum_replies
  FOR EACH ROW EXECUTE FUNCTION increment_replies_count();

CREATE OR REPLACE FUNCTION decrement_replies_count() RETURNS TRIGGER AS $$
BEGIN
  UPDATE forum_topics SET replies_count = GREATEST(replies_count - 1, 0) WHERE id = OLD.topic_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_decrement_replies ON forum_replies;
CREATE TRIGGER trg_decrement_replies AFTER DELETE ON forum_replies
  FOR EACH ROW EXECUTE FUNCTION decrement_replies_count();

CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name text NOT NULL DEFAULT 'Peregrino',
  title text NOT NULL,
  description text DEFAULT '',
  video_type text NOT NULL DEFAULT 'short',
  video_url text NOT NULL,
  likes_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_videos" ON videos;
CREATE POLICY "read_videos" ON videos FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_videos" ON videos;
CREATE POLICY "insert_own_videos" ON videos FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_videos" ON videos;
CREATE POLICY "delete_own_videos" ON videos FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS video_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (video_id, user_id)
);

ALTER TABLE video_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_video_likes" ON video_likes;
CREATE POLICY "read_video_likes" ON video_likes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_video_likes" ON video_likes;
CREATE POLICY "insert_own_video_likes" ON video_likes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_video_likes" ON video_likes;
CREATE POLICY "delete_own_video_likes" ON video_likes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION increment_video_likes() RETURNS TRIGGER AS $$
BEGIN
  UPDATE videos SET likes_count = likes_count + 1 WHERE id = NEW.video_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_increment_video_likes ON video_likes;
CREATE TRIGGER trg_increment_video_likes AFTER INSERT ON video_likes
  FOR EACH ROW EXECUTE FUNCTION increment_video_likes();

CREATE OR REPLACE FUNCTION decrement_video_likes() RETURNS TRIGGER AS $$
BEGIN
  UPDATE videos SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.video_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_decrement_video_likes ON video_likes;
CREATE TRIGGER trg_decrement_video_likes AFTER DELETE ON video_likes
  FOR EACH ROW EXECUTE FUNCTION decrement_video_likes();

CREATE TABLE IF NOT EXISTS saints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text NOT NULL,
  country_code text NOT NULL DEFAULT '',
  feast_day text DEFAULT '',
  story text NOT NULL DEFAULT '',
  apparitions text DEFAULT '',
  miracles text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE saints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_saints" ON saints;
CREATE POLICY "read_saints" ON saints FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_saints" ON saints;
CREATE POLICY "insert_saints" ON saints FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_saints" ON saints;
CREATE POLICY "update_saints" ON saints FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_name text NOT NULL DEFAULT 'Anônimo',
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  message text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_donations" ON donations;
CREATE POLICY "read_donations" ON donations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_donations" ON donations;
CREATE POLICY "insert_donations" ON donations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE TABLE IF NOT EXISTS library_books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text DEFAULT '',
  description text DEFAULT '',
  cover_url text DEFAULT '',
  content_url text DEFAULT '',
  category text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE library_books ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_library_books" ON library_books;
CREATE POLICY "read_library_books" ON library_books FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_library_books" ON library_books;
CREATE POLICY "insert_library_books" ON library_books FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_library_books" ON library_books;
CREATE POLICY "update_library_books" ON library_books FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
