import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type {
  Item,
  NovaProposta,
  NovoItem,
  NovoUsuario,
  Proposta,
  Repositorio,
  StatusProposta,
  Usuario,
} from './types';

/* Linhas como vêm do Postgres (snake_case). */
interface UsuarioRow {
  id: string;
  nome: string;
  email: string;
  curso: string;
  campus: string;
  trocas_concluidas: number;
}
interface ItemRow {
  id: string;
  dono_id: string;
  titulo: string;
  descricao: string;
  categoria: Item['categoria'];
  condicao: Item['condicao'];
  modalidade: Item['modalidade'];
  aceita_em_troca: string;
  cor: string;
  campus: string;
  status: Item['status'];
  criado_em: string;
}
interface PropostaRow {
  id: string;
  item_id: string;
  de_usuario_id: string;
  para_usuario_id: string;
  item_oferecido_id: string | null;
  mensagem: string;
  status: StatusProposta;
  criada_em: string;
}

export const paraUsuario = (r: UsuarioRow): Usuario => ({
  id: r.id,
  nome: r.nome,
  email: r.email,
  curso: r.curso,
  campus: r.campus,
  trocasConcluidas: r.trocas_concluidas,
});

export const paraItem = (r: ItemRow): Item => ({
  id: r.id,
  donoId: r.dono_id,
  titulo: r.titulo,
  descricao: r.descricao,
  categoria: r.categoria,
  condicao: r.condicao,
  modalidade: r.modalidade,
  aceitaEmTroca: r.aceita_em_troca,
  cor: r.cor,
  campus: r.campus,
  status: r.status,
  criadoEm: r.criado_em,
});

export const paraProposta = (r: PropostaRow): Proposta => ({
  id: r.id,
  itemId: r.item_id,
  deUsuarioId: r.de_usuario_id,
  paraUsuarioId: r.para_usuario_id,
  itemOferecidoId: r.item_oferecido_id,
  mensagem: r.mensagem,
  status: r.status,
  criadaEm: r.criada_em,
});

function falhar(contexto: string, erro: { message: string } | null): never {
  throw new Error(`Supabase (${contexto}): ${erro?.message ?? 'resposta vazia'}`);
}

export function criarRepositorioSupabase(url: string, chave: string): Repositorio {
  // Sem Supabase Auth no protótipo: não há sessão para persistir.
  const db: SupabaseClient = createClient(url, chave, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  return {
    fonte: 'supabase',

    async listarUsuarios() {
      const { data, error } = await db.from('usuarios').select('*');
      if (error) falhar('listar usuários', error);
      return (data as UsuarioRow[]).map(paraUsuario);
    },

    async obterUsuarioPorEmail(email) {
      const { data, error } = await db
        .from('usuarios')
        .select('*')
        .ilike('email', email.trim())
        .maybeSingle();
      if (error) falhar('buscar usuário', error);
      return data ? paraUsuario(data as UsuarioRow) : null;
    },

    async criarUsuario(dados: NovoUsuario) {
      const { data, error } = await db.from('usuarios').insert(dados).select().single();
      if (error || !data) falhar('criar usuário', error);
      return paraUsuario(data as UsuarioRow);
    },

    async listarItens() {
      const { data, error } = await db
        .from('itens')
        .select('*')
        .order('criado_em', { ascending: false });
      if (error) falhar('listar itens', error);
      return (data as ItemRow[]).map(paraItem);
    },

    async criarItem(dados: NovoItem) {
      const linha: any = {
        dono_id: dados.donoId,
        titulo: dados.titulo,
        descricao: dados.descricao,
        categoria: dados.categoria,
        condicao: dados.condicao,
        modalidade: dados.modalidade,
        aceita_em_troca: dados.aceitaEmTroca,
        cor: dados.cor,
        campus: dados.campus,
        imagem: (dados as Item).imagem ?? null,
      };
      const { data, error } = await db.from('itens').insert(linha).select().single();
      if (error || !data) falhar('criar item', error);
      return paraItem(data as ItemRow);
    },

    async listarPropostasDoUsuario(usuarioId) {
      const { data, error } = await db
        .from('propostas')
        .select('*')
        .or(`de_usuario_id.eq.${usuarioId},para_usuario_id.eq.${usuarioId}`)
        .order('criada_em', { ascending: false });
      if (error) falhar('listar propostas', error);
      return (data as PropostaRow[]).map(paraProposta);
    },

    async criarProposta(dados: NovaProposta) {
      const linha = {
        item_id: dados.itemId,
        de_usuario_id: dados.deUsuarioId,
        para_usuario_id: dados.paraUsuarioId,
        item_oferecido_id: dados.itemOferecidoId,
        mensagem: dados.mensagem,
      };
      const { data, error } = await db.from('propostas').insert(linha).select().single();
      if (error || !data) falhar('criar proposta', error);
      return paraProposta(data as PropostaRow);
    },

    async atualizarStatusProposta(id, status) {
      const { data, error } = await db
        .from('propostas')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error || !data) falhar('atualizar proposta', error);
      const proposta = paraProposta(data as PropostaRow);

      if (status === 'aceita') {
        const r1 = await db.from('itens').update({ status: 'reservado' }).eq('id', proposta.itemId);
        if (r1.error) falhar('reservar item', r1.error);
        const r2 = await db
          .from('propostas')
          .update({ status: 'recusada' })
          .eq('item_id', proposta.itemId)
          .eq('status', 'pendente')
          .neq('id', id);
        if (r2.error) falhar('recusar propostas concorrentes', r2.error);
      }
      return proposta;
    },
  };
}
