import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { criarRepositorio } from '@/services';
import type {
  Item,
  NovoItem,
  NovoUsuario,
  Proposta,
  Repositorio,
  StatusProposta,
  Usuario,
} from '@/services/types';

export const EMAIL_DEMO = 'demo@trocaja.app';

interface EstadoApp {
  fonte: Repositorio['fonte'];
  usuario: Usuario | null;
  usuarios: Record<string, Usuario>;
  itens: Item[];
  propostas: Proposta[];
  carregando: boolean;
  erro: string | null;
  entrar(email: string): Promise<boolean>;
  cadastrar(dados: NovoUsuario): Promise<void>;
  sair(): void;
  recarregar(): Promise<void>;
  anunciar(dados: Omit<NovoItem, 'donoId' | 'campus'>): Promise<Item>;
  proporTroca(item: Item, itemOferecidoId: string | null, mensagem: string): Promise<Proposta>;
  responderProposta(id: string, status: StatusProposta): Promise<void>;
}

const Contexto = createContext<EstadoApp | null>(null);

export function AppProvider({
  children,
  repositorio,
}: {
  children: ReactNode;
  /** Permite injetar um repositório (ex.: mock sem latência nos testes). */
  repositorio?: Repositorio;
}) {
  const [repo] = useState<Repositorio>(() => repositorio ?? criarRepositorio());
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [usuarios, setUsuarios] = useState<Record<string, Usuario>>({});
  const [itens, setItens] = useState<Item[]>([]);
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregarDados = useCallback(
    async (u: Usuario) => {
      setCarregando(true);
      setErro(null);
      try {
        const [listaUsuarios, listaItens, listaPropostas] = await Promise.all([
          repo.listarUsuarios(),
          repo.listarItens(),
          repo.listarPropostasDoUsuario(u.id),
        ]);
        setUsuarios(Object.fromEntries(listaUsuarios.map((x) => [x.id, x])));
        setItens(listaItens);
        setPropostas(listaPropostas);
      } catch (e) {
        setErro(e instanceof Error ? e.message : 'Não foi possível carregar os dados.');
      } finally {
        setCarregando(false);
      }
    },
    [repo],
  );

  const entrar = useCallback(
    async (email: string) => {
      const encontrado = await repo.obterUsuarioPorEmail(email);
      if (!encontrado) return false;
      setUsuario(encontrado);
      await carregarDados(encontrado);
      return true;
    },
    [repo, carregarDados],
  );

  const cadastrar = useCallback(
    async (dados: NovoUsuario) => {
      const existente = await repo.obterUsuarioPorEmail(dados.email);
      const u = existente ?? (await repo.criarUsuario(dados));
      setUsuario(u);
      await carregarDados(u);
    },
    [repo, carregarDados],
  );

  const sair = useCallback(() => {
    setUsuario(null);
    setPropostas([]);
  }, []);

  const recarregar = useCallback(async () => {
    if (usuario) await carregarDados(usuario);
  }, [usuario, carregarDados]);

  const anunciar = useCallback<EstadoApp['anunciar']>(
    async (dados) => {
      if (!usuario) throw new Error('Entre na sua conta para anunciar.');
      const item = await repo.criarItem({ ...dados, donoId: usuario.id, campus: usuario.campus } as any);
      setItens((atual) => [item, ...atual]);
      return item;
    },
    [repo, usuario],
  );

  const proporTroca = useCallback<EstadoApp['proporTroca']>(
    async (item, itemOferecidoId, mensagem) => {
      if (!usuario) throw new Error('Entre na sua conta para propor uma troca.');
      const proposta = await repo.criarProposta({
        itemId: item.id,
        deUsuarioId: usuario.id,
        paraUsuarioId: item.donoId,
        itemOferecidoId,
        mensagem: mensagem.trim(),
      });
      setPropostas((atual) => [proposta, ...atual]);
      return proposta;
    },
    [repo, usuario],
  );

  const responderProposta = useCallback(
    async (id: string, status: StatusProposta) => {
      await repo.atualizarStatusProposta(id, status);
      if (usuario) await carregarDados(usuario);
    },
    [repo, usuario, carregarDados],
  );

  const valor = useMemo<EstadoApp>(
    () => ({
      fonte: repo.fonte,
      usuario,
      usuarios,
      itens,
      propostas,
      carregando,
      erro,
      entrar,
      cadastrar,
      sair,
      recarregar,
      anunciar,
      proporTroca,
      responderProposta,
    }),
    [repo.fonte, usuario, usuarios, itens, propostas, carregando, erro, entrar, cadastrar, sair, recarregar, anunciar, proporTroca, responderProposta],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useApp(): EstadoApp {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error('useApp precisa estar dentro de <AppProvider>.');
  return ctx;
}

/** Usuário logado garantido (para telas que só existem após o login). */
export function useUsuario(): Usuario {
  const { usuario } = useApp();
  if (!usuario) throw new Error('Nenhum usuário logado.');
  return usuario;
}
