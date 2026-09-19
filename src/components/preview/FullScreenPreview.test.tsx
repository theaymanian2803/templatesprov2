import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import FullScreenPreview from "./FullScreenPreview";

const renderPreview = (onClose = vi.fn()) =>
  render(
    <FullScreenPreview url="https://example.com" title="My Template" open onClose={onClose} />,
  );

describe("FullScreenPreview", () => {
  it("groups the new-tab and close controls together in a single dock", () => {
    renderPreview();

    const dock = screen.getByRole("group", { name: "Contrôles de l'aperçu" });
    expect(dock).toBeInTheDocument();
    expect(
      within(dock).getByRole("link", { name: "Ouvrir dans un nouvel onglet" }),
    ).toBeInTheDocument();
    expect(
      within(dock).getByRole("button", { name: "Fermer l'aperçu" }),
    ).toBeInTheDocument();
  });

  it("hides the dock and leaves a restore pill when the hide control is clicked", () => {
    renderPreview();

    fireEvent.click(screen.getByRole("button", { name: "Masquer les contrôles" }));

    expect(screen.queryByRole("group", { name: "Contrôles de l'aperçu" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Afficher les contrôles" })).toBeInTheDocument();
  });

  it("restores the dock from the restore pill", () => {
    renderPreview();

    fireEvent.click(screen.getByRole("button", { name: "Masquer les contrôles" }));
    fireEvent.click(screen.getByRole("button", { name: "Afficher les contrôles" }));

    expect(screen.getByRole("group", { name: "Contrôles de l'aperçu" })).toBeInTheDocument();
  });

  it("closes the preview when the close button is clicked", () => {
    const onClose = vi.fn();
    renderPreview(onClose);

    fireEvent.click(screen.getByRole("button", { name: "Fermer l'aperçu" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows a discovery flash on the dock while the controls are visible", () => {
    renderPreview();

    expect(screen.getByTestId("dock-ping")).toBeInTheDocument();
  });

  it("hides the discovery flash when the controls are hidden", () => {
    renderPreview();

    fireEvent.click(screen.getByRole("button", { name: "Masquer les contrôles" }));

    expect(screen.queryByTestId("dock-ping")).not.toBeInTheDocument();
  });

  it("closes the preview on Escape", () => {
    const onClose = vi.fn();
    renderPreview(onClose);

    fireEvent.keyDown(window, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});