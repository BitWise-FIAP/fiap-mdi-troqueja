import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Botao } from '@/components/Botao';
import { Campo } from '@/components/Campo';
import { Chip } from '@/components/Chip';
import { Txt } from '@/components/Txt';
import { useApp } from '@/store/AppContext';
import { cores, espaco, raio } from '@/theme/tokens';
import { categorias, condicoes, coresDeItem } from '@/utils/catalogo';
import { semErros, validarAnuncio, type ErrosAnuncio, type FormAnuncio } from '@/utils/validacao';

const vazio: FormAnuncio = {
  titulo: '',
  descricao: '',
  categoria: null,
  condicao: null,
  modalidade: 'troca',
  aceitaEmTroca: '',
};

export default function Anunciar() {
  const { anunciar } = useApp();
  const [form, setForm] = useState<FormAnuncio>(vazio);
  const [erros, setErros] = useState<ErrosAnuncio>({});
  const [enviando, setEnviando] = useState(false);
  const [falha, setFalha] = useState<string | null>(null);
  const [imagem, setImagem] = useState<string | null>(null);

  const definir = <K extends keyof FormAnuncio>(campo: K, valor: FormAnuncio[K]) => {
    setForm((f) => ({ ...f, [campo]: valor }));
    // O erro some assim que a pessoa mexe no campo; volta a validar no pr��ximo envio.
    setErros((e) => ({ ...e, [campo]: undefined }));
  };

  const escolherImagem = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiss��o necess��ria', '�� preciso permitir acesso �� galeria para escolher uma imagem.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setImagem(result.assets[0].uri);
    }
  };

  async function publicar() {
    const v = validarAnuncio(form);
    setErros(v);
    if (!semErros(v) || !form.categoria || !form.condicao) return;
    setEnviando(true);
    setFalha(null);
    try {
      const item = await anunciar({
        titulo: form.titulo.trim(),
        descricao: form.descricao.trim(),
        categoria: form.categoria,
        condicao: form.condicao,
        modalidade: form.modalidade,
        aceitaEmTroca: form.modalidade === 'troca' ? form.aceitaEmTroca.trim() : '',
        cor: coresDeItem[Math.floor(Math.random() * coresDeItem.length)],
        imagem: imagem || null,
      } as any);
      setForm(vazio);
      setImagem(null);
      router.push({ pathname: '/item/[id]', params: { id: item.id } });
    } catch (e) {
      setFalha(e instanceof Error ? e.message : 'Nǜo foi poss��vel publicar o anǧncio.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.tela}>
      <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
        <View style={styles.grupo}>
          <Txt variante="rotulo">Você quer</Txt>
          <View style={styles.linha}>
            <Chip rotulo="Trocar" ativo={form.modalidade === 'troca'} onPress={() => definir('modalidade', 'troca')} />
            <Chip rotulo="Doar" ativo={form.modalidade === 'doacao'} onPress={() => definir('modalidade', 'doacao')} />
          </View>
        </View>

        <Campo
          rotulo="Título"
          value={form.titulo}
          onChangeText={(t) => definir('titulo', t)}
          erro={erros.titulo}
          placeholder="Ex.: Calculadora HP 12C"
          maxLength={60}
        />

        <View style={styles.grupo}>
          <Txt variante="rotulo">Categoria</Txt>
          <View style={styles.linhaQuebra}>
            {categorias.map((c) => (
              <Chip key={c.id} rotulo={c.rotulo} icone={c.icone} ativo={form.categoria === c.id} onPress={() => definir('categoria', c.id)} />
            ))}
          </View>
          {erros.categoria && <Txt variante="pequeno" cor={cores.vermelhoErro}>{erros.categoria}</Txt>}
        </View>

        <View style={styles.grupo}>
          <Txt variante="rotulo">Condição</Txt>
          <View style={styles.linha}>
            {condicoes.map((c) => (
              <Chip key={c.id} rotulo={c.rotulo} ativo={form.condicao === c.id} onPress={() => definir('condicao', c.id)} />
            ))}
          </View>
          {erros.condicao && <Txt variante="pequeno" cor={cores.vermelhoErro}>{erros.condicao}</Txt>}
        </View>

        <Campo
          rotulo="Descri��ǜo"
          value={form.descricao}
          onChangeText={(t) => definir('descricao', t)}
          erro={erros.descricao}
          multiline
          placeholder="Estado de conserva��ǜo, defeitos, onde retirar."
        />

        <View style={styles.grupo}>
          <Txt variante="rotulo">Imagem</Txt>
          <TouchableOpacity style={styles.botaoImagem} onPress={escolherImagem}>
            <Txt variante="corpoForte" cor="#E83D84">
              {imagem ? 'Trocar imagem da galeria' : 'Escolher imagem do iPhone'}
            </Txt>
          </TouchableOpacity>
          {imagem ? <Image source={{ uri: imagem }} style={styles.preview} resizeMode="cover" /> : null}
        </View>

        {form.modalidade === 'troca' && (
          <Campo
            rotulo="O que vocǦ aceita em troca"
            value={form.aceitaEmTroca}
            onChangeText={(t) => definir('aceitaEmTroca', t)}
            erro={erros.aceitaEmTroca}
            placeholder="Ex.: Livro de F��sica I"
          />
        )}

        {falha && <Txt variante="pequeno" cor={cores.vermelhoErro}>{falha}</Txt>}
        <Botao titulo="Publicar anǧncio" onPress={publicar} carregando={enviando} testID="botao-publicar" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.papel },
  conteudo: { padding: espaco.lg, gap: espaco.lg, paddingBottom: espaco.xxl },
  grupo: { gap: espaco.sm },
  linha: { flexDirection: 'row', gap: espaco.sm },
  linhaQuebra: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.sm },
  botaoImagem: {
    borderWidth: 1,
    borderColor: '#E83D84',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  preview: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    backgroundColor: '#eee',
  },
});
