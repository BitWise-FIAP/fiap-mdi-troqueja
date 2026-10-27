import AsyncStorage from '@react-native-async-storage/async-storage';
import itensJson from '@/data/mock/itens.json';
import propostasJson from '@/data/mock/propostas.json';
import usuariosJson from '@/data/mock/usuarios.json';
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

const CHAVE_ITENS = 'trocaja:itens';

interface OpcoesMock {
  /** Atraso artificial em ms, para simular rede. Use 0 nos testes. */
  latencia?: number;
}

const esperar = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

let contador = 0;
const gerarId = (prefixo: string) => `${prefixo}${Date.now().toString(36)}${(contador++).toString(36)}`;

/**
 * Repositório em memória a partir dos JSON em src/data/mock.
 * Cada instância começa com uma cópia limpa dos dados, então nada
 * vaza entre testes e um reload do app volta ao estado inicial.
 */
export function criarRepositorioMock({ latencia = 250 }: OpcoesMock = {}): Repositorio {
  const usuarios: Usuario[] = structuredClone(usuariosJson) as Usuario[];
  const itens: Item[] = structuredClone(itensJson) as Item[];
  const propostas: Proposta[] = structuredClone(propostasJson) as Proposta[];

  const carregarItensSalvos = async (): Promise<Item[]> => {
    try {
      const dados = await AsyncStorage.getItem(CHAVE_ITENS);
      if (!dados) return [];
      const lista = JSON.parse(dados) as Item[];
      return Array.isArray(lista) ? lista : [];
    } catch {
      return [];
    }
  };

  const salvarItens = async (lista: Item[]) => {
    try {
      await AsyncStorage.setItem(CHAVE_ITENS, JSON.stringify(lista));
    } catch {}
  };

  const rede = async <T>(valor: T): Promise<T> => {
    if (latencia > 0) await esperar(latencia);
    return structuredClone(valor);
  };

  return {
    fonte: 'mock',

    listarUsuarios: () => rede(usuarios),

    obterUsuarioPorEmail: (email) =>
      rede(usuarios.find((u) => u.email.toLowerCase() === email.trim().toLowerCase()) ?? null),

    async criarUsuario(dados: NovoUsuario) {
      const novo: Usuario = { ...dados, id: gerarId('u'), trocasConcluidas: 0 };
      usuarios.push(novo);
      return rede(novo);
    },

    async listarItens() {
      const salvos = await carregarItensSalvos();
      const todos = [...itens, ...salvos];
      const mapa = new Map<string, Item>();
      for (const it of todos) {
        mapa.set(it.id, it);
      }
      const lista = Array.from(mapa.values()).sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
      if (latencia > 0) await esperar(latencia);
      return structuredClone(lista);
    },

    async criarItem(dados: NovoItem) {
      const novo: Item = {
        ...dados,
        imagem: (dados as Item).imagem ?? null,
        id: gerarId('i'),
        status: 'disponivel',
        criadoEm: new Date().toISOString(),
      };
      itens.push(novo);
      const salvos = await carregarItensSalvos();
      const semDuplicado = salvos.filter((s) => s.id !== novo.id);
      await salvarItens([...semDuplicado, novo]);
      if (latencia > 0) await esperar(latencia);
      return structuredClone(novo);
    },

    listarPropostasDoUsuario: (usuarioId) =>
      rede(
        propostas
          .filter((p) => p.deUsuarioId === usuarioId || p.paraUsuarioId === usuarioId)
          .sort((a, b) => b.criadaEm.localeCompare(a.criadaEm)),
      ),

    async criarProposta(dados: NovaProposta) {
      const nova: Proposta = {
        ...dados,
        id: gerarId('p'),
        status: 'pendente',
        criadaEm: new Date().toISOString(),
      };
      propostas.push(nova);
      return rede(nova);
    },

    async atualizarStatusProposta(id: string, status: StatusProposta) {
      const proposta = propostas.find((p) => p.id === id);
      if (!proposta) throw new Error(`Proposta ${id} não encontrada`);
      proposta.status = status;

      if (status === 'aceita') {
        // O item fica reservado e as outras propostas pendentes para ele são recusadas.
        const item = itens.find((i) => i.id === proposta.itemId);
        if (item) item.status = 'reservado';
        propostas
          .filter((p) => p.itemId === proposta.itemId && p.id !== id && p.status === 'pendente')
          .forEach((p) => (p.status = 'recusada'));
      }
      return rede(proposta);
    },
  };
}
