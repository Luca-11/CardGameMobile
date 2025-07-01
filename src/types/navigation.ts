import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CardPack } from "./database";

export type RootTabParamList = {
  Shop: undefined;
  Collection: undefined;
  Decks: undefined;
  Profile: undefined;
};

export type ShopStackParamList = {
  ShopMain: undefined;
  PackDetails: { pack: CardPack };
  PackOpening: { purchaseId: string };
};

export type CollectionStackParamList = {
  CollectionMain: undefined;
  CardDetails: { cardId: string };
  PackOpening: { purchaseId: string };
};

export type DecksStackParamList = {
  DecksList: undefined;
  DeckEdit: { deckId: string };
};

export type ShopNavigationProp = NativeStackNavigationProp<ShopStackParamList>;
export type PackDetailsNavigationProp = NativeStackNavigationProp<
  ShopStackParamList,
  "PackDetails"
>;
export type PackOpeningNavigationProp = NativeStackNavigationProp<
  ShopStackParamList,
  "PackOpening"
>;
export type PackDetailsRouteProp = RouteProp<ShopStackParamList, "PackDetails">;

export type PackOpeningRouteProp = RouteProp<
  CollectionStackParamList,
  "PackOpening"
>;
