import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Avatar } from '@/components/Avatar';
import { Botao } from '@/components/Botao';
import { ItemArte } from '@/components/ItemArte';
import { SeloModalidade } from '@/components/Selos';
import { Txt } from '@/components/Txt';
import { Vazio } from '@/components/Vazio';
import { useApp } from '@/store/AppContext';
import { cores, espaco, raio } from '@/theme/tokens';
import { rotuloCategoria, rotuloCondicao, rotuloStatusItem } from '@/utils/catalogo';
import { tempoRelativo } from '@/utils/formatadores';

export default function DetalheItem() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { itens, usuarios, usuario, propostas } = useApp();
  const item = itens.find((i) => i.id === id);

  if (!item || !usuario) {
    return (
      <Vazio
        icone="tag-off-outline"
        titulo="Anúncio não encontrado"
        texto="Ele pode ter sido removido pelo dono. Volte para a lista e escolha outro."
        acao={{ titulo: 'Voltar para o início', onPress: () => router.replace('/inicio') }}
      />
    );
  }

  const dono = usuarios[item.donoId];
  const ehMeu = item.donoId === usuario.id;
  const jaPropus = propostas.some(
    (p) => p.itemId === item.id && p.deUsuarioId === usuario.id && p.status === 'pendente',
  );
  const disponivel = item.status === 'disponivel';

  return (
    <View style={styles.tela}>
      <Stack.Screen options={{ title: rotuloCategoria(item.categoria) }} />
      <ScrollView contentContainerStyle={styles.conteudo}>
        {item.imagem ? (
          <Image source={{ uri: item.imagem }} style={styles.imagemDestaque} resizeMode="cover" />
        ) : (
          <ItemArte item={item} tamanho={96} style={styles.arte} />
        )}

        <View style={styles.linha}>
          <SeloModalidade modalidade={item.modalidade} />
          <Txt variante="pequeno" cor={cores.grafiteSuave}>
            {rotuloCondicao(item.condicao)} · {tempoRelativo(item.criadoEm)}
          </Txt>
        </View>

        <Txt variante="titulo">{item.titulo}</Txt>
        <Txt>{item.descricao}</Txt>

        {item.modalidade === 'troca' && (
          <View style={styles.quadro}>
            <Txt variante="rotulo">Aceita em troca</Txt>
            <Txt>{item.aceitaEmTroca}</Txt>
          </View>
        )}

        {!disponivel && (
          <View style={[styles.quadro, { borderColor: cores.rosaMarcaTexto }]}>
            <Txt variante="rotulo">{rotuloStatusItem[item.status]}</Txt>
            <Txt cor={cores.grafiteSuave}>Este item já tem uma troca combinada.</Txt>
          </View>
        )}

        {dono && (
          <View style={styles.dono}>
            <Avatar nome={dono.nome} tamanho={48} />
            <View style={{ flex: 1 }}>
              <Txt variante="corpoForte">{ehMeu ? 'Você' : dono.nome}</Txt>
              <Txt variante="pequeno" cor={cores.grafiteSuave}>
                {dono.curso} · {item.campus}
              </Txt>
              <Txt variante="pequeno" cor={cores.grafiteSuave}>
                {dono.trocasConcluidas} {dono.trocasConcluidas === 1 ? 'troca concluída' : 'trocas concluídas'}
              </Txt>
            </View>
          </View>
        )}
      </ScrollView>

      {!ehMeu && disponivel && (
        <View style={styles.acao}>
          <Botao
            testID="botao-propor"
            titulo={jaPropus ? 'Proposta enviada' : item.modalidade === 'troca' ? 'Propor troca' : 'Pedir doação'}
            desabilitado={jaPropus}
            onPress={() => router.push({ pathname: '/propor/[id]', params: { id: item.id } })}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.papel },
  conteudo: { padding: espaco.lg, gap: espaco.md, paddingBottom: espaco.xxl },
  arte: { height: 200, borderWidth: 1.5, borderColor: cores.grafite },
  imagemDestaque: { width: '100%', height: 220, borderRadius: raio.campo, borderWidth: 1.5, borderColor: cores.grafite, backgroundColor: cores.linha },
  linha: { flexDirection: 'row', alignItems: 'center', gap: espaco.md },
  quadro: {
    borderWidth: 1.5,
    borderColor: cores.marcaTexto,
    backgroundColor: cores.branco,
    borderRadius: raio.campo,
    padding: espaco.md,
    gap: espaco.xs,
  },
  dono: {
    flexDirection: 'row',
    gap: espaco.md,
    alignItems: 'center',
    paddingTop: espaco.md,
    borderTopWidth: 1,
    borderTopColor: cores.linha,
    marginTop: espaco.sm,
  },
  acao: { padding: espaco.lg, borderTopWidth: 1, borderTopColor: cores.linha, backgroundColor: cores.branco },
});
