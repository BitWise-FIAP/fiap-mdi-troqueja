export type Categoria = 'livros' | 'eletronicos' | 'material' | 'roupas' | 'moveis' | 'outros';
export type Condicao = 'novo' | 'seminovo' | 'usado';
export type Modalidade = 'troca' | 'doacao';
export type StatusItem = 'disponivel' | 'reservado' | 'trocado';
export type StatusProposta = 'pendente' | 'aceita' | 'recusada' | 'cancelada';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  curso: string;
  campus: string;
  trocasConcluidas: number;
}

export interface Item {
  id: string;
  donoId: string;
  titulo: string;
  descricao: string;
  categoria: Categoria;
  condicao: Condicao;
  modalidade: Modalidade;
  /** O que o dono aceita em troca (texto livre). Vazio em doa����es. */
  aceitaEmTroca: string;
  /** Cor de fundo da ilustra��ǜo do item (hex). */
  cor: string;
  campus: string;
  status: StatusItem;
  criadoEm: string;
  /** URI da imagem escolhida da galeria ou URL opcional. */
  imagem?: string | null;
}

export interface Proposta {
  id: string;
  itemId: string;
  deUsuarioId: string;
  paraUsuarioId: string;
  /** Item oferecido em troca; null quando é pedido de doação. */
  itemOferecidoId: string | null;
  mensagem: string;
  status: StatusProposta;
  criadaEm: string;
}

export type NovoItem = Omit<Item, 'id' | 'status' | 'criadoEm'>;
export type NovaProposta = Omit<Proposta, 'id' | 'status' | 'criadaEm'>;
export type NovoUsuario = Omit<Usuario, 'id' | 'trocasConcluidas'>;

/**
 * Contrato da camada de dados. O app só conversa com esta interface;
 * as implementações são o mock local (JSON) e o Supabase.
 */
export interface Repositorio {
  readonly fonte: 'mock' | 'supabase';
  listarUsuarios(): Promise<Usuario[]>;
  obterUsuarioPorEmail(email: string): Promise<Usuario | null>;
  criarUsuario(dados: NovoUsuario): Promise<Usuario>;
  listarItens(): Promise<Item[]>;
  criarItem(dados: NovoItem): Promise<Item>;
  listarPropostasDoUsuario(usuarioId: string): Promise<Proposta[]>;
  criarProposta(dados: NovaProposta): Promise<Proposta>;
  atualizarStatusProposta(id: string, status: StatusProposta): Promise<Proposta>;
}
