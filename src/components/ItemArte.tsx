import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, StyleSheet, View, type ViewStyle } from 'react-native';
import type { Item } from '@/services/types';
import { iconeCategoria } from '@/utils/catalogo';
import { cores, raio } from '@/theme/tokens';

export function ItemArte({ item, tamanho = 64, style }: { item: Item; tamanho?: number; style?: ViewStyle }) {
  const temImagem = !!item.imagem;

  if (temImagem) {
    const largura = (tamanho as number) * 2.5;
    const altura = tamanho as number;
    return (
      <Image
        source={{ uri: item.imagem as string }}
        style={[styles.imagem, { width: largura, height: altura }, style as any]}
        resizeMode="cover"
      />
    );
  }

  return (
    <View style={[styles.base, { backgroundColor: item.cor }, style]}>
      <MaterialCommunityIcons
        name={iconeCategoria(item.categoria) as keyof typeof MaterialCommunityIcons.glyphMap}
        size={tamanho}
        color={cores.grafite}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: raio.campo, alignItems: 'center', justifyContent: 'center' },
  imagem: { borderRadius: raio.campo, backgroundColor: cores.linha },
});
