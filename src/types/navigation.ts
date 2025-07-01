import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CardPack } from "./database";

export type RootStackParamList = {
  MainTabs: undefined;
  PackDetails: { pack: CardPack };
  PackOpening: { purchaseId: string };
  Game: { matchId?: string };
  Decks: undefined;
  DeckBuilder: { deckId?: string };
  Profile: undefined;
  Settings: undefined;
};

export type PackDetailsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "PackDetails"
>;

export type PackOpeningNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "PackOpening"
>;

export type PackDetailsRouteProp = RouteProp<RootStackParamList, "PackDetails">;
export type PackOpeningRouteProp = RouteProp<RootStackParamList, "PackOpening">;
