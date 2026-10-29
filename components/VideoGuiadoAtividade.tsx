import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { View } from "react-native";
import type {
  AtividadeAprovada,
  MidiasAtividade,
} from "../services/atividades/atividades";
import { Text } from "./TextoAcessivel";
import { estilos as e } from "./estilos";

export function VideoGuiadoAtividade({
  atividade,
  midias,
}: {
  atividade: AtividadeAprovada;
  midias: MidiasAtividade;
}) {
  const player = useVideoPlayer(midias.videoGuiado),
    estado = useEvent(player, "statusChange", { status: player.status });
  return (
    <View style={e.card}>
      <Text style={e.label}>Vídeo guiado aprovado</Text>
      <VideoView
        accessibilityLabel={`Vídeo guiado de ${atividade.nome}`}
        contentFit="contain"
        nativeControls
        player={player}
        playsInline
        style={{ width: "100%", height: 240, borderRadius: 12 }}
      />
      {estado.status === "error" && (
        <Text style={e.body} accessibilityLiveRegion="polite">
          O vídeo não está disponível agora. Não substitua esta falha por uma
          atividade diferente sem orientação da equipe.
        </Text>
      )}
    </View>
  );
}
