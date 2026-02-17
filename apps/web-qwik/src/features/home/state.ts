export type HomeUiState = {
  mobileMenuOpen: boolean;
  activeServiceIndex: number;
  activeCleaningMode: "standard" | "deep";
};

export const createHomeUiState = (): HomeUiState => ({
  mobileMenuOpen: false,
  activeServiceIndex: 0,
  activeCleaningMode: "standard",
});
