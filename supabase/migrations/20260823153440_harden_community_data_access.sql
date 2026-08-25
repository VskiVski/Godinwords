/*
# Reforçar segurança dos dados da comunidade

1. Alterações
- Corrige as referências de autor do fórum para remover a conta sem quebrar registros históricos.
- Remove a leitura pública de doações, mantendo apenas o envio.
- Remove escrita pública de santos; o conteúdo publicado fica somente para leitura até existir uma área administrativa.
- Define search_path fixo nas funções de contagem.
- Remove execução direta das funções de contagem por usuários comuns.

2. Segurança
- Doadores e mensagens não ficam expostos publicamente.
- Usuários autenticados continuam podendo criar tópicos, respostas, vídeos e likes.
- Santos e livros permanecem públicos para leitura.
*/

ALTER TABLE forum_topics DROP CONSTRAINT IF EXISTS forum_topics_user_id_fkey;
ALTER TABLE forum_topics ADD CONSTRAINT forum_topics_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE forum_replies DROP CONSTRAINT IF EXISTS forum_replies_user_id_fkey;
ALTER TABLE forum_replies ADD CONSTRAINT forum_replies_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS "read_donations" ON donations;
DROP POLICY IF EXISTS "insert_saints" ON saints;
DROP POLICY IF EXISTS "update_saints" ON saints;

CREATE OR REPLACE FUNCTION increment_replies_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.forum_topics SET replies_count = replies_count + 1 WHERE id = NEW.topic_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION decrement_replies_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.forum_topics SET replies_count = GREATEST(replies_count - 1, 0) WHERE id = OLD.topic_id;
  RETURN OLD;
END;
$$;

CREATE OR REPLACE FUNCTION increment_video_likes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.videos SET likes_count = likes_count + 1 WHERE id = NEW.video_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION decrement_video_likes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.videos SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.video_id;
  RETURN OLD;
END;
$$;

REVOKE EXECUTE ON FUNCTION increment_replies_count() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION decrement_replies_count() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION increment_video_likes() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION decrement_video_likes() FROM anon, authenticated;
